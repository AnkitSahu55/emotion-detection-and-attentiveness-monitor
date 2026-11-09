import React from 'react';
import type { EmotionType, AttentivenessState, HeadPose } from '../types';

interface EmotionGaugeProps {
  attentivenessScore: number;
  attentivenessState: AttentivenessState;
  dominantEmotion: EmotionType;
  emotionConfidence: number;
  emotionProbabilities: Record<EmotionType, number>;
  headPose: HeadPose;
  perclos: number;
  blinkRateBpm: number;
}

const STATE_CONFIG: Record<AttentivenessState, { label: string; color: string; ring: string; badge: string }> = {
  optimal:    { label: 'Focused',    color: '#2563eb', ring: '#2563eb',  badge: '#eff6ff' },
  alert:      { label: 'Attentive',  color: '#059669', ring: '#059669',  badge: '#ecfdf5' },
  distracted: { label: 'Distracted', color: '#d97706', ring: '#d97706',  badge: '#fffbeb' },
  fatigued:   { label: 'Fatigued',   color: '#dc2626', ring: '#dc2626',  badge: '#fef2f2' },
};

const EMOTION_COLORS: Record<EmotionType, string> = {
  Neutral:     '#9ca3af',
  Engaged:     '#3b82f6',
  Focused:     '#2563eb',
  Inquisitive: '#8b5cf6',
  Surprised:   '#f59e0b',
  Fatigued:    '#ef4444',
  Smiling:     '#10b981',
  Confused:    '#f97316',
};

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

export const EmotionGauge: React.FC<EmotionGaugeProps> = ({
  attentivenessScore,
  attentivenessState,
  dominantEmotion,
  emotionConfidence,
  emotionProbabilities,
  headPose,
  perclos,
  blinkRateBpm,
}) => {
  const stateConf = STATE_CONFIG[attentivenessState];

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attentivenessScore / 100) * circumference;

  return (
    <div className="space-y-3">

      {/* ── Attentiveness card ─────────────────── */}
      <Card className="p-4">
        <div
          className="text-[12px] font-medium mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Attentiveness estimate
        </div>
        <div className="flex items-center gap-4">
          {/* Radial gauge */}
          <div className="relative flex-shrink-0" role="img" aria-label={`Attentiveness score: ${attentivenessScore} out of 100`}>
            <svg className="-rotate-90" width="88" height="88" aria-hidden="true">
              <circle
                cx="44" cy="44" r={radius}
                stroke="var(--color-surface-raised)"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="44" cy="44" r={radius}
                stroke={stateConf.ring}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-[20px] font-bold font-data leading-none"
                style={{ color: 'var(--color-text)' }}
              >
                {attentivenessScore}
              </span>
              <span className="text-[10px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                /100
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
                State
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  color: stateConf.color,
                  backgroundColor: stateConf.badge,
                  border: `1px solid ${stateConf.color}30`,
                }}
              >
                {stateConf.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-lg p-2.5"
                style={{ backgroundColor: 'var(--color-surface-raised)' }}
              >
                <span
                  className="block text-[10px] font-medium mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Eye closure (PERCLOS)
                </span>
                <span
                  className="text-[14px] font-bold font-data"
                  style={{ color: 'var(--color-text)' }}
                >
                  {perclos}%
                </span>
              </div>
              <div
                className="rounded-lg p-2.5"
                style={{ backgroundColor: 'var(--color-surface-raised)' }}
              >
                <span
                  className="block text-[10px] font-medium mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Blink rate
                </span>
                <span
                  className="text-[14px] font-bold font-data"
                  style={{ color: 'var(--color-text)' }}
                >
                  {blinkRateBpm}{' '}
                  <span
                    className="text-[11px] font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    bpm
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Emotion classification card ───────── */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span
              className="text-[12px] font-medium block mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Expression signal
            </span>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
              {dominantEmotion}
            </span>
          </div>
          <div className="text-right">
            <span
              className="text-[11px] block"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Confidence
            </span>
            <span
              className="text-[20px] font-bold font-data leading-none"
              style={{ color: EMOTION_COLORS[dominantEmotion] }}
            >
              {emotionConfidence}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5" role="list" aria-label="Emotion probability distribution">
          {(Object.keys(emotionProbabilities) as EmotionType[]).map((emotion) => {
            const prob = emotionProbabilities[emotion] || 0;
            const pct = Math.round(prob * 100);
            const isDominant = emotion === dominantEmotion;

            return (
              <div
                key={emotion}
                className="flex items-center gap-2.5"
                role="listitem"
                aria-label={`${emotion}: ${pct}%`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isDominant ? EMOTION_COLORS[emotion] : 'var(--color-border)' }}
                />
                <span
                  className="text-[11px] w-20 flex-shrink-0"
                  style={{
                    color: isDominant ? 'var(--color-text)' : 'var(--color-text-muted)',
                    fontWeight: isDominant ? '600' : '400',
                  }}
                >
                  {emotion}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface-raised)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isDominant ? EMOTION_COLORS[emotion] : 'var(--color-border)',
                    }}
                  />
                </div>
                <span
                  className="text-[11px] font-data w-8 text-right"
                  style={{ color: isDominant ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        <p
          className="text-[10px] mt-3 pt-3 leading-relaxed"
          style={{
            color: 'var(--color-text-muted)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          Expression signals are model-estimated geometry patterns, not definitive measures of internal
          emotional state.
        </p>
      </Card>

      {/* ── Head orientation card ─────────────── */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[12px] font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Head orientation
          </span>
          <span
            className="text-[10px] font-data px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              color: 'var(--color-text-muted)',
            }}
          >
            6-DoF
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Head pose angles">
          {[
            { label: 'Yaw',   sublabel: 'L / R', value: headPose.yaw,   max: 45 },
            { label: 'Pitch', sublabel: 'U / D', value: headPose.pitch, max: 30 },
            { label: 'Roll',  sublabel: 'Tilt',  value: headPose.roll,  max: 25 },
          ].map(({ label, sublabel, value, max }) => {
            const pct = Math.min(100, (Math.abs(value) / max) * 100);
            const isOff = Math.abs(value) > max * 0.6;
            return (
              <div
                key={label}
                className="rounded-lg p-2.5 text-center"
                style={{ backgroundColor: 'var(--color-surface-raised)' }}
                aria-label={`${label}: ${value > 0 ? '+' : ''}${value}°`}
              >
                <div
                  className="text-[10px] font-medium"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {label}
                </div>
                <div
                  className="text-[10px] mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {sublabel}
                </div>
                <span
                  className="text-[14px] font-bold font-data"
                  style={{ color: isOff ? 'var(--color-warning)' : 'var(--color-text)' }}
                >
                  {value > 0 ? `+${value}` : value}°
                </span>
                <div
                  className="w-full h-1 rounded-full mt-1.5 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOff ? 'var(--color-warning)' : 'var(--color-accent)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
