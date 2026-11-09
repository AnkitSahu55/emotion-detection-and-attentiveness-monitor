"""
metrics.py – Biometric metric computation from raw MediaPipe landmarks.

Computes:
  - EAR (Eye Aspect Ratio) per eye
  - Blink detection (threshold + consecutive-frame hysteresis)
  - PERCLOS (30-second rolling window % of eye closure)
  - Head Pose (yaw / pitch / roll via cv2.solvePnP)
  - Blink rate (blinks-per-minute from rolling 60-second counter)
"""

from __future__ import annotations

import math
import time
from collections import deque
from typing import Optional

import cv2
import numpy as np

from models.mediapipe_indices import (
    LEFT_EYE_EAR,
    RIGHT_EYE_EAR,
    HEAD_POSE_LANDMARKS,
    HEAD_POSE_3D_POINTS,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EAR_BLINK_THRESHOLD = 0.22       # Below this → eye is closed
EAR_BLINK_CONSEC_FRAMES = 2      # Min consecutive closed frames to register a blink
PERCLOS_WINDOW_SEC = 30          # Rolling window for PERCLOS calculation
BLINK_RATE_WINDOW_SEC = 60       # Rolling window for blink-rate (BPM)


class MetricsTracker:
    """
    Stateful per-session metric tracker.

    Must be instantiated once per WebSocket connection and kept alive
    for the duration of the session.
    """

    def __init__(self) -> None:
        # Blink state
        self._ear_below_thresh_count: int = 0
        self._currently_blinking: bool = False
        self._blink_count: int = 0

        # Blink timestamps for rate calculation
        self._blink_timestamps: deque[float] = deque()

        # PERCLOS – stores (timestamp, is_closed) pairs
        self._perclos_history: deque[tuple[float, bool]] = deque()

        # Focal length placeholder – set on first frame
        self._focal_length: Optional[float] = None
        self._camera_center: Optional[tuple[float, float]] = None

        # 3D model points for PnP
        self._model_3d = np.array(HEAD_POSE_3D_POINTS, dtype=np.float64)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def update(
        self,
        landmarks: list[dict],
        image_width: int,
        image_height: int,
    ) -> dict:
        """
        Compute all metrics for a single frame.

        Args:
            landmarks: Normalized [0..1] x/y/z landmark dicts from FaceProcessor.
            image_width / image_height: Pixel dimensions of the source frame.

        Returns:
            Dict with EAR values, blink state, PERCLOS, and head pose.
        """
        now = time.monotonic()

        # --- EAR ---
        ear_left = self._compute_ear(landmarks, LEFT_EYE_EAR)
        ear_right = self._compute_ear(landmarks, RIGHT_EYE_EAR)
        ear_avg = (ear_left + ear_right) / 2.0

        # --- Blink ---
        is_blink_frame = ear_avg < EAR_BLINK_THRESHOLD
        is_blinking, just_blinked = self._update_blink_state(is_blink_frame, now)
        if just_blinked:
            self._blink_timestamps.append(now)

        # Trim blink timestamps older than the rate window
        while self._blink_timestamps and (now - self._blink_timestamps[0]) > BLINK_RATE_WINDOW_SEC:
            self._blink_timestamps.popleft()

        blink_rate_bpm = int(
            (len(self._blink_timestamps) / BLINK_RATE_WINDOW_SEC) * 60
        )

        # --- PERCLOS ---
        self._perclos_history.append((now, ear_avg < EAR_BLINK_THRESHOLD))
        # Trim to window
        while self._perclos_history and (now - self._perclos_history[0][0]) > PERCLOS_WINDOW_SEC:
            self._perclos_history.popleft()

        if self._perclos_history:
            closed_count = sum(1 for _, closed in self._perclos_history if closed)
            perclos = round((closed_count / len(self._perclos_history)) * 100, 1)
        else:
            perclos = 0.0

        # --- Head Pose ---
        yaw, pitch, roll = self._compute_head_pose(landmarks, image_width, image_height)

        return {
            "earLeft": round(ear_left, 3),
            "earRight": round(ear_right, 3),
            "earAvg": round(ear_avg, 3),
            "isBlinking": is_blinking,
            "blinkCount": self._blink_count,
            "blinkRateBpm": blink_rate_bpm,
            "perclos": perclos,
            "headPose": {
                "yaw": round(yaw, 1),
                "pitch": round(pitch, 1),
                "roll": round(roll, 1),
            },
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _get_lm(landmarks: list[dict], idx: int) -> tuple[float, float]:
        """Return (x, y) normalized coords for a landmark by index."""
        lm = landmarks[idx]
        return lm["x"], lm["y"]

    @staticmethod
    def _dist(a: tuple[float, float], b: tuple[float, float]) -> float:
        return math.hypot(a[0] - b[0], a[1] - b[1])

    def _compute_ear(self, landmarks: list[dict], indices: list[int]) -> float:
        """
        Eye Aspect Ratio = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
        Uses 6 eye landmark indices: [p1, p2, p3, p4, p5, p6].
        """
        if len(landmarks) <= max(indices):
            return 0.3  # Fallback safe value

        p1 = self._get_lm(landmarks, indices[0])
        p2 = self._get_lm(landmarks, indices[1])
        p3 = self._get_lm(landmarks, indices[2])
        p4 = self._get_lm(landmarks, indices[3])
        p5 = self._get_lm(landmarks, indices[4])
        p6 = self._get_lm(landmarks, indices[5])

        vertical1 = self._dist(p2, p6)
        vertical2 = self._dist(p3, p5)
        horizontal = self._dist(p1, p4)

        if horizontal < 1e-6:
            return 0.0

        return (vertical1 + vertical2) / (2.0 * horizontal)

    def _update_blink_state(
        self, is_ear_low: bool, now: float
    ) -> tuple[bool, bool]:
        """
        Hysteresis-based blink detector.

        Returns: (is_currently_blinking, just_completed_blink)
        """
        just_blinked = False

        if is_ear_low:
            self._ear_below_thresh_count += 1
            if self._ear_below_thresh_count >= EAR_BLINK_CONSEC_FRAMES:
                self._currently_blinking = True
        else:
            if self._currently_blinking:
                # Eye reopened → blink completed
                self._blink_count += 1
                just_blinked = True
                self._currently_blinking = False
            self._ear_below_thresh_count = 0

        return self._currently_blinking, just_blinked

    def _compute_head_pose(
        self,
        landmarks: list[dict],
        image_width: int,
        image_height: int,
    ) -> tuple[float, float, float]:
        """
        Estimate yaw, pitch, roll (in degrees) via cv2.solvePnP.

        Uses 6 anchor landmarks with a canonical 3D face model.
        Returns (yaw, pitch, roll) in degrees, clamped to realistic ranges.
        """
        if len(landmarks) < max(HEAD_POSE_LANDMARKS) + 1:
            return 0.0, 0.0, 0.0

        # Build 2D image points (pixel coords)
        img_points_2d = np.array([
            [landmarks[idx]["x"] * image_width,
             landmarks[idx]["y"] * image_height]
            for idx in HEAD_POSE_LANDMARKS
        ], dtype=np.float64)

        # Approximate camera intrinsics (no calibration file)
        if self._focal_length is None:
            self._focal_length = image_width  # focal ≈ image width heuristic
            self._camera_center = (image_width / 2.0, image_height / 2.0)

        cam_matrix = np.array([
            [self._focal_length, 0, self._camera_center[0]],
            [0, self._focal_length, self._camera_center[1]],
            [0, 0, 1],
        ], dtype=np.float64)

        dist_coeffs = np.zeros((4, 1), dtype=np.float64)  # Assume no distortion

        try:
            success, rotation_vec, _ = cv2.solvePnP(
                self._model_3d,
                img_points_2d,
                cam_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE,
            )
        except cv2.error:
            return 0.0, 0.0, 0.0

        if not success:
            return 0.0, 0.0, 0.0

        # Convert rotation vector → rotation matrix
        rot_mat, _ = cv2.Rodrigues(rotation_vec)

        # Extract Euler angles directly from rotation matrix (ZXY convention)
        pitch_raw = float(np.degrees(np.arctan2(-rot_mat[2, 0],
                          np.sqrt(rot_mat[0, 0]**2 + rot_mat[1, 0]**2))))
        yaw_raw   = float(np.degrees(np.arctan2(rot_mat[1, 0], rot_mat[0, 0])))
        roll_raw  = float(np.degrees(np.arctan2(rot_mat[2, 1], rot_mat[2, 2])))

        def _norm(angle: float) -> float:
            while angle > 180: angle -= 360
            while angle < -180: angle += 360
            return angle

        yaw   = max(-45.0, min(45.0, round(_norm(yaw_raw),   1)))
        pitch = max(-30.0, min(30.0, round(_norm(pitch_raw), 1)))
        roll  = max(-25.0, min(25.0, round(_norm(roll_raw),  1)))

        return yaw, pitch, roll
