import React, { useRef, useEffect } from 'react';
import type { LandmarkPoint, HeadPose } from '../types';

interface MeshCanvasProps {
  points: LandmarkPoint[];
  headPose: HeadPose;
  showMesh: boolean;
  showIris: boolean;
  showPoseAxes: boolean;
  showBoundingBox: boolean;
  isWebcamActive: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  width?: number;
  height?: number;
  isBackendConnected?: boolean;
}

export const MeshCanvas: React.FC<MeshCanvasProps> = ({
  points,
  headPose,
  showMesh,
  showIris,
  showPoseAxes,
  showBoundingBox,
  isWebcamActive,
  videoRef,
  width = 640,
  height = 440,
  isBackendConnected = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (isWebcamActive && videoRef?.current && videoRef.current.readyState >= 2) {
      // Draw webcam feed (mirrored)
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();
      // Subtle dark overlay for readability
      ctx.fillStyle = 'rgba(10, 15, 28, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Dark background gradient
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width / 1.3
      );
      grad.addColorStop(0, '#1a2035');
      grad.addColorStop(1, '#0d1120');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    }

    if (!points || points.length === 0) return;

    const px = (p: LandmarkPoint) => ({
      x: p.x * width, y: p.y * height, z: p.z, region: p.region, id: p.id,
    });
    const mapped = points.map(px);

    // ── Mesh rendering ────────────────────────────────────────
    if (showMesh) {
      // Wireframe triangles
      ctx.lineWidth = 0.4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      for (let i = 0; i < mapped.length - 2; i += 3) {
        const [p1, p2, p3] = [mapped[i], mapped[i + 1], mapped[i + 2]];
        if (p1 && p2 && p3) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
        }
      }
      ctx.stroke();

      // Face contour — bright blue
      const contour = mapped.filter((p) => p.region === 'contour');
      if (contour.length > 0) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(contour[0].x, contour[0].y);
        contour.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
      }

      // Eyes — sky blue
      ['leftEye', 'rightEye'].forEach((region) => {
        const eye = mapped.filter((p) => p.region === region);
        if (eye.length > 0) {
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(eye[0].x, eye[0].y);
          eye.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
        }
      });

      // Lips — white
      const lips = mapped.filter((p) => p.region === 'lips');
      if (lips.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lips[0].x, lips[0].y);
        lips.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
      }

      // Landmark dots
      mapped.forEach((p, idx) => {
        const isKey = idx % 8 === 0 || p.region === 'leftIris' || p.region === 'rightIris';
        const isIris = p.region === 'leftIris' || p.region === 'rightIris';
        ctx.fillStyle = isKey
          ? isIris ? '#38bdf8' : 'rgba(255,255,255,0.88)'
          : 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, isKey ? 1.5 : 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── Iris tracking ─────────────────────────────────────────
    if (showIris) {
      ['leftIris', 'rightIris'].forEach((region) => {
        const iris = mapped.filter((p) => p.region === region);
        if (iris.length > 0) {
          const c = iris[0];
          // Outer ring
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2); ctx.stroke();
          // Gaze vector
          const dx = headPose.yaw * 1.8;
          const dy = headPose.pitch * 1.5;
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + dx, c.y + dy); ctx.stroke();
          // Center dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, Math.PI * 2); ctx.fill();
        }
      });
    }

    // ── Head pose axes ────────────────────────────────────────
    if (showPoseAxes) {
      const nose = mapped.filter((p) => p.region === 'nose');
      if (nose.length > 0) {
        const origin = nose[Math.floor(nose.length / 2)];
        const len = 44;
        const ry = (headPose.yaw * Math.PI) / 180;
        const rp = (headPose.pitch * Math.PI) / 180;
        const rr = (headPose.roll * Math.PI) / 180;

        // X-axis (roll) — rose red
        ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + Math.cos(rr) * len, origin.y + Math.sin(rr) * len);
        ctx.stroke();

        // Y-axis (roll perp) — emerald
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x - Math.sin(rr) * len, origin.y + Math.cos(rr) * len);
        ctx.stroke();

        // Z-axis (depth/focus) — blue
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(
          origin.x + Math.sin(ry) * len * 1.5,
          origin.y - Math.sin(rp) * len * 1.5
        );
        ctx.stroke();

        ctx.lineCap = 'butt';
        // Origin dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── Bounding box ──────────────────────────────────────────
    if (showBoundingBox) {
      const xs = mapped.map((p) => p.x);
      const ys = mapped.map((p) => p.y);
      const minX = Math.min(...xs) - 18;
      const maxX = Math.max(...xs) + 18;
      const minY = Math.min(...ys) - 24;
      const maxY = Math.max(...ys) + 18;
      const bw = maxX - minX;
      const bh = maxY - minY;

      // Faint rect
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(minX, minY, bw, bh);

      // Corner marks
      const cLen = 14;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      [
        [minX, minY,  1,  1],
        [maxX, minY, -1,  1],
        [minX, maxY,  1, -1],
        [maxX, maxY, -1, -1],
      ].forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, (cy as number) + (sy as number) * cLen);
        ctx.lineTo(cx, cy as number);
        ctx.lineTo((cx as number) + (sx as number) * cLen, cy as number);
        ctx.stroke();
      });
      ctx.lineCap = 'butt';

      // Label
      ctx.fillStyle = 'rgba(59,130,246,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Face', minX + 4, minY - 5);
    }
  }, [
    points, headPose, showMesh, showIris, showPoseAxes, showBoundingBox,
    isWebcamActive, videoRef, width, height,
  ]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-md"
      style={{
        backgroundColor: '#0d1120',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      role="img"
      aria-label="Facial landmark mesh visualization canvas"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-auto"
      />

      {/* Top-left status badge */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium"
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.8)',
        }}
        role="status"
        aria-live="polite"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isBackendConnected ? 'bg-emerald-400 pulse-live' : 'bg-blue-400 pulse-live'
          }`}
        />
        <span>{isBackendConnected ? 'Live inference' : 'Simulation'}</span>
      </div>

      {/* Top-right landmark count */}
      <div
        className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-data"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        {points?.length ?? 0} pts
      </div>
    </div>
  );
};
