import React from 'react';
import type { PageView } from '../types';
import type { BackendStatus } from '../hooks/useBackendStream';
import { Camera, Square, Wifi, WifiOff } from 'lucide-react';

const PAGE_TITLES: Record<PageView, { title: string; subtitle: string }> = {
  home: { title: 'Live Monitor', subtitle: 'Real-time facial expression & attentiveness analysis' },
  analytics: { title: 'Analytics', subtitle: 'Session performance insights and trends' },
  specs: { title: 'Specifications', subtitle: 'Technical architecture and pipeline benchmarks' },
  privacy: { title: 'Privacy', subtitle: 'Zero-egress data handling and compliance' },
  docs: { title: 'Documentation', subtitle: 'Integration guide and API reference' },
  settings: { title: 'Settings', subtitle: 'Camera, monitoring, and appearance preferences' },
};

interface TopBarProps {
  activePage: PageView;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  backendStatus: BackendStatus;
  isUsingBackend: boolean;
  fps: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  isCameraActive,
  onToggleCamera,
  backendStatus,
  isUsingBackend,
  fps,
}) => {
  const pageInfo = PAGE_TITLES[activePage];

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        gridColumn: '2',
        gridRow: '1',
      }}
      className="sticky top-0 z-20 flex items-center justify-between px-6"
    >
      {/* Page title */}
      <div>
        <h1 className="text-[15px] font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
          {pageInfo.title}
        </h1>
        <p className="text-[12px] mt-1 leading-none" style={{ color: 'var(--color-text-muted)' }}>
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Backend status pill — only show when camera active */}
        {isCameraActive && (
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {isUsingBackend ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : backendStatus === 'error' ? (
              <WifiOff className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${isUsingBackend ? 'bg-emerald-500' : 'bg-blue-400'} ${isCameraActive ? 'pulse-live' : ''}`}
              />
            )}
            <span className="font-data">
              {isUsingBackend
                ? 'Live inference'
                : backendStatus === 'connecting'
                  ? 'Connecting…'
                  : backendStatus === 'error'
                    ? 'Backend offline'
                    : 'Simulation'}
            </span>
            {fps > 0 && (
              <>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <span className="font-data">{fps} fps</span>
              </>
            )}
          </div>
        )}

        {/* Camera toggle button */}
        <button
          onClick={onToggleCamera}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer shadow-sm"
          style={
            isCameraActive
              ? {
                backgroundColor: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }
              : {
                backgroundColor: 'var(--color-accent)',
                border: '1px solid var(--color-accent)',
                color: '#ffffff',
              }
          }
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            if (isCameraActive) {
              btn.style.backgroundColor = 'var(--color-surface-hover)';
            } else {
              btn.style.backgroundColor = 'var(--color-accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            if (isCameraActive) {
              btn.style.backgroundColor = 'var(--color-surface-raised)';
            } else {
              btn.style.backgroundColor = 'var(--color-accent)';
            }
          }}
          aria-label={isCameraActive ? 'Stop monitoring session' : 'Start monitoring session'}
        >
          {isCameraActive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Start Monitoring</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

