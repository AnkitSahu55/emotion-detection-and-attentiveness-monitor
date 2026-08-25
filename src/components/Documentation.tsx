import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Terminal, 
  FileSpreadsheet, 
  Download, 
  Code2, 
  Search
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
    python: `# Install Synthetic Precision Python SDK & OnnxRuntime SIMD
pip install synthetic-precision-cv opencv-python onnxruntime-gpu`,
    typescript: `// Install TypeScript & WASM Client Package
npm install @synthetic-precision/core @onnxruntime-web/wasm`,
    cpp: `# CMake / vcpkg Installation for C++ 20 Edge Runtime
vcpkg install opencv4 onnxruntime fmt eigen3`
  };

  const quickStartCode = {
    python: `import cv2
from precision_cv import FaceMonitor, MonitorConfig

# 1. Initialize local RAM-only monitor configuration
config = MonitorConfig(
    mesh_resolution="468_spatial_dense",
    ear_blink_threshold=0.22,
    enable_zero_network_sandbox=True,
    enable_volatile_memory_only=True
)

monitor = FaceMonitor(config)
cap = cv2.VideoCapture(0)

print("[INFO] Starting Synthetic Precision Biometric Loop...")
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # 2. Process frame entirely in volatile memory (<60ms latency)
    telemetry = monitor.process_frame(frame)

    if telemetry.face_detected:
        print(f"EAR: {telemetry.ear_avg:.3f} | "
              f"Attentiveness: {telemetry.attentive_score}/100 | "
              f"Emotion: {telemetry.dominant_emotion} ({telemetry.emotion_confidence:.1f}%) | "
              f"Head Pose: Y:{telemetry.yaw:.1f} P:{telemetry.pitch:.1f}")

    # 3. Render 468-point spatial mesh HUD
    annotated = monitor.render_hud_overlay(frame, telemetry)
    cv2.imshow("Synthetic Precision Monitor", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 4. Export session log data and flush RAM
monitor.export_session_log("session_log.csv")
cap.release()
cv2.destroyAllWindows()`,
    typescript: `import { FaceMonitorEngine } from '@synthetic-precision/core';

// 1. Initialize WebAssembly runtime engine
const monitor = new FaceMonitorEngine({
  enableSimd: true,
  earThreshold: 0.22,
  sampleRateHz: 60,
  sandboxNetwork: true,
});

await monitor.init();

// 2. Stream video frame from browser getUserMedia video element
function onVideoFrame(videoElement: HTMLVideoElement) {
  const telemetry = monitor.inferFrame(videoElement);

  console.log({
    ear: telemetry.earAvg,
    attentiveness: telemetry.attentiveScore,
    emotion: telemetry.dominantEmotion,
    fps: telemetry.fps,
    latencyMs: telemetry.inferenceLatencyMs,
  });
}`,
    cpp: `#include <precision_cv/monitor.hpp>
#include <opencv2/opencv.hpp>
#include <iostream>

int main() {
    precision::MonitorConfig config;
    config.points_topology = precision::Topology::Points468;
    config.ear_threshold = 0.22f;
    config.memory_mode = precision::MemoryMode::VolatileRingBuffer;

    precision::FaceMonitor monitor(config);
    cv::VideoCapture cap(0);
    cv::Mat frame;

    while (cap.read(frame)) {
        auto metrics = monitor.process(frame);
        if (metrics.has_face) {
            std::cout << "[TELEMETRY] EAR: " << metrics.ear_avg 
                      << " | Focus: " << metrics.attentive_score << "%\\n";
        }
    }
    return 0;
}`
  };

  const csvSchema = [
    { name: 'timestamp_utc', type: 'String (ISO 8601)', unit: 'UTC Timestamp', desc: 'Precise frame capture timestamp in UTC format with millisecond resolution', sample: '2026-08-23T06:50:12.412Z' },
    { name: 'frame_id', type: 'Integer (UInt32)', unit: 'Index', desc: 'Sequential frame identifier monotonically incremented from camera stream start', sample: '1420' },
    { name: 'face_present', type: 'Boolean', unit: 'Binary flag', desc: 'Indicates whether a high-confidence face bounding box was detected in the frame', sample: 'true' },
    { name: 'ear_left', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Left eye palpebral aperture aspect ratio calculated via Euclidean landmark distance', sample: '0.318' },
    { name: 'ear_right', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Right eye palpebral aperture aspect ratio calculated via Euclidean landmark distance', sample: '0.312' },
    { name: 'ear_avg', type: 'Float (Float32)', unit: 'Aperture Ratio', desc: 'Bilateral harmonic mean EAR across both left and right ocular landmarks', sample: '0.315' },
    { name: 'perclos_pct', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Percentage of Eye Closure metric calculated over a rolling 60-second temporal window', sample: '4.2' },
    { name: 'blink_event', type: 'Boolean', unit: 'Binary flag', desc: 'Transient trigger indicating that EAR breached the calibrated blink threshold (<0.22)', sample: 'false' },
    { name: 'head_yaw_deg', type: 'Float (Float32)', unit: 'Degrees (-90 to +90)', desc: 'Lateral left/right angular rotation of the head derived from 3D PnP pose estimation', sample: '-2.4' },
    { name: 'head_pitch_deg', type: 'Float (Float32)', unit: 'Degrees (-60 to +60)', desc: 'Sagittal up/down tilt angle of the head relative to the camera optical center', sample: '+1.8' },
    { name: 'head_roll_deg', type: 'Float (Float32)', unit: 'Degrees (-45 to +45)', desc: 'Coronal lateral tilt angle of the head relative to the horizon line', sample: '-0.6' },
    { name: 'attentive_score', type: 'Integer (UInt8)', unit: 'Index (0-100)', desc: 'Computed composite attentiveness rating synthesizing gaze vector, EAR stability, and pose', sample: '94' },
    { name: 'dominant_emotion', type: 'String (Enum)', unit: 'Categorical Label', desc: 'Highest probability affective category (Neutral, Focused, Engaged, Confused, Fatigued, Smiling)', sample: 'Focused' },
    { name: 'emotion_confidence', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Softmax probability score of the dominant emotion classification vector', sample: '94.2' },
    { name: 'inference_latency_ms', type: 'Float (Float32)', unit: 'Milliseconds', desc: 'Total wall-clock duration from frame capture ingest to HUD render completion', sample: '42.5' },
    { name: 'cpu_usage_pct', type: 'Float (Float32)', unit: 'Percentage (0-100)', desc: 'Instantaneous client CPU core utilization of the computer vision pipeline', sample: '21.4' },
  ];

  const filteredSchema = csvSchema.filter(col => 
    col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-tech mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>DEVELOPER INTEGRATION & API GUIDE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Developer Documentation & Data Schemas
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl">
          Complete SDK integration steps, syntax-highlighted code examples, and formal visual schema documentation for the exported <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 font-mono-tech">session_log.csv</code> data file.
        </p>
      </div>

      {/* Language Selector Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono-tech text-slate-500 px-3">SDK LANGUAGE:</span>
          {(['python', 'typescript', 'cpp'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase font-semibold transition-all ${
                activeLang === lang
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {lang === 'cpp' ? 'C++ 20' : lang}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono-tech text-slate-400 hidden sm:inline-block pr-3">
          LOCAL ONNX RUNTIME • ZERO-NETWORK
        </span>
      </div>

      {/* 1. Installation Steps Block */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-mono-tech">
              Installation Steps ({activeLang.toUpperCase()})
            </h3>
          </div>
          <button
            onClick={() => handleCopy(installCode[activeLang], 'install')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono-tech transition-colors"
          >
            {copiedKey === 'install' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-100 overflow-x-auto font-mono-tech text-xs leading-relaxed">
          <pre className="text-blue-300">
            <code>{installCode[activeLang]}</code>
          </pre>
        </div>
      </div>

      {/* 2. Quick Start Code Block */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-mono-tech">
              Quick Start Implementation ({activeLang.toUpperCase()})
            </h3>
          </div>
          <button
            onClick={() => handleCopy(quickStartCode[activeLang], 'quickstart')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono-tech transition-colors"
          >
            {copiedKey === 'quickstart' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-5 bg-slate-950 text-slate-100 overflow-x-auto font-mono-tech text-xs leading-relaxed">
          <pre className="text-slate-300">
            <code>{quickStartCode[activeLang]}</code>
          </pre>
        </div>
      </div>

      {/* 3. Visual Table Breaking Down session_log.csv Data Structure */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">
                session_log.csv Schema & Data Structure
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono-tech">
              RFC 4180 standard comma-separated format produced by the local volatile logging buffer
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search column..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono-tech text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Download Sample CSV */}
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono-tech font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              {csvDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Schema Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-3 px-3.5">Column Name</th>
                <th className="py-3 px-3.5">Data Type</th>
                <th className="py-3 px-3.5">Unit / Range</th>
                <th className="py-3 px-3.5">Field Description</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Sample Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredSchema.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-blue-700 whitespace-nowrap">
                    {col.name}
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-800 whitespace-nowrap">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                      {col.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">
                    {col.unit}
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-700 min-w-[280px]">
                    {col.desc}
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-900 font-semibold whitespace-nowrap">
                    <code>{col.sample}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
          <span>SHOWING {filteredSchema.length} OF {csvSchema.length} TOTAL SCHEMA COLUMNS</span>
          <span>COMPATIBILITY: Pandas, Polars, Excel, BigQuery, R, NumPy</span>
        </div>
      </div>
    </div>
  );
};
