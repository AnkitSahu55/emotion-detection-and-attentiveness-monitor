import React, { useState, useEffect, useRef } from 'react';
import type { FaceMetrics, CsvLogEntry } from '../types';
import { computeLiveMetrics } from '../utils/faceLandmarkData';
import { MeshCanvas } from './MeshCanvas';
import { EARWaveform } from './EARWaveform';
import { EmotionGauge } from './EmotionGauge';
import { CsvExportModal } from './CsvExportModal';
import { 
  Sliders, 
  Layers, 
  Eye, 
  Compass, 
  Box, 
  Download, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Clock
} from 'lucide-react';

interface LiveMonitorProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  isCameraActive,
}) => {
  const [preset, setPreset] = useState<'focus' | 'discussion' | 'fatigue' | 'distracted' | 'expressive'>('focus');
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showIris, setShowIris] = useState<boolean>(true);
  const [showPoseAxes, setShowPoseAxes] = useState<boolean>(true);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedLogs, setRecordedLogs] = useState<CsvLogEntry[]>([]);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Video and stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isWebcamStreaming, setIsWebcamStreaming] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Real-time metrics state
  const [metrics, setMetrics] = useState<FaceMetrics>(() => computeLiveMetrics(0, 'focus'));

  // Main animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let tickCount = 0;

    const loop = (time: number) => {
      if (time - lastTime >= 16.6) { // ~60fps
        tickCount += 1;
        const currentMetrics = computeLiveMetrics(tickCount, preset);
        setMetrics(currentMetrics);

        // Record if active
        if (isRecording) {
          setRecordedLogs(prevLogs => [
            ...prevLogs.slice(-200), // Keep in-memory ring buffer
            {
              timestamp_utc: currentMetrics.timestamp,
              frame_id: currentMetrics.frameIndex,
              face_present: currentMetrics.faceDetected,
              ear_left: currentMetrics.earLeft,
              ear_right: currentMetrics.earRight,
              ear_avg: currentMetrics.earAvg,
              perclos_pct: currentMetrics.perclos,
              blink_event: currentMetrics.isBlinking,
              head_yaw_deg: currentMetrics.headPose.yaw,
              head_pitch_deg: currentMetrics.headPose.pitch,
              head_roll_deg: currentMetrics.headPose.roll,
              attentive_score: currentMetrics.attentivenessScore,
              dominant_emotion: currentMetrics.dominantEmotion,
              emotion_confidence: currentMetrics.emotionConfidence,
              inference_latency_ms: currentMetrics.frameLatencyMs,
              cpu_usage_pct: currentMetrics.cpuUtilization,
            }
          ]);
        }
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [preset, isRecording]);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebCam handling
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isCameraActive) {
      navigator.mediaDevices?.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      }).then(mediaStream => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setIsWebcamStreaming(true);
        setWebcamError(null);
      }).catch(err => {
        console.warn('Physical webcam not accessible or permission denied, using synthetic biometric feed:', err);
        setIsWebcamStreaming(false);
        setWebcamError('Physical webcam unavailable. Active in synthetic simulation mode.');
      });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const activeStream = videoRef.current.srcObject as MediaStream;
        activeStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamStreaming(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden Video element for real webcam feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* 1. Control Toolbar & Session Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Session stats & Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono-tech">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">SESSION:</span>
            <span className="text-slate-900 font-bold">{formatTime(sessionSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono-tech">
            <span className="text-slate-500">FEED:</span>
            <span className="text-blue-600 font-bold">
              {isWebcamStreaming ? 'PHYSICAL WEBCAM (LOCAL)' : 'SYNTHETIC 468-MESH SIM'}
            </span>
          </div>

          {webcamError && (
            <span className="text-[11px] font-mono-tech text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              {webcamError}
            </span>
          )}
        </div>

        {/* Right: Simulation Preset Switcher & Session CSV */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-mono-tech text-slate-500 px-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              PRESET:
            </span>
            {(['focus', 'discussion', 'fatigue', 'distracted', 'expressive'] as const).map(pKey => (
              <button
                key={pKey}
                onClick={() => setPreset(pKey)}
                className={`px-2.5 py-1 rounded text-xs font-mono-tech capitalize transition-all cursor-pointer ${
                  preset === pKey
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pKey}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono-tech transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Session CSV ({recordedLogs.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Live Monitoring Workspace (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Viewport & Waveform Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mesh Canvas Viewport */}
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
            />

            {/* Floating Visual Toggles Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-white text-xs font-mono-tech">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMesh(!showMesh)}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                    showMesh ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>468 Mesh</span>
                </button>

                <button
                  onClick={() => setShowIris(!showIris)}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                    showIris ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Iris/Gaze</span>
                </button>

                <button
                  onClick={() => setShowPoseAxes(!showPoseAxes)}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                    showPoseAxes ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>3D Axes</span>
                </button>

                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
                    showBoundingBox ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>Reticle</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold cursor-pointer ${
                    isRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
                  <span>{isRecording ? 'RECORDING' : 'LOG TO CSV'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time EAR Waveform Telemetry Chart */}
          <EARWaveform
            currentEarLeft={metrics.earLeft}
            currentEarRight={metrics.earRight}
            currentEarAvg={metrics.earAvg}
            isBlinking={metrics.isBlinking}
            threshold={0.22}
          />
        </div>

        {/* Right Telemetry & Affective HUD Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
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

          {/* Hardware & Latency Strip */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px]">CPU UTIL</span>
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-base font-bold text-slate-900">{metrics.cpuUtilization}%</div>
              <span className="text-[10px] text-emerald-600 font-medium">Target &lt; 30%</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px]">LATENCY</span>
                <Zap className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-base font-bold text-blue-600">{metrics.frameLatencyMs}ms</div>
              <span className="text-[10px] text-emerald-600 font-medium">Target &lt; 60ms</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px]">MEMORY</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-base font-bold text-slate-900">38.4 MB</div>
              <span className="text-[10px] text-slate-500 font-medium">Volatile RAM</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Export & Visual Table Modal */}
      <CsvExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        liveLogs={recordedLogs}
      />
    </div>
  );
};
