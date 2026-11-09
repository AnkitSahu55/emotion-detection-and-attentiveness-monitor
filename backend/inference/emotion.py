"""
emotion.py – Geometry-based emotion classifier.

Maps to the app's 8 custom emotion classes:
  Neutral, Engaged, Focused, Inquisitive, Surprised, Fatigued, Smiling, Confused

Uses landmark geometry features extracted from MediaPipe:
  - Mouth openness ratio
  - Smile ratio (corner lift)
  - Brow raise (left + right)
  - Brow furrow (inner brow distance narrowing)
  - EAR (passed in from metrics tracker)
  - Head pose yaw (looking away → Distracted/Confused)

No external model files required – fully deterministic geometry rules.
"""

from __future__ import annotations

import math

from models.mediapipe_indices import (
    MOUTH_LEFT_CORNER,
    MOUTH_RIGHT_CORNER,
    UPPER_LIP_CENTER,
    LOWER_LIP_CENTER,
    LEFT_BROW_INNER,
    LEFT_BROW_OUTER,
    LEFT_BROW_PEAK,
    RIGHT_BROW_INNER,
    RIGHT_BROW_OUTER,
    RIGHT_BROW_PEAK,
    LEFT_EYE_UPPER,
    LEFT_EYE_LOWER,
    RIGHT_EYE_UPPER,
    RIGHT_EYE_LOWER,
    FACE_LEFT,
    FACE_RIGHT,
    NOSE_BASE,
)

EMOTION_LABELS = [
    "Neutral", "Engaged", "Focused", "Inquisitive",
    "Surprised", "Fatigued", "Smiling", "Confused",
]


def _dist(a: dict, b: dict) -> float:
    return math.hypot(a["x"] - b["x"], a["y"] - b["y"])


def _lm(landmarks: list[dict], idx: int) -> dict:
    return landmarks[idx]


def extract_features(
    landmarks: list[dict],
    ear_avg: float,
    head_yaw: float,
) -> dict:
    """
    Extract normalized facial geometry features for classification.

    All distances are normalized by face width so results are
    scale-invariant across different camera distances.
    """
    if len(landmarks) < 460:
        return _default_features()

    # Face width for normalization
    face_width = _dist(_lm(landmarks, FACE_LEFT), _lm(landmarks, FACE_RIGHT))
    if face_width < 1e-6:
        face_width = 1.0

    # --- Mouth openness ---
    mouth_open = _dist(
        _lm(landmarks, UPPER_LIP_CENTER),
        _lm(landmarks, LOWER_LIP_CENTER)
    ) / face_width

    # --- Smile ratio: corner height vs lip center ---
    # Positive = corners higher than lip center → smile
    mouth_center_y = (
        _lm(landmarks, UPPER_LIP_CENTER)["y"] +
        _lm(landmarks, LOWER_LIP_CENTER)["y"]
    ) / 2.0
    left_corner_y = _lm(landmarks, MOUTH_LEFT_CORNER)["y"]
    right_corner_y = _lm(landmarks, MOUTH_RIGHT_CORNER)["y"]
    # In image coords: lower y = higher on screen
    smile_ratio = (mouth_center_y - (left_corner_y + right_corner_y) / 2.0) / face_width

    # Mouth width
    mouth_width = _dist(
        _lm(landmarks, MOUTH_LEFT_CORNER),
        _lm(landmarks, MOUTH_RIGHT_CORNER)
    ) / face_width

    # --- Brow raise (left + right) ---
    left_brow_eye_dist = (
        _lm(landmarks, LEFT_EYE_UPPER)["y"] - _lm(landmarks, LEFT_BROW_PEAK)["y"]
    ) / face_width

    right_brow_eye_dist = (
        _lm(landmarks, RIGHT_EYE_UPPER)["y"] - _lm(landmarks, RIGHT_BROW_PEAK)["y"]
    ) / face_width

    brow_raise = (left_brow_eye_dist + right_brow_eye_dist) / 2.0

    # --- Brow furrow: inner brow horizontal distance ---
    inner_brow_dist = _dist(
        _lm(landmarks, LEFT_BROW_INNER),
        _lm(landmarks, RIGHT_BROW_INNER)
    ) / face_width

    # --- Brow asymmetry ---
    brow_asymmetry = abs(left_brow_eye_dist - right_brow_eye_dist) / face_width

    return {
        "mouth_open": mouth_open,
        "smile_ratio": smile_ratio,
        "mouth_width": mouth_width,
        "brow_raise": brow_raise,
        "inner_brow_dist": inner_brow_dist,
        "brow_asymmetry": brow_asymmetry,
        "ear_avg": ear_avg,
        "head_yaw_abs": abs(head_yaw),
    }


def _default_features() -> dict:
    return {
        "mouth_open": 0.0, "smile_ratio": 0.0, "mouth_width": 0.3,
        "brow_raise": 0.08, "inner_brow_dist": 0.3, "brow_asymmetry": 0.0,
        "ear_avg": 0.30, "head_yaw_abs": 0.0,
    }


def classify_emotion(features: dict) -> tuple[str, float, dict[str, float]]:
    """
    Rule-based emotion classifier.

    Returns:
        dominant_emotion: str
        confidence: float (0–100)
        probabilities: dict mapping emotion → probability (sums to ~1.0)
    """
    mouth_open = features["mouth_open"]
    smile_ratio = features["smile_ratio"]
    brow_raise = features["brow_raise"]
    inner_brow_dist = features["inner_brow_dist"]
    brow_asymmetry = features["brow_asymmetry"]
    ear = features["ear_avg"]
    yaw = features["head_yaw_abs"]

    # --- Compute raw scores for each emotion ---
    scores: dict[str, float] = {}

    # Surprised: wide eyes (high EAR), open mouth, raised brows, wide inner brow dist
    scores["Surprised"] = (
        max(0, (ear - 0.32) * 8)
        + max(0, mouth_open * 6)
        + max(0, (brow_raise - 0.08) * 10)
    )

    # Smiling: high smile_ratio, wider mouth width, slight brow raise
    scores["Smiling"] = (
        max(0, smile_ratio * 12)
        + max(0, (features["mouth_width"] - 0.28) * 6)
    )

    # Fatigued: low EAR, neutral brows, neutral mouth
    fatigue_ear_signal = max(0, (0.28 - ear) * 10)
    scores["Fatigued"] = fatigue_ear_signal + max(0, -smile_ratio * 4)

    # Confused: head tilt / yaw, furrowed brows (narrow inner brow dist),
    #           slight asymmetry, mouth not open
    scores["Confused"] = (
        max(0, (yaw - 8) * 0.4)
        + max(0, (0.28 - inner_brow_dist) * 8)
        + brow_asymmetry * 6
    )

    # Inquisitive: slight brow raise on one side, moderate yaw, slight head tilt
    scores["Inquisitive"] = (
        max(0, (brow_raise - 0.09) * 6)
        + brow_asymmetry * 5
        + max(0, (yaw - 4) * 0.3)
    )

    # Engaged: elevated brow raise, moderate mouth open (like talking), low fatigue
    scores["Engaged"] = (
        max(0, (brow_raise - 0.07) * 5)
        + max(0, mouth_open * 3)
        + max(0, (ear - 0.25) * 3)
    )

    # Focused: low yaw, good EAR, neutral mouth, slight brow lowering
    scores["Focused"] = (
        max(0, (ear - 0.24) * 4)
        + max(0, (10 - yaw) * 0.3)
        + max(0, -smile_ratio * 2)
    )

    # Neutral: everything near baseline, no strong signal
    max_non_neutral = max(
        scores["Surprised"], scores["Smiling"], scores["Fatigued"],
        scores["Confused"], scores["Inquisitive"], scores["Engaged"], scores["Focused"]
    )
    scores["Neutral"] = max(0, 2.0 - max_non_neutral * 0.5)

    # Normalize to probabilities
    total = sum(scores.values())
    if total < 1e-6:
        total = 1.0
    probs = {k: round(v / total, 4) for k, v in scores.items()}

    # Dominant emotion
    dominant = max(probs, key=lambda k: probs[k])
    confidence = round(probs[dominant] * 100, 1)

    # Ensure confidence is at least somewhat credible
    confidence = max(45.0, min(98.0, confidence))

    return dominant, confidence, probs
