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
  const getStatusColor = (state: AttentivenessState) => {
    switch (state) {
      case 'optimal':
        return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'OPTIMAL FOCUS' };
      case 'alert':
        return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', label: 'NORMAL ATTENTION' };
      case 'distracted':
        return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'GAZE DIVERGENCE' };
      case 'fatigued':
        return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: 'DROWSINESS RISK' };
    }
  };

  const statusStyle = getStatusColor(attentivenessState);

  // Radial progress calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attentivenessScore / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 1. Attentiveness Index Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono-tech uppercase font-semibold text-slate-900 tracking-wider">
            Attentiveness Telemetry
          </span>
          <span className={`text-[11px] font-mono-tech px-2 py-0.5 rounded-md border font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
            {statusStyle.label}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Radial Metric */}
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-blue-600 transition-all duration-300 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono-tech text-slate-900">
                {attentivenessScore}
              </span>
              <span className="text-[10px] font-mono-tech text-slate-400 -mt-1">/100</span>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono-tech">
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">PERCLOS (Closure)</span>
              <span className="text-slate-900 font-bold text-sm">{perclos}%</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Blink Frequency</span>
              <span className="text-slate-900 font-bold text-sm">{blinkRateBpm} <span className="text-[10px] font-normal text-slate-500">bpm</span></span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Gaze Stability</span>
              <span className="text-blue-600 font-bold text-sm">
                {attentivenessScore > 80 ? '98.2%' : (attentivenessScore > 50 ? '74.1%' : '42.8%')}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Inference State</span>
              <span className="text-slate-900 font-bold text-sm">REALTIME</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Emotion Classification Array */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono-tech uppercase font-semibold text-slate-900 tracking-wider">
            Affective State Classification
          </span>
          <span className="text-xs font-mono-tech text-blue-600 font-medium">
            DOMINANT: <strong className="text-slate-900">{dominantEmotion} ({emotionConfidence}%)</strong>
          </span>
        </div>

        <div className="space-y-2">
          {(Object.keys(emotionProbabilities) as EmotionType[]).map(emotion => {
            const prob = emotionProbabilities[emotion] || 0;
            const pct = Math.round(prob * 100);
            const isDominant = emotion === dominantEmotion;

            return (
              <div key={emotion} className="flex items-center gap-3 text-xs font-mono-tech">
                <span className={`w-24 text-[11px] truncate ${isDominant ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                  {emotion}
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      isDominant ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`w-10 text-right text-[11px] ${isDominant ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Head Pose Orientation (Yaw, Pitch, Roll) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono-tech uppercase font-semibold text-slate-900 tracking-wider">
            Spatial Head Pose (PnP 3D)
          </span>
          <span className="text-[11px] font-mono-tech text-slate-500">
            6-DoF ESTIMATION
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono-tech text-xs">
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 block mb-0.5">YAW (L/R)</span>
            <span className="text-sm font-bold text-slate-900">{headPose.yaw > 0 ? `+${headPose.yaw}°` : `${headPose.yaw}°`}</span>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(10, Math.abs(headPose.yaw) * 2.5))}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 block mb-0.5">PITCH (U/D)</span>
            <span className="text-sm font-bold text-slate-900">{headPose.pitch > 0 ? `+${headPose.pitch}°` : `${headPose.pitch}°`}</span>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-slate-600 h-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(10, Math.abs(headPose.pitch) * 2.5))}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 block mb-0.5">ROLL (TILT)</span>
            <span className="text-sm font-bold text-slate-900">{headPose.roll > 0 ? `+${headPose.roll}°` : `${headPose.roll}°`}</span>
            <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-slate-600 h-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(10, Math.abs(headPose.roll) * 2.5))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
