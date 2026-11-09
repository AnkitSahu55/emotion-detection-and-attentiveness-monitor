import { useEffect, useRef, useState, useCallback } from 'react';
import type { FaceMetrics } from '../types';
import { computeLiveMetrics } from '../utils/faceLandmarkData';

const WS_URL = 'ws://localhost:8765/ws/stream';
const FRAME_INTERVAL_MS = 66; // ~15 fps to the backend

export type BackendStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseBackendStreamOptions {
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  preset: 'focus' | 'discussion' | 'fatigue' | 'distracted' | 'expressive';
}

interface UseBackendStreamResult {
  metrics: FaceMetrics;
  status: BackendStatus;
  isUsingBackend: boolean;
  fps: number;
}

export function useBackendStream({
  isActive,
  videoRef,
  preset,
}: UseBackendStreamOptions): UseBackendStreamResult {
  const [metrics, setMetrics] = useState<FaceMetrics>(() => computeLiveMetrics(0, preset));
  const [status, setStatus] = useState<BackendStatus>('disconnected');
  const [fps, setFps] = useState(60);

  const wsRef = useRef<WebSocket | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const fpsCounterRef = useRef({ count: 0, lastTime: performance.now() });
  const lastBackendMetricsRef = useRef<FaceMetrics | null>(null);

  // Synthetic fallback loop — always runs at 60fps for smooth UI
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (now - lastTime >= 16.6) {
        tickRef.current += 1;

        // Only use synthetic data if backend is not providing real metrics
        if (!lastBackendMetricsRef.current) {
          setMetrics(computeLiveMetrics(tickRef.current, preset));
        }

        // FPS counter
        fpsCounterRef.current.count += 1;
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.count);
          fpsCounterRef.current = { count: 0, lastTime: now };
        }

        lastTime = now;
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [preset]);

  // WebSocket + frame capture lifecycle
  const startStream = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Start capturing frames from the video element
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }

      captureIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || ws.readyState !== WebSocket.OPEN) return;

        const canvas = offscreenCanvasRef.current!;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Mirror the frame so landmarks match the mirrored display
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();

        const b64 = canvas.toDataURL('image/jpeg', 0.75);
        ws.send(JSON.stringify({ type: 'frame', data: b64 }));
      }, FRAME_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as FaceMetrics;
        if (data.faceDetected) {
          lastBackendMetricsRef.current = data;
          setMetrics(data);
        } else {
          // Face lost — clear cached backend metrics so synthetic kicks in
          lastBackendMetricsRef.current = null;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      setStatus('error');
      lastBackendMetricsRef.current = null;
    };

    ws.onclose = () => {
      setStatus('disconnected');
      lastBackendMetricsRef.current = null;
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [videoRef]);

  const stopStream = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    lastBackendMetricsRef.current = null;
    setStatus('disconnected');
  }, []);

  // Trigger connection when camera activates, disconnect when it stops
  useEffect(() => {
    if (isActive) {
      // Small delay to let webcam stream stabilize
      const timer = setTimeout(startStream, 800);
      return () => clearTimeout(timer);
    } else {
      stopStream();
    }
  }, [isActive, startStream, stopStream]);

  // Reset synthetic tick when preset changes
  useEffect(() => {
    tickRef.current = 0;
    lastBackendMetricsRef.current = null;
  }, [preset]);

  const isUsingBackend = status === 'connected' && lastBackendMetricsRef.current !== null;

  return { metrics, status, isUsingBackend, fps };
}
