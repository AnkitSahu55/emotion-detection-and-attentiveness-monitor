import React from 'react';
import type { PageView } from '../types';
import { ShieldCheck, Cpu, BookOpen, Activity, Play, Square } from 'lucide-react';

interface NavbarProps {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  fps: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  isCameraActive,
  onToggleCamera,
  fps,
}) => {
  const navItems: { id: PageView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Live Monitor', icon: Activity },
    { id: 'specs', label: 'Technical Specs', icon: Cpu },
    { id: 'privacy', label: 'Privacy & Architecture', icon: ShieldCheck },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                {/* Precision Geometric Grid Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    Live Facial Emotion & Attentiveness Monitor
                  </span>
                  <span className="hidden md:inline-block text-[10px] uppercase font-mono-tech px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    v2.4 LTS
                  </span>
                </div>
                <span className="text-[11px] font-mono-tech text-slate-400 block -mt-0.5">
                  SYNTHETIC PRECISION ENGINE
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono-tech transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Pill & Camera Action */}
          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono-tech text-slate-600">
              <span className={`inline-block w-2 h-2 rounded-full ${isCameraActive ? 'bg-blue-600 radar-live' : 'bg-emerald-500'}`} />
              <span>{isCameraActive ? 'STREAM ACTIVE' : 'ENGINE READY'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-900 font-semibold">{fps} FPS</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600 font-medium">LOCAL RAM</span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onToggleCamera}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono-tech transition-all shadow-xs cursor-pointer ${
                isCameraActive
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCameraActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Initialize Camera</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tech whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
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
