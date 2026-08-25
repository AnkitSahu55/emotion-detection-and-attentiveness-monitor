import React from 'react';
import type { PageView } from '../types';
import { ShieldCheck, ArrowUp } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-8">
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-mono-tech">
                SP
              </div>
              <span className="font-bold text-slate-900 text-sm">
                Synthetic Precision CV
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-mono-tech">
              Open specification & high-throughput client runtime for spatial facial landmark tracking, real-time EAR bio-telemetry, and affective state estimation.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono-tech text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Local RAM-Only Processing • Zero Cloud Egress</span>
            </div>
          </div>

          {/* Quick Nav (4 cols) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs font-mono-tech">
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px]">Interface</span>
              <ul className="space-y-1.5 text-slate-600">
                <li>
                  <button onClick={() => { setActivePage('home'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    Live Monitor HUD
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('specs'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    Technical Specs
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('privacy'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    Privacy Architecture
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block uppercase text-[11px]">Developer</span>
              <ul className="space-y-1.5 text-slate-600">
                <li>
                  <button onClick={() => { setActivePage('docs'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    Python / C++ SDK
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActivePage('docs'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    session_log.csv
                  </button>
                </li>
                <li>
                  <a href="#github" onClick={(e) => { e.preventDefault(); setActivePage('docs'); scrollToTop(); }} className="hover:text-blue-600 cursor-pointer">
                    GitHub / ONNX
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* System Telemetry & Back to Top (3 cols) */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between space-y-4">
            <div className="text-left md:text-right text-[11px] font-mono-tech text-slate-500 space-y-0.5">
              <div>ENGINE: <strong className="text-slate-900">468_SPATIAL_V2</strong></div>
              <div>LATENCY: <strong className="text-blue-600">&lt;60ms</strong> | CPU: <strong className="text-emerald-600">&lt;30%</strong></div>
              <div>SECURITY: <strong className="text-slate-900">AIRGAPPED</strong></div>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono-tech text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono-tech text-slate-400">
          <span>&copy; 2026 Synthetic Precision CV Systems. All rights reserved.</span>
          <span>Designed with Crisp White, Soft Slate Grey & Cool Blue.</span>
        </div>
      </div>
    </footer>
  );
};
