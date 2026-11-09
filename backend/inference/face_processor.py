"""
face_processor.py – MediaPipe FaceLandmarker (Tasks API) wrapper.

Uses the MediaPipe 1.0+ Tasks API (mediapipe.tasks.python.vision.FaceLandmarker)
which replaced the deprecated mp.solutions.face_mesh in mediapipe >=1.0.0.

Model: face_landmarker.task (downloaded to models/face_landmarker.task)
Output: 478 normalized landmarks per face (468 mesh + 10 iris with refine=True).
"""

from __future__ import annotations

import base64
import logging
import os
from dataclasses import dataclass

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import RunningMode

logger = logging.getLogger(__name__)

# Path to the bundled model file (relative to backend/)
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "face_landmarker.task")
_MODEL_PATH = os.path.normpath(_MODEL_PATH)


@dataclass
class FaceResult:
    """Raw output from MediaPipe for a single frame."""
    landmarks: list[dict]       # [{x, y, z, idx}, ...] in normalized 0..1 coords
    image_width: int
    image_height: int
    face_detected: bool


class FaceProcessor:
    """
    Wraps MediaPipe FaceLandmarker (Tasks API) for frame-by-frame inference.

    Thread-safety: NOT thread-safe. Each WebSocket connection should
    instantiate its own FaceProcessor.
    """

    def __init__(self) -> None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                f"FaceLandmarker model not found at: {_MODEL_PATH}\n"
                "Run: python -c \"import urllib.request; urllib.request.urlretrieve("
                "'https://storage.googleapis.com/mediapipe-models/face_landmarker/"
                "face_landmarker/float16/latest/face_landmarker.task', "
                "'models/face_landmarker.task')\""
            )

        base_options = mp_python.BaseOptions(model_asset_path=_MODEL_PATH)
        options = mp_vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        self._landmarker = mp_vision.FaceLandmarker.create_from_options(options)
        logger.info("FaceProcessor initialized with Tasks API (model: %s)", _MODEL_PATH)

    def process_b64_frame(self, b64_data: str) -> FaceResult:
        """
        Decode a base64-encoded JPEG and run MediaPipe FaceLandmarker.

        Args:
            b64_data: Raw base64 string (with or without data-URI prefix).

        Returns:
            FaceResult with normalized landmark coordinates.
        """
        # Strip data-URI prefix if present
        if "," in b64_data:
            b64_data = b64_data.split(",", 1)[1]

        try:
            img_bytes = base64.b64decode(b64_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as exc:
            logger.warning("Frame decode failed: %s", exc)
            return FaceResult(landmarks=[], image_width=640, image_height=480, face_detected=False)

        if bgr is None:
            return FaceResult(landmarks=[], image_width=640, image_height=480, face_detected=False)

        h, w = bgr.shape[:2]

        # Convert BGR → RGB for MediaPipe
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)

        # Wrap in MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        try:
            result = self._landmarker.detect(mp_image)
        except Exception as exc:
            logger.warning("FaceLandmarker inference failed: %s", exc)
            return FaceResult(landmarks=[], image_width=w, image_height=h, face_detected=False)

        if not result.face_landmarks:
            return FaceResult(landmarks=[], image_width=w, image_height=h, face_detected=False)

        # Take first face only
        face_lms = result.face_landmarks[0]
        landmarks = [
            {"x": lm.x, "y": lm.y, "z": lm.z, "idx": i}
            for i, lm in enumerate(face_lms)
        ]

        return FaceResult(
            landmarks=landmarks,
            image_width=w,
            image_height=h,
            face_detected=True,
        )

    def close(self) -> None:
        self._landmarker.close()
        logger.info("FaceProcessor closed")

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()
