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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // If webcam active, draw video frame
    if (isWebcamActive && videoRef?.current && videoRef.current.readyState >= 2) {
      ctx.save();
      // Mirror webcam for natural UX
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();

      // Subtle slate overlay for synthetic precision aesthetic
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Synthetic Precision dark-slate / white chamber background
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width / 1.5
      );
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle precision background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    if (!points || points.length === 0) return;

    // Convert normalized coordinates to canvas pixels
    const px = (p: LandmarkPoint) => ({
      x: p.x * width,
      y: p.y * height,
      z: p.z,
      region: p.region,
      id: p.id,
    });

    const mapped = points.map(px);

    // 1. Draw Mesh Triangulation Wireframes
    if (showMesh) {
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';

      // Draw mesh lattice lines
      ctx.beginPath();
      for (let i = 0; i < mapped.length; i += 3) {
        if (i + 2 < mapped.length) {
          const p1 = mapped[i];
          const p2 = mapped[i + 1];
          const p3 = mapped[i + 2];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
        }
      }
      ctx.stroke();

      // Draw Contour Loop
      const contourPoints = mapped.filter(p => p.region === 'contour');
      if (contourPoints.length > 0) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)'; // Cool Blue Contour
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contourPoints[0].x, contourPoints[0].y);
        for (let i = 1; i < contourPoints.length; i++) {
          ctx.lineTo(contourPoints[i].x, contourPoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Lips Outline
      const lipsPoints = mapped.filter(p => p.region === 'lips');
      if (lipsPoints.length > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(lipsPoints[0].x, lipsPoints[0].y);
        for (let i = 1; i < lipsPoints.length; i++) {
          ctx.lineTo(lipsPoints[i].x, lipsPoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw Eye Outlines
      const leftEye = mapped.filter(p => p.region === 'leftEye');
      if (leftEye.length > 0) {
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(leftEye[0].x, leftEye[0].y);
        for (let i = 1; i < leftEye.length; i++) {
          ctx.lineTo(leftEye[i].x, leftEye[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      const rightEye = mapped.filter(p => p.region === 'rightEye');
      if (rightEye.length > 0) {
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rightEye[0].x, rightEye[0].y);
        for (let i = 1; i < rightEye.length; i++) {
          ctx.lineTo(rightEye[i].x, rightEye[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Render 468 Individual Spatial Coordinate Dots
      mapped.forEach((p, idx) => {
        const isAnchor = idx % 8 === 0 || p.region === 'leftIris' || p.region === 'rightIris';
        ctx.fillStyle = isAnchor 
          ? (p.region.includes('Iris') ? '#60a5fa' : '#ffffff') 
          : 'rgba(255, 255, 255, 0.45)';
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, isAnchor ? 1.5 : 0.9, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 2. Draw Iris Centers and Gaze Direction Vectors
    if (showIris) {
      const leftIrises = mapped.filter(p => p.region === 'leftIris');
      const rightIrises = mapped.filter(p => p.region === 'rightIris');

      [leftIrises, rightIrises].forEach(irisGroup => {
        if (irisGroup.length > 0) {
          const center = irisGroup[0];
          // Outer Iris Ring
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Gaze vector line based on head pose
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          const gazeDx = (headPose.yaw * 1.8);
          const gazeDy = (headPose.pitch * 1.5);
          ctx.lineTo(center.x + gazeDx, center.y + gazeDy);
          ctx.stroke();

          // Pupil Center Point
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(center.x, center.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 3. Draw 3D Head Pose Axes (Nose Bridge Origin)
    if (showPoseAxes) {
      const nosePoints = mapped.filter(p => p.region === 'nose');
      if (nosePoints.length > 0) {
        const origin = nosePoints[nosePoints.length - 1]; // Tip of nose
        const length = 45;

        const radYaw = (headPose.yaw * Math.PI) / 180;
        const radPitch = (headPose.pitch * Math.PI) / 180;
        const radRoll = (headPose.roll * Math.PI) / 180;

        // X-Axis (Pitch / Red/Slate)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(
          origin.x + Math.cos(radRoll) * length,
          origin.y + Math.sin(radRoll) * length
        );
        ctx.stroke();

        // Y-Axis (Yaw / Green/Cool Blue)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(
          origin.x - Math.sin(radRoll) * length,
          origin.y + Math.cos(radRoll) * length
        );
        ctx.stroke();

        // Z-Axis (Roll / Cool Blue Focus Vector)
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(
          origin.x + Math.sin(radYaw) * length * 1.4,
          origin.y - Math.sin(radPitch) * length * 1.4
        );
        ctx.stroke();

        // Origin Node
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Bounding Box & Precision Corner Reticles
    if (showBoundingBox) {
      const minX = Math.min(...mapped.map(p => p.x)) - 18;
      const maxX = Math.max(...mapped.map(p => p.x)) + 18;
      const minY = Math.min(...mapped.map(p => p.y)) - 24;
      const maxY = Math.max(...mapped.map(p => p.y)) + 18;
      const boxW = maxX - minX;
      const boxH = maxY - minY;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(minX, minY, boxW, boxH);

      // Precision Corner Reticles
      const cLen = 14;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(minX, minY + cLen);
      ctx.lineTo(minX, minY);
      ctx.lineTo(minX + cLen, minY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(maxX - cLen, minY);
      ctx.lineTo(maxX, minY);
      ctx.lineTo(maxX, minY + cLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(minX, maxY - cLen);
      ctx.lineTo(minX, maxY);
      ctx.lineTo(minX + cLen, maxY);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(maxX - cLen, maxY);
      ctx.lineTo(maxX, maxY);
      ctx.lineTo(maxX, maxY - cLen);
      ctx.stroke();

      // Precision Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`FACE_01 [CONF: 99.4%]`, minX + 4, minY - 6);
    }
  }, [points, headPose, showMesh, showIris, showPoseAxes, showBoundingBox, isWebcamActive, videoRef, width, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 shadow-md">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-auto object-cover"
      />
      {/* Top HUD overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1 rounded-md text-[11px] font-mono-tech text-slate-300">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 radar-live" />
        <span>SPATIAL_MESH: 468 PTS</span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-1 rounded-md text-[11px] font-mono-tech text-blue-400">
        <span>LOCAL_RAM: ONNX_WASM</span>
      </div>
    </div>
  );
};
