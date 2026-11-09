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
  height = 480,
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
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Clean dark background
      const grad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, width / 1.4);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 40;
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

    if (showMesh) {
      // Mesh wireframe
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      for (let i = 0; i < mapped.length; i += 3) {
        if (i + 2 < mapped.length) {
          const [p1, p2, p3] = [mapped[i], mapped[i + 1], mapped[i + 2]];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
        }
      }
      ctx.stroke();

      // Face contour
      const contour = mapped.filter(p => p.region === 'contour');
      if (contour.length > 0) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contour[0].x, contour[0].y);
        contour.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
      }

      // Eyes
      ['leftEye', 'rightEye'].forEach(region => {
        const eyePts = mapped.filter(p => p.region === region);
        if (eyePts.length > 0) {
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(eyePts[0].x, eyePts[0].y);
          eyePts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
        }
      });

      // Lips
      const lips = mapped.filter(p => p.region === 'lips');
      if (lips.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lips[0].x, lips[0].y);
        lips.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();
      }

      // Landmark dots
      mapped.forEach((p, idx) => {
        const isKey = idx % 8 === 0 || p.region === 'leftIris' || p.region === 'rightIris';
        ctx.fillStyle = isKey
          ? (p.region.includes('Iris') ? '#60a5fa' : 'rgba(255,255,255,0.9)')
          : 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, isKey ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (showIris) {
      ['leftIris', 'rightIris'].forEach(region => {
        const iris = mapped.filter(p => p.region === region);
        if (iris.length > 0) {
          const c = iris[0];
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.stroke();
          const dx = headPose.yaw * 1.8;
          const dy = headPose.pitch * 1.5;
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + dx, c.y + dy); ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(c.x, c.y, 2, 0, Math.PI * 2); ctx.fill();
        }
      });
    }

    if (showPoseAxes) {
      const nose = mapped.filter(p => p.region === 'nose');
      if (nose.length > 0) {
        const origin = nose[nose.length - 1];
        const len = 42;
        const ry = (headPose.yaw * Math.PI) / 180;
        const rp = (headPose.pitch * Math.PI) / 180;
        const rr = (headPose.roll * Math.PI) / 180;

        // X axis (roll) — red
        ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + Math.cos(rr) * len, origin.y + Math.sin(rr) * len); ctx.stroke();

        // Y axis (roll perp) — green
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x - Math.sin(rr) * len, origin.y + Math.cos(rr) * len); ctx.stroke();

        // Z axis (depth/focus) — blue
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + Math.sin(ry) * len * 1.4, origin.y - Math.sin(rp) * len * 1.4); ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (showBoundingBox) {
      const minX = Math.min(...mapped.map(p => p.x)) - 16;
      const maxX = Math.max(...mapped.map(p => p.x)) + 16;
      const minY = Math.min(...mapped.map(p => p.y)) - 20;
      const maxY = Math.max(...mapped.map(p => p.y)) + 16;
      const bw = maxX - minX;
      const bh = maxY - minY;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(minX, minY, bw, bh);

      const cLen = 12;
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
      [[minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY]].forEach(([cx, cy], idx) => {
        const sx = idx % 2 === 0 ? 1 : -1;
        const sy = idx < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * cLen); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * cLen, cy);
        ctx.stroke();
      });

      ctx.fillStyle = 'rgba(59,130,246,0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('Face', minX + 4, minY - 5);
    }
  }, [points, headPose, showMesh, showIris, showPoseAxes, showBoundingBox, isWebcamActive, videoRef, width, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-md">
      <canvas ref={canvasRef} width={width} height={height} className="block w-full h-auto object-cover" />

      {/* Minimal status badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-[10px] text-slate-300">
        <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-green-400 pulse-live' : 'bg-blue-400 pulse-live'}`} />
        <span>{isBackendConnected ? 'Live inference' : 'Simulation'}</span>
      </div>

      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md text-[10px] text-slate-400">
        468 pts
      </div>
    </div>
  );
};
