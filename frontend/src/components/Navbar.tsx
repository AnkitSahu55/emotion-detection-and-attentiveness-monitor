import React from 'react';
import type { PageView } from '../types';
import { ShieldCheck, Cpu, BookOpen, Activity, Play, Square } from 'lucide-react';

interface NavbarProps {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  fps: number;
  backendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  isCameraActive,
  onToggleCamera,
  fps,
  backendConnected = false,
}) => {
  const navItems: { id: PageView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Monitor', icon: Activity },
    { id: 'specs', label: 'Specs', icon: Cpu },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
    { id: 'docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <path d="M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              FaceAware
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            {isCameraActive && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-xs text-gray-500">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  backendConnected ? 'bg-green-500 pulse-live' : 'bg-blue-500 pulse-live'
                }`} />
                <span className="font-data">
                  {backendConnected ? 'Live inference' : 'Simulation'}
                </span>
                <span className="text-gray-300">·</span>
                <span className="font-data text-gray-700 font-medium">{fps} fps</span>
              </div>
            )}

            <button
              onClick={onToggleCamera}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer ${
                isCameraActive
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCameraActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-gray-600 text-gray-600" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 py-2 border-t border-gray-100 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
