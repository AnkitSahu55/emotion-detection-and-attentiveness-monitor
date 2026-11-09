import React, { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  FileSpreadsheet,
  Download,
  Code2,
  Search,
} from 'lucide-react';
import { generateSampleCsvRows, convertToCsvString, downloadCsvFile } from '../utils/faceLandmarkData';

export const Documentation: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<'python' | 'typescript' | 'cpp'>('python');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [csvDownloaded, setCsvDownloaded] = useState<boolean>(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadCsv = () => {
    const samples = generateSampleCsvRows(25);
    const csvContent = convertToCsvString(samples);
    downloadCsvFile('session_log_schema_sample.csv', csvContent);
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2500);
  };

  const installCode = {
    python: `# Install MediaPipe & FastAPI dependencies
pip install fastapi uvicorn mediapipe opencv-python psutil numpy`,
    typescript: `// Install Frontend packages
npm install lucide-react clsx tailwind-merge`,
    cpp: `# CMake / vcpkg Installation for C++ runtime
vcpkg install opencv4 onnxruntime fmt eigen3`,
  };

  const quickStartCode = {
    python: `# Backend WebSocket server (FastAPI + MediaPipe)
# Run with: uvicorn main:app --host 0.0.0.0 --port 8765 --reload

import cv2
import json
from fastapi import FastAPI, WebSocket
from inference.face_processor import FaceProcessor
from inference.metrics import MetricsTracker
from inference.emotion import extract_features, classify_emotion
from inference.attentiveness import compute_attentiveness

app = FastAPI()

@app.websocket("/ws/stream")
async def ws_stream(websocket: WebSocket):
    await websocket.accept()
    processor = FaceProcessor()
    tracker = MetricsTracker()
    
    while True:
        data = await websocket.receive_text()
        msg = json.loads(data)
        if msg.get("type") == "frame":
            result = processor.process_b64_frame(msg["data"])
            if result.face_detected:
                eye_metrics = tracker.update(result.landmarks, result.image_width, result.image_height)
                # Compute affective & attentiveness state...
                await websocket.send_text(json.dumps(eye_metrics))`,
    typescript: `import { useBackendStream } from './hooks/useBackendStream';

// Connect React frontend to local FastAPI WebSocket stream
export function MonitorComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { metrics, status, isUsingBackend, fps } = useBackendStream({
    isActive: true,
    videoRef,
    preset: 'focus',
  });

  return (
    <div>
      <video ref={videoRef} playsInline muted />
      <p>Attentiveness Score: {metrics.attentivenessScore} / 100</p>
      <p>Dominant Expression: {metrics.dominantEmotion}</p>
      <p>EAR: {metrics.earAvg.toFixed(3)}</p>
    </div>
  );
}`,
    cpp: `#include <opencv2/opencv.hpp>
#include <iostream>

// Native C++ client example
int main() {
    cv::VideoCapture cap(0);
    cv::Mat frame;

    std::cout << "[INFO] Camera stream started. Press Q to exit.\\n";
    while (cap.read(frame)) {
        // Run local model inference...
        if (cv::waitKey(1) == 'q') break;
    }
    return 0;
}`,
  };

  const csvSchema = [
    { name: 'timestamp_utc', type: 'String (ISO 8601)', unit: 'UTC Timestamp', desc: 'Frame capture timestamp in UTC format with millisecond resolution', sample: '2026-08-23T06:50:12.412Z' },
    { name: 'frame_id', type: 'Integer (UInt32)', unit: 'Index', desc: 'Sequential frame identifier monotonically incremented from camera stream start', sample: '1420' },
    { name: 'face_present', type: 'Boolean', unit: 'Binary flag', desc: 'Indicates whether a high-confidence face was detected in the frame', sample: 'true' },
    { name: 'ear_left', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Left eye palpebral aperture aspect ratio calculated via Euclidean landmark distance', sample: '0.318' },
    { name: 'ear_right', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Right eye palpebral aperture aspect ratio calculated via Euclidean landmark distance', sample: '0.312' },
    { name: 'ear_avg', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Harmonic mean EAR across both left and right ocular landmarks', sample: '0.315' },
    { name: 'perclos_pct', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Percentage of Eye Closure metric calculated over a rolling window', sample: '4.2' },
    { name: 'blink_event', type: 'Boolean', unit: 'Binary flag', desc: 'Transient trigger indicating that EAR breached the calibrated blink threshold (<0.22)', sample: 'false' },
    { name: 'head_yaw_deg', type: 'Float (Float32)', unit: 'Degrees (-90 to +90)', desc: 'Lateral left/right angular rotation of the head derived from 3D pose estimation', sample: '-2.4' },
    { name: 'head_pitch_deg', type: 'Float (Float32)', unit: 'Degrees (-60 to +60)', desc: 'Sagittal up/down tilt angle of the head relative to the camera optical center', sample: '+1.8' },
    { name: 'head_roll_deg', type: 'Float (Float32)', unit: 'Degrees (-45 to +45)', desc: 'Coronal lateral tilt angle of the head relative to the horizon line', sample: '-0.6' },
    { name: 'attentive_score', type: 'Integer (UInt8)', unit: 'Index (0-100)', desc: 'Computed composite attentiveness rating synthesizing gaze, EAR stability, and pose', sample: '94' },
    { name: 'dominant_emotion', type: 'String (Enum)', unit: 'Categorical Label', desc: 'Highest probability affective category (Neutral, Focused, Engaged, Confused, Fatigued, Smiling)', sample: 'Focused' },
    { name: 'emotion_confidence', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Confidence score of the dominant emotion classification vector', sample: '94.2' },
    { name: 'inference_latency_ms', type: 'Float (Float32)', unit: 'Milliseconds', desc: 'Total wall-clock duration from frame ingest to metrics generation', sample: '42.5' },
    { name: 'cpu_usage_pct', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Instantaneous CPU core utilization of the computer vision pipeline', sample: '21.4' },
  ];

  const filteredSchema = csvSchema.filter(
    (col) =>
      col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header section */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-accent-soft)',
              border: '1px solid var(--color-accent-border)',
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Developer Documentation & API Guide
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Integration Guides & Telemetry Schema
        </h2>
        <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Detailed backend WebSocket protocol documentation, sample code for Python and TypeScript client
          runtimes, and reference specifications for exported telemetry CSV files.
        </p>
      </div>

      {/* Language Selector Bar */}
      <div
        className="flex items-center justify-between p-2 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-data px-2" style={{ color: 'var(--color-text-muted)' }}>
            RUNTIME:
          </span>
          {(['python', 'typescript', 'cpp'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium uppercase font-data transition-all cursor-pointer"
              style={{
                backgroundColor:
                  activeLang === lang ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                color: activeLang === lang ? '#ffffff' : 'var(--color-text-secondary)',
                border: `1px solid ${
                  activeLang === lang ? 'var(--color-accent)' : 'var(--color-border)'
                }`,
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleCopy(installCode[activeLang], 'install')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-data font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {copiedKey === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey === 'install' ? 'Copied' : 'Copy install'}</span>
        </button>
      </div>

      {/* Installation Snippet */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#0a0d14',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2 text-[11px] font-data"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#6b7280',
          }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Installation & Package Setup</span>
          </div>
          <span>CLI</span>
        </div>
        <pre className="p-4 text-[12px] font-data leading-relaxed overflow-x-auto text-emerald-400">
          <code>{installCode[activeLang]}</code>
        </pre>
      </div>

      {/* Quickstart Implementation Code */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#0a0d14',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 text-[11px] font-data"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8',
          }}
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Implementation Sample ({activeLang})</span>
          </div>
          <button
            onClick={() => handleCopy(quickStartCode[activeLang], 'quickstart')}
            className="flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
            }}
          >
            {copiedKey === 'quickstart' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'quickstart' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 text-[12px] font-data leading-relaxed overflow-x-auto text-slate-200">
          <code>{quickStartCode[activeLang]}</code>
        </pre>
      </div>

      {/* CSV Telemetry Schema Reference */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[14px] font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FileSpreadsheet className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <span>Exported CSV Telemetry Schema (RFC 4180)</span>
            </h3>
            <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              16 data points logged per frame during monitoring sessions
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schema columns..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-[12px] font-data focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer flex-shrink-0"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
              }}
            >
              {csvDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{csvDownloaded ? 'Downloaded' : 'Download Sample CSV'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full text-left text-[12px] font-data border-collapse">
            <thead
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <tr>
                <th className="py-2.5 px-3 font-semibold">Column Name</th>
                <th className="py-2.5 px-3 font-semibold">Data Type</th>
                <th className="py-2.5 px-3 font-semibold">Unit / Range</th>
                <th className="py-2.5 px-3 font-semibold">Description</th>
                <th className="py-2.5 px-3 font-semibold">Sample Value</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {filteredSchema.map((col, idx) => (
                <tr
                  key={col.name}
                  style={{
                    borderBottom: idx < filteredSchema.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-surface-raised)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>
                    {col.name}
                  </td>
                  <td className="py-2.5 px-3">{col.type}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--color-text-muted)' }}>{col.unit}</td>
                  <td className="py-2.5 px-3 max-w-xs">{col.desc}</td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: 'var(--color-text)' }}>
                    {col.sample}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
