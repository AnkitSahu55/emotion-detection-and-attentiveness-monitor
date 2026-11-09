# FaceAware: Emotion Detection & Attentiveness Monitor

A real-time, privacy-first computer vision web application for facial expression recognition and attentiveness scoring. Built with FastAPI, MediaPipe, React 19, TypeScript, and Tailwind CSS v4, styled using the **Unslop** design system.

---

## Architecture Overview

```
emotion-detection-and-attentiveness-monitor/
├── backend/
│   ├── main.py                     # FastAPI WebSocket endpoint (/ws/stream)
│   ├── inference/
│   │   ├── face_processor.py       # MediaPipe FaceLandmarker task runner
│   │   ├── metrics.py              # EAR, PERCLOS, head pose tracker
│   │   ├── emotion.py              # Geometric FACS emotion classifier
│   │   └── attentiveness.py        # Composite attentiveness scoring engine
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # CSS grid workspace shell
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Collapsible navigation sidebar
│   │   │   ├── TopBar.tsx          # Real-time status header
│   │   │   ├── LiveMonitor.tsx     # 12-col real-time monitoring HUD
│   │   │   ├── MeshCanvas.tsx      # 468-point 3D landmark canvas
│   │   │   ├── EmotionGauge.tsx    # Radial attentiveness gauge & signals
│   │   │   ├── EARWaveform.tsx     # Eye Aspect Ratio oscillogram
│   │   │   ├── CsvExportModal.tsx  # RFC 4180 telemetry CSV exporter
│   │   │   ├── AnalyticsDashboard.tsx # Session metrics & scoring bands
│   │   │   ├── SettingsPage.tsx    # Resolution & display preferences
│   │   │   ├── TechnicalSpecs.tsx  # Computer vision architecture specs
│   │   │   └── PrivacySecurity.tsx # Zero-cloud-egress verification
│   │   └── hooks/
│   │       └── useBackendStream.ts # WebSocket stream hook with fallback
│   └── package.json
└── .agents/
    └── skills/
        └── unslop/                 # Installed unslop skill for UI/UX quality control
```

---

## Key Features

- **468-Point 3D Face Mesh**: Continuous 3D facial coordinate regression normalized to facial bounds.
- **Biometric Attentiveness Scoring**: Real-time Eye Aspect Ratio (EAR) computation, PERCLOS drowsiness metric, and 6-DoF head pose estimation (yaw, pitch, roll).
- **8-Class Expression Signals**: Geometry-derived indicators for Neutral, Engaged, Focused, Inquisitive, Surprised, Fatigued, Smiling, and Confused states.
- **Airgapped Privacy**: Zero cloud transmission. All frames and coordinates remain strictly within volatile local RAM.
- **Offline Simulation Fallback**: Smooth 60 FPS synthetic simulation mode when camera or Python backend is disconnected.
- **RFC 4180 CSV Export**: Complete telemetry logging with microsecond timestamps and raw facial metrics.

---

## Quickstart

### 1. Start the Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8765 --reload
```

Health check available at: `http://localhost:8765/health`

### 2. Start the Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Design System

Designed according to the [Unslop](https://github.com/heydamir/unslop) specification:
- Single **Ink** neutral ramp (`#f5f7fa` surface / `#0b0d14` sidebar).
- Strict 4px vertical rhythm and standardized row heights (36px nav, 12px card radius, 8px controls).
- Tabular figures (`tabular-nums`) across all telemetry and data points.
- WCAG 2.2 AA compliant contrast (≥4.5:1 on all text roles).
