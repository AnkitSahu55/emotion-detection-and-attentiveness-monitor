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
    if (historyRef.current.length > historyLength) historyRef.current.shift();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#f1f3f7';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const minVal = 0.05;
    const maxVal = 0.42;
    const getY = (val: number) => h - ((val - minVal) / (maxVal - minVal)) * (h - 16) - 8;

    // Threshold line
    const threshY = getY(threshold);
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, threshY); ctx.lineTo(w, threshY); ctx.stroke();
    ctx.setLineDash([]);

    // Threshold label
    ctx.fillStyle = 'rgba(220, 38, 38, 0.7)';
    ctx.font = `9px "JetBrains Mono", monospace`;
    ctx.fillText(`blink ≤ ${threshold.toFixed(2)}`, 6, threshY - 4);

    const history = historyRef.current;
    if (history.length < 2) return;

    const step = w / (historyLength - 1);

    // Left eye line — light blue
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.left);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Right eye line — sky blue
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.right);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Average EAR — solid accent blue
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    history.forEach((pt, i) => {
      const x = i * step;
      const y = getY(pt.avg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current position dot
    const lastPt = history[history.length - 1];
    const lastX = (history.length - 1) * step;
    const lastY = getY(lastPt.avg);

    if (lastPt.blink) {
      // Blink pulse ring
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lastX, lastY, 10, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.fillStyle = lastPt.blink ? '#dc2626' : '#2563eb';
    ctx.beginPath();
    ctx.arc(lastX, lastY, lastPt.blink ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }, [currentEarLeft, currentEarRight, currentEarAvg, isBlinking, threshold, historyLength]);

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Eye Aspect Ratio (EAR)
          </span>
          {isBlinking && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{
                backgroundColor: 'var(--color-danger-soft)',
                color: 'var(--color-danger)',
                border: '1px solid #fecaca',
              }}
              role="status"
              aria-live="polite"
            >
              Blink
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: '#2563eb' }}
            />
            <span className="font-data">{currentEarAvg.toFixed(3)}</span>
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span className="font-data">L {currentEarLeft.toFixed(2)}</span>
          <span className="font-data">R {currentEarRight.toFixed(2)}</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid var(--color-border-subtle)' }}
        role="img"
        aria-label={`EAR waveform chart. Current average EAR: ${currentEarAvg.toFixed(3)}. ${isBlinking ? 'Blink detected.' : ''}`}
      >
        <canvas
          ref={canvasRef}
          width={520}
          height={96}
          className="w-full block"
          style={{ height: 96 }}
        />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-2 text-[10px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span>80-frame window (~1.3 s)</span>
        <span className="font-data">EAR = (‖p₂−p₆‖ + ‖p₃−p₅‖) / (2·‖p₁−p₄‖)</span>
      </div>
    </div>
  );
};
