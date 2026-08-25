import React, { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Layers, 
  Eye, 
  Database
} from 'lucide-react';

export const TechnicalSpecs: React.FC = () => {
  const [selectedLandmarkLayer, setSelectedLandmarkLayer] = useState<string>('all');
  const [simEarValue, setSimEarValue] = useState<number>(0.28);
  const simThreshold = 0.22;

  const landmarkLayers = [
    { id: 'all', name: 'Full Topology', count: 468, desc: 'Complete 3D geometric face reconstruction' },
    { id: 'contour', name: 'Facial Oval Contour', count: 36, desc: 'Jawline, temples, and chin boundary curvature' },
    { id: 'eyes', name: 'Periorbital Eyes', count: 32, desc: 'Superior and inferior palpebral margins' },
    { id: 'iris', name: 'Iris & Pupil Radii', count: 10, desc: 'Gaze direction vector and pupil centers' },
    { id: 'lips', name: 'Labial / Lips Complex', count: 28, desc: 'Vermilion border, oral commissures, and aperture' },
    { id: 'nose', name: 'Nasal Dorsum & Tip', count: 20, desc: 'Bridge depth and alar base anchor nodes' },
    { id: 'tesselation', name: 'Surface Tesselation', count: 338, desc: 'Triangulated planar surface lattice vertices' },
  ];

  const pipelineStages = [
    { name: 'Camera Frame Ingest & Buffer', time: 8.4, pct: 17.5, desc: 'Local WebRTC / V4L2 raw YUV-to-RGB ring buffer ingest' },
    { name: 'Region of Interest (ROI) Anchor', time: 6.2, pct: 12.9, desc: 'Lightweight BlazeFace bounding box locator' },
    { name: '468-Point Spatial Mesh Regression', time: 21.8, pct: 45.4, desc: 'Dense 3D landmark tensor inference via WASM SIMD' },
    { name: 'EAR, Gaze & Affective Extraction', time: 7.1, pct: 14.8, desc: 'Geometric Euclidean vector calculation & emotion logits' },
    { name: 'Canvas Render & UI Telemetry Flush', time: 4.5, pct: 9.4, desc: 'Hardware-accelerated 2D/WebGL overlay compositing' },
  ];

  const totalLatency = pipelineStages.reduce((acc, s) => acc + s.time, 0).toFixed(1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-tech mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>TECHNICAL SPECIFICATIONS & BENCHMARK SUITE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          High-Precision Edge Computer Vision Architecture
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl">
          Modular, data-rich breakdown of computational complexity, coordinate topologies, micro-saccadic tracking algorithms, and low-latency pipeline performance.
        </p>
      </div>

      {/* 4-Card Modular Technical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========================================================
            CARD 1: 468-Point Spatial Mesh
        ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">468-Point Spatial Mesh</h3>
                  <span className="text-xs font-mono-tech text-slate-500">3D Volumetric Topology</span>
                </div>
              </div>
              <span className="text-xs font-mono-tech font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                468 VERTICES
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Continuous 3D coordinate regression $(X, Y, Z)$ normalized to facial bounds. Accurately maps subtle micro-expressions, facial muscle activation units (FACS), and depth contours without requiring stereo depth sensors.
            </p>

            {/* Interactive Landmark Layer breakdown */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-mono-tech text-slate-500 uppercase font-semibold block">
                Anatomical Cluster Allocation:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
                {landmarkLayers.slice(1, 5).map(layer => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLandmarkLayer(layer.id)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedLandmarkLayer === layer.id
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900'
                        : 'bg-slate-50 border-slate-200/70 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[11px] truncate">{layer.name}</span>
                      <strong className="text-blue-600">{layer.count} pts</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
            <span>COORDINATE SPACE: [-1.0, +1.0]³</span>
            <span className="text-blue-600 font-semibold">TENSOR: Float32[468, 3]</span>
          </div>
        </div>

        {/* ========================================================
            CARD 2: Real-time EAR Tracking
        ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Real-Time EAR Tracking</h3>
                  <span className="text-xs font-mono-tech text-slate-500">Eye Aspect Ratio & PERCLOS</span>
                </div>
              </div>
              <span className="text-xs font-mono-tech font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                60 Hz SAMPLING
              </span>
            </div>

            {/* Formula Block */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 font-mono-tech text-xs">
              <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">
                Euclidean Ratio Formulation:
              </span>
              <div className="text-slate-900 font-bold bg-white px-3 py-2 rounded-lg border border-slate-200 text-center text-xs sm:text-sm text-blue-700">
                EAR = ( ||p₂ - p₆|| + ||p₃ - p₅|| ) / ( 2 · ||p₁ - p₄|| )
              </div>
            </div>

            {/* Interactive Threshold & Blink Test */}
            <div className="space-y-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-slate-600">Simulate EAR Input:</span>
                <span className="font-bold text-slate-900">{simEarValue.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={simEarValue}
                onChange={e => setSimEarValue(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between text-xs font-mono-tech pt-1">
                <span className="text-slate-500">State:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  simEarValue < simThreshold
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {simEarValue < simThreshold ? 'BLINK DETECTED (CLOSED)' : 'PALPEBRAL FISSURE OPEN'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
            <span>PERCLOS ALGORITHM: Drowsiness &gt; 15%</span>
            <span className="text-blue-600 font-semibold">CALIBRATED: 0.22 THRESH</span>
          </div>
        </div>

        {/* ========================================================
            CARD 3: <30% CPU Utilization
        ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">&lt;30% CPU Utilization</h3>
                  <span className="text-xs font-mono-tech text-slate-500">SIMD-Accelerated WebAssembly</span>
                </div>
              </div>
              <span className="text-xs font-mono-tech font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                21.4% AVG LOAD
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Engineered with 128-bit SIMD vectorization and WebAssembly runtime to maintain zero thermal throttling on standard ultraportable laptops.
            </p>

            {/* Benchmark Comparison Matrix */}
            <div className="space-y-2 mb-4 font-mono-tech text-xs">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                Runtime Benchmark Comparison (Dual-Core 2.4GHz):
              </span>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700">Native C++ / AVX2</span>
                  <span className="text-slate-900 font-bold">8.4% CPU</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-blue-900 font-medium">Synthetic Precision WASM (Current)</span>
                  <span className="text-blue-700 font-bold">21.4% CPU</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400">Pure JavaScript Baseline</span>
                  <span className="text-rose-600 font-bold">68.2% CPU</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
            <span>MEM FOOTPRINT: ~38 MB RAM</span>
            <span className="text-emerald-600 font-semibold">EFFICIENCY: 3.2x vs JS</span>
          </div>
        </div>

        {/* ========================================================
            CARD 4: <60ms Frame Latency
        ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">&lt;60ms Frame Latency</h3>
                  <span className="text-xs font-mono-tech text-slate-500">Sub-Millisecond Pipeline</span>
                </div>
              </div>
              <span className="text-xs font-mono-tech font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {totalLatency} ms TOTAL
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Deterministic frame processing pipeline guaranteeing instant bio-telemetry updates for driver monitoring, proctoring, and UX attentiveness tracking.
            </p>

            {/* Pipeline Step Progress Visualizer */}
            <div className="space-y-2 mb-4">
              <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden border border-slate-200">
                <div style={{ width: '17.5%' }} className="bg-blue-300" title="Ingest: 8.4ms" />
                <div style={{ width: '12.9%' }} className="bg-blue-400" title="ROI: 6.2ms" />
                <div style={{ width: '45.4%' }} className="bg-blue-600" title="Mesh Regression: 21.8ms" />
                <div style={{ width: '14.8%' }} className="bg-blue-500" title="Affective Inference: 7.1ms" />
                <div style={{ width: '9.4%' }} className="bg-blue-700" title="Render: 4.5ms" />
              </div>

              <div className="space-y-1.5 pt-1">
                {pipelineStages.map((stage, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono-tech text-slate-600">
                    <span className="truncate pr-2">{idx + 1}. {stage.name}</span>
                    <strong className="text-slate-900">{stage.time} ms</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
            <span>BUDGET CEILING: 60.0 ms</span>
            <span className="text-blue-600 font-semibold">HEADROOM: 12.0 ms MARGIN</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Architectural Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Biometric Extraction Pipeline Architecture Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <tr>
                <th className="py-2.5 px-3">Sub-System</th>
                <th className="py-2.5 px-3">Algorithmic Model</th>
                <th className="py-2.5 px-3">Input Shape</th>
                <th className="py-2.5 px-3">Output Space</th>
                <th className="py-2.5 px-3">Quantization</th>
                <th className="py-2.5 px-3">Execution Kernel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Face Detector</td>
                <td className="py-2.5 px-3">BlazeFace FPN</td>
                <td className="py-2.5 px-3">128 × 128 × 3</td>
                <td className="py-2.5 px-3">Bounding Box [4] + 6 Keypoints</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">FP16</td>
                <td className="py-2.5 px-3">WebGL / WASM SIMD</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">3D Mesh Regressor</td>
                <td className="py-2.5 px-3">MobileNetV3 Backbone</td>
                <td className="py-2.5 px-3">192 × 192 × 3</td>
                <td className="py-2.5 px-3">468 Spatial Vertices (X,Y,Z)</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">INT8 / FP16</td>
                <td className="py-2.5 px-3">WASM Vectorized Kernel</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Iris Gaze Estimator</td>
                <td className="py-2.5 px-3">Periorbital Regressor</td>
                <td className="py-2.5 px-3">64 × 64 × 3 (per eye)</td>
                <td className="py-2.5 px-3">10 Pupil/Iris Contour Coordinates</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">FP16</td>
                <td className="py-2.5 px-3">SIMD Micro-kernel</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Affective State Engine</td>
                <td className="py-2.5 px-3">Dense Geometric MLP</td>
                <td className="py-2.5 px-3">52 FACS Distance Ratios</td>
                <td className="py-2.5 px-3">7 Emotion Logits + Valence/Arousal</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">FP32</td>
                <td className="py-2.5 px-3">In-Memory Ephemeral Buffer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
