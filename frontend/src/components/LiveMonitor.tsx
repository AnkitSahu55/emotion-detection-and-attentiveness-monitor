import React, { useState, useEffect, useRef } from 'react';
import type { CsvLogEntry } from '../types';
import { useBackendStream } from '../hooks/useBackendStream';
import { MeshCanvas } from './MeshCanvas';
import { EARWaveform } from './EARWaveform';
import { EmotionGauge } from './EmotionGauge';
import { CsvExportModal } from './CsvExportModal';
import { Layers, Eye, Compass, Box, Download, Cpu, Zap, HardDrive } from 'lucide-react';

interface LiveMonitorProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

type Preset = 'focus' | 'discussion' | 'fatigue' | 'distracted' | 'expressive';

const PRESETS: Preset[] = ['focus', 'discussion', 'fatigue', 'distracted', 'expressive'];

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ isCameraActive }) => {
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

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Backend stream hook — handles WebSocket + synthetic fallback
  const { metrics, status: backendStatus, isUsingBackend, fps } = useBackendStream({
    isActive: isCameraActive && isWebcamStreaming,
    videoRef,
    preset,
  });

  // Webcam setup
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraActive) {
      navigator.mediaDevices?.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      }).then(mediaStream => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setIsWebcamStreaming(true);
        setWebcamError(null);
      }).catch(err => {
        console.warn('Webcam unavailable, using simulation:', err);
        setIsWebcamStreaming(false);
        setWebcamError('Camera unavailable — running in simulation mode.');
      });
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamStreaming(false);
    }

    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [isCameraActive]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // CSV recording
  useEffect(() => {
    if (isRecording) {
      setRecordedLogs(prev => [
        ...prev.slice(-200),
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
  }, [metrics, isRecording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const backendStatusLabel = {
    connected: isUsingBackend ? 'Live inference' : 'Waiting for face…',
    connecting: 'Connecting…',
    disconnected: 'Simulation mode',
    error: 'Backend offline',
  }[backendStatus];

  const backendStatusColor = {
    connected: isUsingBackend ? 'text-green-600' : 'text-blue-500',
    connecting: 'text-amber-500',
    disconnected: 'text-gray-400',
    error: 'text-red-500',
  }[backendStatus];

  return (
    <div className="space-y-4">
      <video ref={videoRef} playsInline muted className="hidden" />

      {/* Control bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Session timer */}
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-data text-gray-900 font-medium">{formatTime(sessionSeconds)}</span>
            <span className="text-gray-300">·</span>
            <span className={`text-xs font-medium ${backendStatusColor}`}>{backendStatusLabel}</span>
            <span className="text-gray-300">·</span>
            <span className="font-data text-xs text-gray-500">{fps} FPS</span>
          </div>

          {webcamError && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
              {webcamError}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation preset selector — only relevant when not on real backend */}
          {!isUsingBackend && (
            <div className="flex items-center bg-gray-50 border border-gray-200 p-0.5 rounded-lg gap-0.5">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all cursor-pointer ${
                    preset === p
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Export CSV {recordedLogs.length > 0 && `(${recordedLogs.length})`}
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Canvas + waveform */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
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

            {/* Overlay controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-900/80 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-1">
                {[
                  { icon: Layers, label: '468 Mesh', state: showMesh, toggle: () => setShowMesh(!showMesh) },
                  { icon: Eye, label: 'Iris', state: showIris, toggle: () => setShowIris(!showIris) },
                  { icon: Compass, label: 'Axes', state: showPoseAxes, toggle: () => setShowPoseAxes(!showPoseAxes) },
                  { icon: Box, label: 'Box', state: showBoundingBox, toggle: () => setShowBoundingBox(!showBoundingBox) },
                ].map(({ icon: Icon, label, state, toggle }) => (
                  <button
                    key={label}
                    onClick={toggle}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      state ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                  isRecording ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-red-400'}`} />
                {isRecording ? 'Recording' : 'Record'}
              </button>
            </div>
          </div>

          <EARWaveform
            currentEarLeft={metrics.earLeft}
            currentEarRight={metrics.earRight}
            currentEarAvg={metrics.earAvg}
            isBlinking={metrics.isBlinking}
            threshold={0.22}
          />
        </div>

        {/* Telemetry panel */}
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

          {/* System metrics */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'CPU', value: `${metrics.cpuUtilization}%`, sub: 'target < 30%', icon: Cpu, ok: metrics.cpuUtilization < 30 },
              { label: 'Latency', value: `${metrics.frameLatencyMs}ms`, sub: 'target < 60ms', icon: Zap, ok: metrics.frameLatencyMs < 60 },
              { label: 'Memory', value: '38 MB', sub: 'volatile', icon: HardDrive, ok: true },
            ].map(({ label, value, sub, icon: Icon, ok }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-gray-400 mb-1">
                  <span className="text-[10px] font-medium">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className={`text-base font-bold font-data ${ok ? 'text-gray-900' : 'text-red-600'}`}>{value}</div>
                <span className="text-[10px] text-gray-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        liveLogs={recordedLogs}
      />
    </div>
  );
};
