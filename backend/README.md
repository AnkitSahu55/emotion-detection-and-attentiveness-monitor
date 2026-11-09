# FaceAware Backend

Real-time facial analysis server using MediaPipe FaceLandmarker.

## Requirements

- Python 3.10+
- No GPU required — XNNPACK-accelerated CPU inference

## Quick Start

**Windows:**
```
start.bat
```

**Manual:**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8765 --reload
```

The model file (`models/face_landmarker.task`, ~3.6 MB) is auto-downloaded on first run if missing.

## API

| Endpoint | Description |
|---|---|
| `GET /health` | Health check → `{"status": "ok"}` |
| `WS /ws/stream` | Main inference WebSocket |

## WebSocket Protocol

**Client → Server** (JSON per frame):
```json
{ "type": "frame", "data": "<base64-jpeg>" }
```

**Server → Client** (JSON `FaceMetrics`):
```json
{
  "faceDetected": true,
  "earLeft": 0.312,
  "earRight": 0.318,
  "earAvg": 0.315,
  "isBlinking": false,
  "blinkCount": 12,
  "blinkRateBpm": 16,
  "perclos": 4.2,
  "headPose": { "yaw": 2.1, "pitch": -1.3, "roll": 0.5 },
  "attentivenessScore": 92,
  "attentivenessState": "optimal",
  "dominantEmotion": "Focused",
  "emotionConfidence": 88.4,
  "emotionProbabilities": { "Focused": 0.88, ... },
  "cpuUtilization": 22.4,
  "frameLatencyMs": 38.2,
  "meshPoints": [{ "x": 0.5, "y": 0.48, "z": 0.1, "id": 0, "region": "mesh" }, ...]
}
```

## Architecture

```
inference/
  face_processor.py   MediaPipe FaceLandmarker wrapper (Tasks API)
  metrics.py          EAR, blink detection, PERCLOS, head pose (PnP)
  emotion.py          Geometry-based classifier → 8 custom emotions
  attentiveness.py    Composite attentiveness scorer (0–100)
models/
  mediapipe_indices.py  Landmark index constants
  face_landmarker.task  MediaPipe model bundle (auto-downloaded)
```
