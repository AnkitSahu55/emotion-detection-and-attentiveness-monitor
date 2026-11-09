"""
attentiveness.py – Composite attentiveness scorer.

Combines:
  - PERCLOS (eye closure percentage) → fatigue signal
  - Head pose yaw / pitch → gaze off-screen signal
  - Blink rate → abnormal frequency signal
  - EAR (eye openness) → alertness signal

Output:
  - attentivenessScore: int 0–100
  - attentivenessState: 'optimal' | 'alert' | 'distracted' | 'fatigued'
  - valence: float -1.0 to +1.0 (pleasantness)
  - arousal: float 0.0 to 1.0 (activation level)
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

# PERCLOS: sustained drowsiness starts at 15%, severe at 30%+
PERCLOS_DROWSY_MILD = 15.0
PERCLOS_DROWSY_SEVERE = 30.0

# Head yaw: > 20° means looking significantly off-screen
YAW_DISTRACTED_MILD = 15.0
YAW_DISTRACTED_SEVERE = 25.0

# Head pitch: > 10° down or > 15° up is off-task
PITCH_PENALTY_DOWN = 10.0
PITCH_PENALTY_UP = 15.0

# Blink rate: normal 12–20 bpm; < 8 or > 30 is abnormal
BLINK_RATE_MIN_NORMAL = 8
BLINK_RATE_MAX_NORMAL = 30

# Attentiveness state thresholds
STATE_OPTIMAL = 85
STATE_ALERT = 65
STATE_DISTRACTED = 45


def compute_attentiveness(
    perclos: float,
    head_yaw: float,
    head_pitch: float,
    ear_avg: float,
    blink_rate_bpm: int,
    dominant_emotion: str,
) -> dict:
    """
    Compute attentiveness score and state.

    Args:
        perclos: Rolling % of eye closure frames (0–100)
        head_yaw: Head left/right rotation in degrees (absolute value used)
        head_pitch: Head up/down tilt in degrees
        ear_avg: Current average EAR value
        blink_rate_bpm: Blink rate in blinks per minute
        dominant_emotion: Current dominant emotion string

    Returns:
        Dict with attentivenessScore, attentivenessState, valence, arousal.
    """
    score = 100.0

    # --- PERCLOS penalty ---
    if perclos >= PERCLOS_DROWSY_SEVERE:
        score -= 35
    elif perclos >= PERCLOS_DROWSY_MILD:
        score -= 15 + (perclos - PERCLOS_DROWSY_MILD) * 1.0
    elif perclos >= 8.0:
        score -= (perclos - 8.0) * 0.5

    # --- Head yaw penalty ---
    yaw_abs = abs(head_yaw)
    if yaw_abs >= YAW_DISTRACTED_SEVERE:
        score -= 25
    elif yaw_abs >= YAW_DISTRACTED_MILD:
        score -= 10 + (yaw_abs - YAW_DISTRACTED_MILD) * 1.5

    # --- Head pitch penalty ---
    if head_pitch > PITCH_PENALTY_DOWN:
        # Nodding down (falling asleep)
        score -= (head_pitch - PITCH_PENALTY_DOWN) * 1.5
    elif head_pitch < -PITCH_PENALTY_UP:
        # Looking up
        score -= (abs(head_pitch) - PITCH_PENALTY_UP) * 0.8

    # --- Blink rate penalty ---
    if blink_rate_bpm < BLINK_RATE_MIN_NORMAL and blink_rate_bpm > 0:
        # Under-blinking → staring / screen fatigue
        score -= (BLINK_RATE_MIN_NORMAL - blink_rate_bpm) * 0.5
    elif blink_rate_bpm > BLINK_RATE_MAX_NORMAL:
        # Over-blinking → fatigue / irritation
        score -= (blink_rate_bpm - BLINK_RATE_MAX_NORMAL) * 0.4

    # --- EAR bonus (eyes wide open = more alert) ---
    if ear_avg > 0.30:
        score += min(5, (ear_avg - 0.30) * 20)

    # --- Emotion-based modifier ---
    emotion_modifiers = {
        "Focused":    +3,
        "Engaged":    +2,
        "Inquisitive": +1,
        "Neutral":     0,
        "Smiling":    +2,
        "Surprised":  -1,
        "Confused":   -3,
        "Fatigued":   -8,
    }
    score += emotion_modifiers.get(dominant_emotion, 0)

    # Clamp score
    score = max(0.0, min(100.0, score))

    # --- State classification ---
    if score >= STATE_OPTIMAL:
        state = "optimal"
    elif score >= STATE_ALERT:
        state = "alert"
    elif score >= STATE_DISTRACTED:
        state = "distracted"
    else:
        state = "fatigued"

    # --- Valence (-1 to +1): pleasantness estimate ---
    valence_map = {
        "Smiling": 0.85,
        "Engaged": 0.55,
        "Focused": 0.25,
        "Inquisitive": 0.20,
        "Neutral": 0.0,
        "Surprised": -0.10,
        "Confused": -0.30,
        "Fatigued": -0.55,
    }
    valence = valence_map.get(dominant_emotion, 0.0)

    # --- Arousal (0 to 1): activation/energy level ---
    arousal_map = {
        "Surprised": 0.90,
        "Engaged": 0.75,
        "Inquisitive": 0.65,
        "Smiling": 0.60,
        "Focused": 0.50,
        "Neutral": 0.35,
        "Confused": 0.40,
        "Fatigued": 0.12,
    }
    arousal = arousal_map.get(dominant_emotion, 0.35)
    # Modulate arousal by perclos
    arousal *= max(0.3, 1.0 - perclos / 100)

    return {
        "attentivenessScore": round(score),
        "attentivenessState": state,
        "valence": round(valence, 2),
        "arousal": round(arousal, 2),
    }
