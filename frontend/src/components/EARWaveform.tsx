import React, { useRef, useEffect } from 'react';

interface EARWaveformProps {
  currentEarLeft: number;
  currentEarRight: number;
  currentEarAvg: number;
  isBlinking: boolean;
  threshold?: number;
  historyLength?: number;
}

export const EARWaveform: React.FC<EARWaveformProps> = ({
  currentEarLeft,
  currentEarRight,
  currentEarAvg,
  isBlinking,
  threshold = 0.22,
  historyLength = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<Array<{ left: number; right: number; avg: number; blink: boolean }>>([]);

  useEffect(() => {
    historyRef.current.push({
      left: currentEarLeft,
      right: currentEarRight,
      avg: currentEarAvg,
      blink: isBlinking,
    });

    if (historyRef.current.length > historyLength) {
      historyRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const minVal = 0.05;
    const maxVal = 0.42;
    const getY = (val: number) => h - ((val - minVal) / (maxVal - minVal)) * (h - 20) - 10;

    // Threshold line
    const threshY = getY(threshold);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, threshY); ctx.lineTo(w, threshY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#dc2626';
    ctx.font = `9px "JetBrains Mono", monospace`;
    ctx.fillText(`blink threshold ${threshold.toFixed(2)}`, 6, threshY - 4);

    const history = historyRef.current;
    if (history.length < 2) return;

    const step = w / (historyLength - 1);

    // Left eye — light blue
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.left);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Right eye — cyan
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.right);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Mean EAR — solid blue
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.avg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Latest point indicator
    const lastPt = history[history.length - 1];
    const lastX = (history.length - 1) * step;
    const lastY = getY(lastPt.avg);
    ctx.fillStyle = lastPt.blink ? '#dc2626' : '#2563eb';
    ctx.beginPath();
    ctx.arc(lastX, lastY, lastPt.blink ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();

    if (lastPt.blink) {
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [currentEarLeft, currentEarRight, currentEarAvg, isBlinking, threshold, historyLength]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Eye aspect ratio (EAR)</span>
          {isBlinking && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium border border-red-100">
              Blink
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-data">{currentEarAvg.toFixed(3)}</span>
          </span>
          <span className="text-gray-200">|</span>
          <span className="font-data">L {currentEarLeft.toFixed(2)}</span>
          <span className="font-data">R {currentEarRight.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-100">
        <canvas
          ref={canvasRef}
          width={520}
          height={110}
          className="w-full h-24 block"
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
        <span>80-frame window (~1.3s)</span>
        <span>Formula: (‖p2−p6‖ + ‖p3−p5‖) / (2·‖p1−p4‖)</span>
      </div>
    </div>
  );
};
