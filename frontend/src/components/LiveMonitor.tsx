import React, { useState, useEffect, useRef } from 'react';
import type { CsvLogEntry } from '../types';
import { useBackendStream, type BackendStatus } from '../hooks/useBackendStream';
import { MeshCanvas } from './MeshCanvas';
import { EARWaveform } from './EARWaveform';
import { EmotionGauge } from './EmotionGauge';
import { CsvExportModal } from './CsvExportModal';
import {
  Layers, Eye, Compass, Box, Download, Cpu, Zap, HardDrive,
  Camera, CameraOff, AlertTriangle, Loader2,
} from 'lucide-react';

interface LiveMonitorProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onStatusChange?: (status: BackendStatus) => void;
  onBackendChange?: (isUsing: boolean) => void;
  onFpsChange?: (fps: number) => void;
}

type Preset = 'focus' | 'discussion' | 'fatigue' | 'distracted' | 'expressive';
const PRESETS: Preset[] = ['focus', 'discussion', 'fatigue', 'distracted', 'expressive'];

// ─── Reusable UI atoms ───────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {children}
    </div>
  );
}

function StatusBadge({ connected, label }: { connected: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{
        backgroundColor: connected ? 'var(--color-success-soft)' : 'var(--color-surface-raised)',
        color: connected ? 'var(--color-success)' : 'var(--color-text-muted)',
        border: `1px solid ${connected ? '#bbf7d0' : 'var(--color-border)'}`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 pulse-live' : 'bg-gray-400'}`}
      />
      {label}
    </span>
  );
}

// ─── Empty state shown when camera is off ────────────────────────────────────

function CameraOffState({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl overflow-hidden bg-grid"
      style={{
        aspectRatio: '640/440',
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        minHeight: 280,
      }}
      aria-label="Camera preview — camera is off"
    >
      <div className="text-center px-6 py-8 max-w-xs">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--color-accent-soft)', border: '1px solid var(--color-accent-border)' }}
        >
          <Camera className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
        </div>
        <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
          Camera not active
        </h3>
        <p className="text-[12px] leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Click <strong>Start Monitoring</strong> to initialize your camera and begin real-time
          facial expression and attentiveness analysis.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-accent)'; }}
        >
          <Camera className="w-4 h-4" />
          Start Monitoring
        </button>
        <p className="text-[11px] mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Camera permission will be requested. Video is processed locally — nothing is uploaded.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  isCameraActive,
  onToggleCamera,
  onStatusChange,
  onBackendChange,
  onFpsChange,
}) => {
  const [preset, setPreset] = useState<Preset>('focus');
  const [showMesh, setShowMesh] = useState(true);
  const [showIris, setShowIris] = useState(true);
  const [showPoseAxes, setShowPoseAxes] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLogs, setRecordedLogs] = useState<CsvLogEntry[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isWebcamStreaming, setIsWebcamStreaming] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [cameraInitializing, setCameraInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { metrics, status: backendStatus, isUsingBackend, fps } = useBackendStream({
    isActive: isCameraActive && isWebcamStreaming,
    videoRef,
    preset,
  });

  // Propagate status to parent (TopBar / Sidebar)
  useEffect(() => { onStatusChange?.(backendStatus); }, [backendStatus, onStatusChange]);
  useEffect(() => { onBackendChange?.(isUsingBackend); }, [isUsingBackend, onBackendChange]);
  useEffect(() => { onFpsChange?.(fps); }, [fps, onFpsChange]);

  // Webcam lifecycle
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      setCameraInitializing(true);
      const requestCamera = () =>
        navigator.mediaDevices
          ?.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
          .catch(() => navigator.mediaDevices?.getUserMedia({ video: true }));

      requestCamera()
        ?.then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
          }
          setIsWebcamStreaming(true);
          setWebcamError(null);
          setCameraInitializing(false);
        })
        .catch((err: Error) => {
          console.warn('Webcam unavailable, using simulation:', err);
          setIsWebcamStreaming(false);
          setCameraInitializing(false);
          let message = 'Camera unavailable — running in simulation mode.';
          if (err.name === 'NotReadableError') {
            message = 'Camera locked by another application — running in simulation mode.';
          } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Camera permission denied — running in simulation mode.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            message = 'No webcam detected — running in simulation mode.';
          }
          setWebcamError(message);
        });
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamStreaming(false);
      setCameraInitializing(false);
    }
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [isCameraActive]);

  // Session timer — only tick when camera is active
  useEffect(() => {
    if (!isCameraActive) return;
    const timer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isCameraActive]);

  // Reset timer on camera stop
  useEffect(() => {
    if (!isCameraActive) setSessionSeconds(0);
  }, [isCameraActive]);

  // CSV recording
  useEffect(() => {
    if (isRecording && isCameraActive) {
      setRecordedLogs((prev) => [
        ...prev.slice(-500),
        {
          timestamp_utc: metrics.timestamp,
          frame_id: metrics.frameIndex,
          face_present: metrics.faceDetected,
          ear_left: metrics.earLeft,
          ear_right: metrics.earRight,
          ear_avg: metrics.earAvg,
          perclos_pct: metrics.perclos,
          blink_event: metrics.isBlinking,
          head_yaw_deg: metrics.headPose.yaw,
          head_pitch_deg: metrics.headPose.pitch,
          head_roll_deg: metrics.headPose.roll,
          attentive_score: metrics.attentivenessScore,
          dominant_emotion: metrics.dominantEmotion,
          emotion_confidence: metrics.emotionConfidence,
          inference_latency_ms: metrics.frameLatencyMs,
          cpu_usage_pct: metrics.cpuUtilization,
        },
      ]);
    }
  }, [metrics, isRecording, isCameraActive]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const backendLabel = {
    connected: isUsingBackend ? 'Live inference' : 'Waiting for face…',
    connecting: 'Connecting to backend…',
    disconnected: 'Simulation mode',
    error: 'Backend offline',
  }[backendStatus];

  const overlayControls = [
    { icon: Layers, label: '468 Mesh', state: showMesh, toggle: () => setShowMesh((v) => !v) },
    { icon: Eye, label: 'Iris', state: showIris, toggle: () => setShowIris((v) => !v) },
    { icon: Compass, label: 'Axes', state: showPoseAxes, toggle: () => setShowPoseAxes((v) => !v) },
    { icon: Box, label: 'Box', state: showBoundingBox, toggle: () => setShowBoundingBox((v) => !v) },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Hidden video element */}
      <video ref={videoRef} playsInline muted className="hidden" aria-hidden="true" />

      {/* ── Control bar ─────────────────────────────────────── */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: session info */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Session timer */}
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] font-semibold font-data"
                style={{ color: 'var(--color-text)' }}
                aria-label={`Session time: ${formatTime(sessionSeconds)}`}
              >
                {formatTime(sessionSeconds)}
              </span>
              <span style={{ color: 'var(--color-border)' }}>·</span>
              <StatusBadge
                connected={backendStatus === 'connected' && isUsingBackend}
                label={backendLabel}
              />
              {fps > 0 && (
                <>
                  <span style={{ color: 'var(--color-border)' }}>·</span>
                  <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                    {fps} fps
                  </span>
                </>
              )}
            </div>

            {/* Camera error */}
            {webcamError && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]"
                style={{
                  backgroundColor: 'var(--color-warning-soft)',
                  color: 'var(--color-warning)',
                  border: '1px solid #fde68a',
                }}
                role="alert"
              >
                <AlertTriangle className="w-3 h-3" />
                {webcamError}
              </div>
            )}

            {/* Initializing */}
            {cameraInitializing && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px]"
                style={{ color: 'var(--color-text-muted)' }}
                role="status"
                aria-live="polite"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Initializing camera…
              </div>
            )}
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2">
            {/* Simulation preset selector */}
            {!isUsingBackend && isCameraActive && (
              <div
                className="flex items-center p-0.5 rounded-lg gap-0.5"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                }}
                role="radiogroup"
                aria-label="Simulation preset"
              >
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    role="radio"
                    aria-checked={preset === p}
                    onClick={() => setPreset(p)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-all cursor-pointer"
                    style={
                      preset === p
                        ? {
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            boxShadow: 'var(--shadow-xs)',
                            border: '1px solid var(--color-border)',
                          }
                        : { color: 'var(--color-text-muted)' }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Export CSV */}
            <button
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-surface)'; }}
              aria-label={`Export session data as CSV${recordedLogs.length > 0 ? ` (${recordedLogs.length} frames)` : ''}`}
            >
              <Download className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              Export CSV
              {recordedLogs.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  {recordedLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Main workspace ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left: Canvas + EAR waveform */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            {isCameraActive ? (
              <>
                <MeshCanvas
                  points={metrics.meshPoints}
                  headPose={metrics.headPose}
                  showMesh={showMesh}
                  showIris={showIris}
                  showPoseAxes={showPoseAxes}
                  showBoundingBox={showBoundingBox}
                  isWebcamActive={isWebcamStreaming}
                  videoRef={videoRef}
                  width={640}
                  height={440}
                  isBackendConnected={isUsingBackend}
                />

                {/* Overlay controls bar */}
                <div
                  className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-2 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(15, 17, 23, 0.82)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-1" role="group" aria-label="Overlay controls">
                    {overlayControls.map(({ icon: Icon, label, state, toggle }) => (
                      <button
                        key={label}
                        onClick={toggle}
                        aria-pressed={state}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        style={
                          state
                            ? { backgroundColor: 'var(--color-accent)', color: '#ffffff' }
                            : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                        }
                        onMouseEnter={(e) => {
                          if (!state) (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          if (!state) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Record button */}
                  <button
                    onClick={() => setIsRecording((r) => !r)}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? 'Stop recording' : 'Start recording session data'}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                    style={
                      isRecording
                        ? { backgroundColor: 'var(--color-danger)', color: '#ffffff' }
                        : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-400'}`}
                    />
                    {isRecording ? 'Recording' : 'Record'}
                  </button>
                </div>
              </>
            ) : (
              <CameraOffState onStart={onToggleCamera} />
            )}
          </div>

          <EARWaveform
            currentEarLeft={metrics.earLeft}
            currentEarRight={metrics.earRight}
            currentEarAvg={metrics.earAvg}
            isBlinking={metrics.isBlinking}
            threshold={0.22}
          />
        </div>

        {/* Right: Telemetry */}
        <div className="lg:col-span-5 space-y-3">
          <EmotionGauge
            attentivenessScore={metrics.attentivenessScore}
            attentivenessState={metrics.attentivenessState}
            dominantEmotion={metrics.dominantEmotion}
            emotionConfidence={metrics.emotionConfidence}
            emotionProbabilities={metrics.emotionProbabilities}
            headPose={metrics.headPose}
            perclos={metrics.perclos}
            blinkRateBpm={metrics.blinkRateBpm}
          />

          {/* System metrics row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: 'CPU',
                value: `${metrics.cpuUtilization}%`,
                sub: 'target <30%',
                icon: Cpu,
                ok: metrics.cpuUtilization < 30,
              },
              {
                label: 'Latency',
                value: `${metrics.frameLatencyMs}ms`,
                sub: 'target <60ms',
                icon: Zap,
                ok: metrics.frameLatencyMs < 60,
              },
              {
                label: 'Memory',
                value: '~38 MB',
                sub: 'volatile RAM',
                icon: HardDrive,
                ok: true,
              },
            ].map(({ label, value, sub, icon: Icon, ok }) => (
              <Card key={label} className="p-3">
                <div className="flex items-center justify-between mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="text-[10px] font-medium">{label}</span>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div
                  className="text-[16px] font-bold font-data"
                  style={{ color: ok ? 'var(--color-text)' : 'var(--color-danger)' }}
                >
                  {value}
                </div>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {sub}
                </span>
              </Card>
            ))}
          </div>

          {/* No-face notice */}
          {isCameraActive && isWebcamStreaming && !metrics.faceDetected && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-xl text-[12px]"
              style={{
                backgroundColor: 'var(--color-warning-soft)',
                border: '1px solid #fde68a',
                color: 'var(--color-warning)',
              }}
              role="status"
              aria-live="polite"
            >
              <CameraOff className="w-4 h-4 flex-shrink-0" />
              <span>
                No face detected in frame. Position your face within the camera view.
              </span>
            </div>
          )}

          {/* Backend error notice */}
          {backendStatus === 'error' && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-xl text-[12px]"
              style={{
                backgroundColor: 'var(--color-danger-soft)',
                border: '1px solid #fecaca',
                color: 'var(--color-danger)',
              }}
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Backend connection failed.</strong>
                <br />
                Ensure the Python backend is running:{' '}
                <code className="font-data text-[11px]">uvicorn main:app --port 8765</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSV modal */}
      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        liveLogs={recordedLogs}
      />
    </div>
  );
};
