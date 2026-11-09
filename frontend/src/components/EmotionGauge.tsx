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

const STATE_CONFIG: Record<AttentivenessState, { label: string; color: string; bar: string }> = {
  optimal:    { label: 'Focused',    color: 'text-blue-600',  bar: 'bg-blue-500' },
  alert:      { label: 'Attentive',  color: 'text-gray-700',  bar: 'bg-gray-400' },
  distracted: { label: 'Distracted', color: 'text-amber-600', bar: 'bg-amber-400' },
  fatigued:   { label: 'Fatigued',   color: 'text-red-600',   bar: 'bg-red-400' },
};

const EMOTION_COLORS: Record<EmotionType, string> = {
  Neutral:    'bg-gray-300',
  Engaged:    'bg-blue-400',
  Focused:    'bg-blue-500',
  Inquisitive:'bg-violet-400',
  Surprised:  'bg-amber-400',
  Fatigued:   'bg-red-400',
  Smiling:    'bg-emerald-400',
  Confused:   'bg-orange-400',
};

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

      {/* Attentiveness card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Radial gauge */}
          <div className="relative flex-shrink-0">
            <svg className="w-22 h-22 -rotate-90" width="88" height="88">
              <circle cx="44" cy="44" r={radius} stroke="#f3f4f6" strokeWidth="7" fill="transparent" />
              <circle
                cx="44" cy="44" r={radius}
                stroke="#2563eb"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-data text-gray-900">{attentivenessScore}</span>
              <span className="text-[10px] text-gray-400 font-data">/100</span>
            </div>
          </div>

          {/* Right side stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">Attentiveness</span>
              <span className={`text-xs font-medium ${stateConf.color}`}>{stateConf.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="block text-[10px] text-gray-400 mb-0.5">Eye closure (PERCLOS)</span>
                <span className="text-sm font-bold font-data text-gray-900">{perclos}%</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="block text-[10px] text-gray-400 mb-0.5">Blink rate</span>
                <span className="text-sm font-bold font-data text-gray-900">{blinkRateBpm} <span className="text-xs font-normal text-gray-400">bpm</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion classification card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">Emotion</span>
          <span className="text-xs text-gray-500">
            <span className="font-medium text-gray-800">{dominantEmotion}</span>
            <span className="font-data text-gray-400"> · {emotionConfidence}%</span>
          </span>
        </div>

        <div className="space-y-1.5">
          {(Object.keys(emotionProbabilities) as EmotionType[]).map(emotion => {
            const prob = emotionProbabilities[emotion] || 0;
            const pct = Math.round(prob * 100);
            const isDominant = emotion === dominantEmotion;

            return (
              <div key={emotion} className="flex items-center gap-2.5">
                <span className={`text-xs w-20 flex-shrink-0 ${isDominant ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                  {emotion}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      isDominant ? EMOTION_COLORS[emotion] : 'bg-gray-200'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-[11px] font-data w-8 text-right ${isDominant ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Head pose card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">Head orientation</span>
          <span className="text-xs text-gray-400">6-DoF</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Yaw (L/R)', value: headPose.yaw, max: 45 },
            { label: 'Pitch (U/D)', value: headPose.pitch, max: 30 },
            { label: 'Roll (tilt)', value: headPose.roll, max: 25 },
          ].map(({ label, value, max }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2.5 text-center">
              <span className="block text-[10px] text-gray-400 mb-1">{label}</span>
              <span className="text-sm font-bold font-data text-gray-900">
                {value > 0 ? `+${value}` : value}°
              </span>
              <div className="w-full bg-gray-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, (Math.abs(value) / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
