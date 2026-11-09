import React, { useState } from 'react';
import type { PageView } from '../types';
import {
  Activity,
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Eye,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'home', label: 'Live Monitor', icon: Eye },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'specs', label: 'Specifications', icon: Cpu },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
];

const BOTTOM_NAV: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  isCameraActive: boolean;
  backendStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isUsingBackend: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isCameraActive,
  backendStatus,
  isUsingBackend,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const statusDot = isCameraActive
    ? isUsingBackend
      ? 'bg-emerald-400'
      : backendStatus === 'connecting'
      ? 'bg-amber-400'
      : backendStatus === 'error'
      ? 'bg-red-400'
      : 'bg-blue-400'
    : 'bg-gray-600';

  const statusLabel = isCameraActive
    ? isUsingBackend
      ? 'Live inference'
      : backendStatus === 'connecting'
      ? 'Connecting…'
      : backendStatus === 'error'
      ? 'Backend offline'
      : 'Simulation'
    : 'Offline';

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-sidebar-border)',
        gridRow: '1 / -1',
      }}
      className="flex flex-col h-screen sticky top-0 transition-all duration-180 z-30 overflow-hidden"
      aria-label="Application sidebar"
    >
      {/* Brand header */}
      <div
        style={{
          height: 'var(--topbar-height)',
          borderBottom: '1px solid var(--color-sidebar-border)',
        }}
        className="flex items-center justify-between px-3.5 flex-shrink-0"
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Activity className="w-4 h-4 text-white" strokeWidth={1.8} />
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold text-white leading-none tracking-tight truncate">
                FaceAware
              </div>
              <div
                className="text-[11px] mt-1 font-data leading-none"
                style={{ color: 'var(--color-sidebar-muted)' }}
              >
                v1.0 · Edge Runtime
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center mx-auto"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Activity className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1" role="navigation">
        {!collapsed && (
          <div
            className="text-[11px] font-medium px-2.5 mb-2"
            style={{ color: 'var(--color-sidebar-muted)' }}
          >
            Navigation
          </div>
        )}

        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="w-full h-9 flex items-center gap-2.5 px-2.5 rounded-md text-[13px] transition-all duration-150 cursor-pointer text-left"
              style={{
                backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--color-sidebar-text)' : 'var(--color-sidebar-secondary)',
                border: isActive
                  ? '1px solid var(--color-sidebar-border)'
                  : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                strokeWidth={1.6}
              />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="ml-auto text-[10px] font-data px-1.5 py-0.2 rounded font-semibold"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System status pill */}
      {!collapsed && (
        <div
          className="mx-2 mb-2 p-2.5 rounded-md"
          style={{
            backgroundColor: 'var(--color-sidebar-card)',
            border: '1px solid var(--color-sidebar-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot} ${
                isCameraActive ? 'pulse-live' : ''
              }`}
            />
            <span
              className="text-[11px] font-medium truncate"
              style={{ color: 'var(--color-sidebar-text)' }}
            >
              {statusLabel}
            </span>
          </div>
          <div
            className="text-[10px] font-data mt-1"
            style={{ color: 'var(--color-sidebar-muted)' }}
          >
            Zero cloud egress · RAM only
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div
        className="px-2 py-2 space-y-1"
        style={{ borderTop: '1px solid var(--color-sidebar-border)' }}
      >
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className="w-full h-9 flex items-center gap-2.5 px-2.5 rounded-md text-[13px] transition-all duration-150 cursor-pointer text-left"
              style={{
                backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                color: isActive ? 'var(--color-sidebar-text)' : 'var(--color-sidebar-secondary)',
                border: isActive
                  ? '1px solid var(--color-sidebar-border)'
                  : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.6} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full h-8 flex items-center gap-2 px-2.5 rounded-md transition-all duration-150 cursor-pointer text-left"
          style={{ color: 'var(--color-sidebar-muted)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-sidebar-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-sidebar-text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-sidebar-muted)';
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" strokeWidth={1.6} />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" strokeWidth={1.6} />
              <span className="text-[12px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
