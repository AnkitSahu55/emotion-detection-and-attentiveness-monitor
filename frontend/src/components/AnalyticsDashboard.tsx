import React from 'react';
import { BarChart2, Clock, TrendingUp, Eye, Smile, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const statCards = [
    { label: 'Sessions recorded', value: '0', sub: 'In-memory buffer only', icon: Clock },
    { label: 'Attentiveness baseline', value: '85', sub: 'Optimal target threshold', icon: TrendingUp },
    { label: 'Landmark precision', value: '468', sub: '3D facial topology points', icon: Eye },
    { label: 'Expression classes', value: '8', sub: 'Geometry classification types', icon: Smile },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Informational banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
        role="note"
        aria-label="Analytics scope"
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Volatile session-scoped analytics
          </p>
          <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            To protect biometric privacy, FaceAware runs entirely within your device RAM and does not write user
            sessions to local storage or external servers. Use the <strong>Export CSV</strong> action in the Live
            Monitor to retain raw session telemetry.
          </p>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-4 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {card.label}
                </span>
                <Icon className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
              </div>
              <div className="text-[26px] font-bold font-data leading-none" style={{ color: 'var(--color-text)' }}>
                {card.value}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Facial expression signal classes reference */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Facial expression signal classes
          </h2>
        </div>
        <p className="text-[12px] mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          The machine-learning pipeline estimates one of 8 expression-signal classes per frame from geometric
          distances. These outputs represent facial action unit patterns, not direct measurements of internal
          emotional states.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Neutral', desc: 'Baseline relaxed posture' },
            { name: 'Engaged', desc: 'Sustained task attention' },
            { name: 'Focused', desc: 'Concentrated forward gaze' },
            { name: 'Inquisitive', desc: 'Asymmetric brow elevation' },
            { name: 'Surprised', desc: 'Palpebral fissure widening' },
            { name: 'Fatigued', desc: 'Low EAR and eyelid droop' },
            { name: 'Smiling', desc: 'Zygomaticus major activation' },
            { name: 'Confused', desc: 'Corrugator brow furrowing' },
          ].map((e) => (
            <div
              key={e.name}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div className="text-[12px] font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>
                {e.name}
              </div>
              <div className="text-[11px] leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                {e.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attentiveness score bands */}
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Attentiveness score bands
          </h2>
        </div>
        <p className="text-[12px] mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          The composite score (0–100) aggregates eye aspect ratio (EAR), eye closure percentage (PERCLOS),
          6-DoF head pose orientation, and expression signals.
        </p>

        <div className="space-y-2">
          {[
            { label: 'Optimal / Focused', range: '85–100', color: '#16a34a', desc: 'Stable gaze, open eye aperture, forward head pose' },
            { label: 'Alert / Attentive', range: '65–84', color: '#1d4ed8', desc: 'Nominal head orientation, periodic natural blinks' },
            { label: 'Distracted', range: '45–64', color: '#d97706', desc: 'Significant yaw rotation, gaze shifted from monitor' },
            { label: 'Fatigued / Drowsy', range: '0–44', color: '#dc2626', desc: 'PERCLOS > 15%, prolonged blink duration, head droop' },
          ].map((band) => (
            <div
              key={band.label}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <div className="w-32 flex-shrink-0">
                <div className="text-[11px] font-semibold" style={{ color: 'var(--color-text)' }}>
                  {band.label}
                </div>
                <div className="text-[11px] font-data" style={{ color: band.color }}>
                  {band.range}
                </div>
              </div>
              <div className="flex-1">
                <div
                  className="h-1.5 w-full rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${parseInt(band.range.split('–')[1])}%`,
                      backgroundColor: band.color,
                    }}
                  />
                </div>
              </div>
              <div
                className="text-[11px] hidden sm:block flex-1 max-w-sm text-right"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {band.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSV export tip */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <FileSpreadsheet className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Session data can be exported in RFC 4180 CSV format with microsecond timestamps, EAR left/right ratios,
          PERCLOS percentage, and 6-DoF yaw/pitch/roll angles for external scientific analysis in Python or R.
        </p>
      </div>
    </div>
  );
};
