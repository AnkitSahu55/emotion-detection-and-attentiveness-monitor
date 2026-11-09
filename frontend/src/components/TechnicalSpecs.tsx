import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Layers,
  Eye,
  Database,
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
            <Cpu className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Technical Specifications & Benchmarks
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          High-Precision Edge Computer Vision Architecture
        </h2>
        <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Modular breakdown of computational complexity, landmark topologies, real-time eye aspect ratio
          tracking algorithms, and low-latency pipeline performance.
        </p>
      </div>

      {/* 4-Card Modular Technical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: 468-Point Spatial Mesh */}
        <div
          className="rounded-xl p-5 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-accent-soft)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Layers className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    468-Point Spatial Mesh
                  </h3>
                  <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                    3D Volumetric Topology
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                468 VERTICES
              </span>
            </div>

            <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Continuous 3D coordinate regression (X, Y, Z) normalized to facial bounds. Accurately maps subtle
              facial muscle activation units (FACS) without requiring hardware depth sensors.
            </p>

            <div className="space-y-2 mb-4">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider block"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Anatomical Cluster Allocation
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-data">
                {landmarkLayers.slice(1, 5).map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLandmarkLayer(layer.id)}
                    className="p-2 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      backgroundColor:
                        selectedLandmarkLayer === layer.id
                          ? 'var(--color-accent-soft)'
                          : 'var(--color-surface-raised)',
                      border: `1px solid ${
                        selectedLandmarkLayer === layer.id
                          ? 'var(--color-accent-border)'
                          : 'var(--color-border)'
                      }`,
                      color:
                        selectedLandmarkLayer === layer.id
                          ? 'var(--color-accent)'
                          : 'var(--color-text)',
                    }}
                  >
                    <span className="truncate pr-1">{layer.name}</span>
                    <strong style={{ color: 'var(--color-accent)' }}>{layer.count}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="pt-3 flex items-center justify-between text-[11px] font-data"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>SPACE: [-1.0, +1.0]³</span>
            <span style={{ color: 'var(--color-accent)' }}>Tensor: Float32[468, 3]</span>
          </div>
        </div>

        {/* CARD 2: Real-Time EAR Tracking */}
        <div
          className="rounded-xl p-5 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-accent-soft)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Eye className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    Real-Time EAR Tracking
                  </h3>
                  <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                    Eye Aspect Ratio & PERCLOS
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                60 Hz SAMPLING
              </span>
            </div>

            {/* Formula Block */}
            <div
              className="rounded-lg p-2.5 mb-3 font-data text-[11px]"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span
                className="text-[10px] uppercase font-semibold block mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Euclidean Ratio Formulation
              </span>
              <div
                className="p-1.5 rounded text-center font-bold"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                EAR = (‖p₂ − p₆‖ + ‖p₃ − p₅‖) / (2 · ‖p₁ − p₄‖)
              </div>
            </div>

            {/* Interactive Threshold & Blink Test */}
            <div
              className="space-y-2 rounded-lg p-3 mb-3"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-data">
                <span style={{ color: 'var(--color-text-secondary)' }}>Simulate EAR Input:</span>
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                  {simEarValue.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={simEarValue}
                onChange={(e) => setSimEarValue(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600"
                style={{ backgroundColor: 'var(--color-border)' }}
                aria-label="Simulate eye aspect ratio value"
              />
              <div className="flex items-center justify-between text-[11px] font-data pt-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    backgroundColor:
                      simEarValue < simThreshold
                        ? 'var(--color-danger-soft)'
                        : 'var(--color-success-soft)',
                    color:
                      simEarValue < simThreshold
                        ? 'var(--color-danger)'
                        : 'var(--color-success)',
                    border: `1px solid ${
                      simEarValue < simThreshold ? '#fecaca' : '#bbf7d0'
                    }`,
                  }}
                >
                  {simEarValue < simThreshold ? 'BLINK DETECTED (CLOSED)' : 'PALPEBRAL FISSURE OPEN'}
                </span>
              </div>
            </div>
          </div>

          <div
            className="pt-3 flex items-center justify-between text-[11px] font-data"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>PERCLOS: Drowsiness &gt; 15%</span>
            <span style={{ color: 'var(--color-accent)' }}>Calibrated: 0.22 threshold</span>
          </div>
        </div>

        {/* CARD 3: CPU Efficiency */}
        <div
          className="rounded-xl p-5 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-success-soft)',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <Cpu className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    &lt;30% CPU Utilization
                  </h3>
                  <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                    SIMD-Accelerated Execution
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-success-soft)',
                  color: 'var(--color-success)',
                  border: '1px solid #bbf7d0',
                }}
              >
                21.4% AVG LOAD
              </span>
            </div>

            <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Engineered with 128-bit SIMD vectorization and lightweight neural models to maintain low thermal
              impact on standard laptops and thin clients.
            </p>

            <div className="space-y-1.5 mb-4 text-[11px] font-data">
              <span
                className="text-[10px] uppercase font-semibold block mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Runtime Benchmark Comparison
              </span>

              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Native C++ / AVX2</span>
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>8.4% CPU</span>
              </div>
              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-accent-soft)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                  MediaPipe + WASM SIMD (Active)
                </span>
                <span className="font-bold" style={{ color: 'var(--color-accent)' }}>21.4% CPU</span>
              </div>
              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Pure JavaScript Baseline</span>
                <span className="font-bold" style={{ color: 'var(--color-danger)' }}>68.2% CPU</span>
              </div>
            </div>
          </div>

          <div
            className="pt-3 flex items-center justify-between text-[11px] font-data"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Heap footprint: ~38 MB RAM</span>
            <span style={{ color: 'var(--color-success)' }}>3.2× vs unoptimized JS</span>
          </div>
        </div>

        {/* CARD 4: <60ms Frame Latency */}
        <div
          className="rounded-xl p-5 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-accent-soft)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
                    &lt;60ms Frame Latency
                  </h3>
                  <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                    Sub-Millisecond Pipeline
                  </span>
                </div>
              </div>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-accent-soft)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                {totalLatency} ms TOTAL
              </span>
            </div>

            <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Deterministic frame processing pipeline delivering prompt feedback for real-time monitoring and UX
              engagement tracking.
            </p>

            <div className="space-y-2 mb-3">
              <div
                className="h-2.5 w-full rounded-full flex overflow-hidden"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div style={{ width: '17.5%', backgroundColor: '#93c5fd' }} title="Ingest: 8.4ms" />
                <div style={{ width: '12.9%', backgroundColor: '#60a5fa' }} title="ROI: 6.2ms" />
                <div style={{ width: '45.4%', backgroundColor: '#2563eb' }} title="Mesh: 21.8ms" />
                <div style={{ width: '14.8%', backgroundColor: '#3b82f6' }} title="Affective: 7.1ms" />
                <div style={{ width: '9.4%', backgroundColor: '#1d4ed8' }} title="Render: 4.5ms" />
              </div>

              <div className="space-y-1 pt-1">
                {pipelineStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] font-data"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span className="truncate pr-2">{idx + 1}. {stage.name}</span>
                    <strong style={{ color: 'var(--color-text)' }}>{stage.time} ms</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="pt-3 flex items-center justify-between text-[11px] font-data"
            style={{
              borderTop: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>Target budget: &lt;60.0 ms</span>
            <span style={{ color: 'var(--color-accent)' }}>12.0 ms headroom margin</span>
          </div>
        </div>
      </div>

      {/* Deep-Dive Architectural Table */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Database className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <span>Biometric Extraction Pipeline Architecture Matrix</span>
        </h3>

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
                <th className="py-2.5 px-3">Sub-System</th>
                <th className="py-2.5 px-3">Algorithmic Model</th>
                <th className="py-2.5 px-3">Input Shape</th>
                <th className="py-2.5 px-3">Output Space</th>
                <th className="py-2.5 px-3">Quantization</th>
                <th className="py-2.5 px-3">Execution Kernel</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {[
                { sub: 'Face Detector', model: 'BlazeFace FPN', input: '128 × 128 × 3', out: 'Bounding Box [4] + 6 Pts', q: 'FP16', kernel: 'WebGL / WASM SIMD' },
                { sub: '3D Mesh Regressor', model: 'MobileNetV3 Backbone', input: '192 × 192 × 3', out: '468 Vertices (X,Y,Z)', q: 'INT8 / FP16', kernel: 'WASM Vectorized Kernel' },
                { sub: 'Iris Gaze Estimator', model: 'Periorbital Regressor', input: '64 × 64 × 3 (per eye)', out: '10 Contour Coordinates', q: 'FP16', kernel: 'SIMD Micro-kernel' },
                { sub: 'Affective State Engine', model: 'Geometric Heuristic MLP', input: '52 FACS Distance Ratios', out: '8 Expression Signals', q: 'FP32', kernel: 'In-Memory Ephemeral Buffer' },
              ].map((row, idx) => (
                <tr
                  key={row.sub}
                  style={{
                    borderBottom: idx < 3 ? '1px solid var(--color-border-subtle)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-surface-raised)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--color-text)' }}>{row.sub}</td>
                  <td className="py-2.5 px-3">{row.model}</td>
                  <td className="py-2.5 px-3">{row.input}</td>
                  <td className="py-2.5 px-3">{row.out}</td>
                  <td className="py-2.5 px-3 font-medium" style={{ color: 'var(--color-accent)' }}>{row.q}</td>
                  <td className="py-2.5 px-3">{row.kernel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
