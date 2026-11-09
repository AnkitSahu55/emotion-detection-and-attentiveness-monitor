"""
main.py – FastAPI WebSocket server for facial emotion & attentiveness inference.

Endpoints:
  GET  /health       → {"status": "ok", "version": "1.0.0"}
  WS   /ws/stream    → bidirectional frame ↔ metrics stream

WebSocket protocol:
  Client → Server:  JSON { "type": "frame", "data": "<base64-jpeg>" }
  Server → Client:  JSON FaceMetrics (matches frontend TypeScript type)
  Server → Client:  JSON { "type": "error", "message": "..." }  (on error)

Run with:
  uvicorn main:app --host 0.0.0.0 --port 8765 --reload
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any

import psutil
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from inference.face_processor import FaceProcessor
from inference.metrics import MetricsTracker
from inference.emotion import extract_features, classify_emotion
from inference.attentiveness import compute_attentiveness
from models.mediapipe_indices import get_landmark_region

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Facial Emotion & Attentiveness Monitor – Inference API",
    version="1.0.0",
    description="Real-time MediaPipe FaceMesh + geometry-based emotion classification backend.",
)

# Allow frontend dev server (Vite default: 5173) and any localhost port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "1.0.0"}


# ---------------------------------------------------------------------------
# WebSocket inference endpoint
# ---------------------------------------------------------------------------
@app.websocket("/ws/stream")
async def ws_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    logger.info("WebSocket client connected: %s", websocket.client)

    processor = FaceProcessor()
    tracker = MetricsTracker()
    frame_index = 0

    try:
        while True:
            # Receive frame message
            raw = await websocket.receive_text()
            t_start = time.perf_counter()

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "Invalid JSON"}))
                continue

            if msg.get("type") != "frame":
                continue

            b64_data: str = msg.get("data", "")
            if not b64_data:
                continue

            frame_index += 1

            # --- Face mesh inference ---
            face_result = processor.process_b64_frame(b64_data)

            if not face_result.face_detected:
                # Send no-face payload so frontend can show a "no face" state
                payload = _build_no_face_payload(frame_index)
                await websocket.send_text(json.dumps(payload))
                continue

            landmarks = face_result.landmarks

            # --- Metric computation ---
            eye_metrics = tracker.update(
                landmarks,
                face_result.image_width,
                face_result.image_height,
            )

            # --- Emotion classification ---
            features = extract_features(
                landmarks,
                eye_metrics["earAvg"],
                eye_metrics["headPose"]["yaw"],
            )
            dominant_emotion, emotion_confidence, emotion_probs = classify_emotion(features)

            # --- Attentiveness scoring ---
            attentiveness = compute_attentiveness(
                perclos=eye_metrics["perclos"],
                head_yaw=eye_metrics["headPose"]["yaw"],
                head_pitch=eye_metrics["headPose"]["pitch"],
                ear_avg=eye_metrics["earAvg"],
                blink_rate_bpm=eye_metrics["blinkRateBpm"],
                dominant_emotion=dominant_emotion,
            )

            # --- Mesh points for canvas ---
            mesh_points = _build_mesh_points(landmarks)

            # --- System metrics ---
            latency_ms = round((time.perf_counter() - t_start) * 1000, 1)
            cpu_pct = round(psutil.cpu_percent(interval=None), 1)

            # --- Assemble full FaceMetrics payload ---
            payload: dict[str, Any] = {
                "timestamp": _iso_now(),
                "frameIndex": frame_index,
                "faceDetected": True,
                **eye_metrics,
                "dominantEmotion": dominant_emotion,
                "emotionConfidence": emotion_confidence,
                "emotionProbabilities": emotion_probs,
                **attentiveness,
                "cpuUtilization": cpu_pct,
                "frameLatencyMs": latency_ms,
                "fps": 0,           # Computed client-side
                "meshPoints": mesh_points,
            }

            await websocket.send_text(json.dumps(payload))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected: %s", websocket.client)
    except Exception as exc:
        logger.exception("Unexpected error in ws_stream: %s", exc)
    finally:
        processor.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _iso_now() -> str:
    """Return current UTC time as ISO-8601 string."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _build_mesh_points(landmarks: list[dict]) -> list[dict]:
    """
    Convert MediaPipe normalized landmarks to the frontend LandmarkPoint format.
    Subsamples to keep the payload manageable while preserving all named regions.
    """
    points = []
    total = len(landmarks)

    for i, lm in enumerate(landmarks):
        # Include all named-region points + every 3rd mesh point
        region = get_landmark_region(i)
        if region == "mesh" and i % 3 != 0:
            continue

        points.append({
            "x": round(lm["x"], 4),
            "y": round(lm["y"], 4),
            "z": round(lm["z"], 4),
            "id": i,
            "region": region,
        })

    return points


def _build_no_face_payload(frame_index: int) -> dict:
    """Minimal payload when no face is detected in frame."""
    return {
        "timestamp": _iso_now(),
        "frameIndex": frame_index,
        "faceDetected": False,
        "earLeft": 0.0,
        "earRight": 0.0,
        "earAvg": 0.0,
        "isBlinking": False,
        "blinkCount": 0,
        "blinkRateBpm": 0,
        "perclos": 0.0,
        "headPose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0},
        "attentivenessScore": 0,
        "attentivenessState": "distracted",
        "dominantEmotion": "Neutral",
        "emotionConfidence": 0.0,
        "emotionProbabilities": {
            "Neutral": 1.0, "Engaged": 0.0, "Focused": 0.0,
            "Inquisitive": 0.0, "Surprised": 0.0, "Fatigued": 0.0,
            "Smiling": 0.0, "Confused": 0.0,
        },
        "valence": 0.0,
        "arousal": 0.0,
        "cpuUtilization": 0.0,
        "frameLatencyMs": 0.0,
        "fps": 0,
        "meshPoints": [],
    }
