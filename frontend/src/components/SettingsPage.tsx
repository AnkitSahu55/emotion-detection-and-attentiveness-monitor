import React, { useState } from 'react';
import { Camera, Monitor, Shield, Info } from 'lucide-react';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

const Toggle: React.FC<ToggleProps> = ({ id, checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <label htmlFor={id} className="text-[13px] font-medium cursor-pointer" style={{ color: 'var(--color-text)' }}>
        {label}
      </label>
      {description && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      )}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  </div>
);

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, icon: Icon, children }) => (
  <div
    className="rounded-xl p-5"
    style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-xs)',
    }}
  >
    <div className="flex items-start gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--color-accent-soft)', border: '1px solid var(--color-accent-border)' }}
      >
        <Icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
      </div>
      <div>
        <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        {description && (
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const SettingsPage: React.FC = () => {
  const [showMesh, setShowMesh] = useState(true);
  const [showIris, setShowIris] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [autoRecord, setAutoRecord] = useState(false);
  const [cameraRes, setCameraRes] = useState<'480p' | '720p'>('480p');

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      <Section
        title="Camera"
        description="Video input preferences"
        icon={Camera}
      >
        <div>
          <label className="text-[13px] font-medium block mb-2" style={{ color: 'var(--color-text)' }}>
            Capture resolution
          </label>
          <div className="flex gap-2">
            {(['480p', '720p'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setCameraRes(res)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all"
                style={
                  cameraRes === res
                    ? {
                      backgroundColor: 'var(--color-accent)',
                      color: '#ffffff',
                      border: '1px solid var(--color-accent)',
                    }
                    : {
                      backgroundColor: 'var(--color-surface-raised)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }
                }
              >
                {res}
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Higher resolution increases accuracy but raises CPU load. 480p is recommended for most devices.
          </p>
        </div>

        <div className="pt-2" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <Toggle
            id="facing-mode"
            checked={true}
            onChange={() => { }}
            label="Mirror video preview"
            description="Flips the camera preview horizontally (selfie orientation)"
          />
        </div>
      </Section>

      <Section
        title="Monitoring display"
        description="Overlay and visualization options for the live monitor"
        icon={Monitor}
      >
        <Toggle
          id="show-mesh"
          checked={showMesh}
          onChange={setShowMesh}
          label="Show face mesh (468 pts)"
          description="Renders all 468 landmark points as a wireframe overlay"
        />
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
          <Toggle
            id="show-iris"
            checked={showIris}
            onChange={setShowIris}
            label="Show iris tracking"
            description="Draws iris center and gaze direction vectors"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
          <Toggle
            id="show-axes"
            checked={showAxes}
            onChange={setShowAxes}
            label="Show head pose axes"
            description="Displays X, Y, Z rotation axes relative to nose tip"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
          <Toggle
            id="show-box"
            checked={showBoundingBox}
            onChange={setShowBoundingBox}
            label="Show face bounding box"
            description="Draws a bounding rectangle around the detected face"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
          <Toggle
            id="auto-record"
            checked={autoRecord}
            onChange={setAutoRecord}
            label="Auto-start recording"
            description="Begins logging frames to CSV buffer immediately when camera starts"
          />
        </div>
      </Section>

      <Section
        title="Privacy"
        description="Data handling and processing scope"
        icon={Shield}
      >
        <div
          className="p-4 rounded-lg space-y-2"
          style={{ backgroundColor: 'var(--color-success-soft)', border: '1px solid #bbf7d0' }}
        >
          {[
            'All processing happens locally in your browser',
            'No video frames are sent to any server',
            'No biometric data is stored to disk',
            'Session data is cleared when you close the tab',
            'The optional CSV export is initiated by you and stays on your device',
          ].map((point) => (
            <div key={point} className="flex items-start gap-2 text-[12px]" style={{ color: '#065f46' }}>
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              {point}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="About"
        description="Application information"
        icon={Info}
      >
        <div className="grid grid-cols-2 gap-3 font-data text-[12px]">
          {[
            { label: 'Application', value: 'FaceAware Monitor' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Backend', value: 'FastAPI + MediaPipe' },
            { label: 'WebSocket', value: 'ws://localhost:8765' },
            { label: 'Landmark model', value: 'MediaPipe FaceMesh' },
            { label: 'Landmark points', value: '468 pts' },
            { label: 'Frame rate', value: '15 fps to backend' },
            { label: 'License', value: 'Educational use' },
          ].map((row) => (
            <div key={row.label}>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{row.label}</div>
              <div className="font-medium mt-0.5" style={{ color: 'var(--color-text)' }}>{row.value}</div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
};
