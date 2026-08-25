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

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Min/Max bounds for EAR: 0.0 to 0.45
    const minVal = 0.05;
    const maxVal = 0.42;
    const getY = (val: number) => h - ((val - minVal) / (maxVal - minVal)) * (h - 20) - 10;

    // Draw Threshold Line (Blink Trigger at 0.22)
    const threshY = getY(threshold);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red/Amber threshold
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(w, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw threshold label
    ctx.fillStyle = '#ef4444';
    ctx.font = '9px ui-monospace, monospace';
    ctx.fillText(`TRIGGER_THRESH: ${threshold.toFixed(2)}`, w - 120, threshY - 4);

    const history = historyRef.current;
    if (history.length < 2) return;

    const step = w / (historyLength - 1);

    // Draw Left Eye Curve (Cool Blue)
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.left);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Right Eye Curve (Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.right);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Mean EAR (Solid Cool Blue #2563EB)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.avg);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Blink marker indicator on latest point
    const lastPt = history[history.length - 1];
    const lastX = (history.length - 1) * step;
    const lastY = getY(lastPt.avg);

    ctx.fillStyle = lastPt.blink ? '#ef4444' : '#2563eb';
    ctx.beginPath();
    ctx.arc(lastX, lastY, lastPt.blink ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (lastPt.blink) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [currentEarLeft, currentEarRight, currentEarAvg, isBlinking, threshold, historyLength]);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech uppercase font-semibold text-slate-900 tracking-wider">
            EAR Waveform Telemetry
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-tech ${
            isBlinking ? 'bg-red-100 text-red-700 font-bold' : 'bg-slate-100 text-slate-600'
          }`}>
            {isBlinking ? 'BLINK DETECTED' : 'OPEN'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
            Mean: <strong className="text-slate-900">{currentEarAvg.toFixed(3)}</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">L: {currentEarLeft.toFixed(2)}</span>
          <span className="text-slate-500">R: {currentEarRight.toFixed(2)}</span>
        </div>
      </div>

      <div className="relative border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
        <canvas
          ref={canvasRef}
          width={520}
          height={130}
          className="w-full h-28 block"
        />
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono-tech">
        <span>WINDOW: 80 FRAMES (~1.3s)</span>
        <span>SAMPLING: 60Hz</span>
        <span className="text-blue-600 font-medium">FORMULA: (||p2-p6|| + ||p3-p5||)/(2*||p1-p4||)</span>
      </div>
    </div>
  );
};
