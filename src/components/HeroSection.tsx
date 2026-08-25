import React from 'react';
import { Camera, ArrowRight, Activity } from 'lucide-react';

interface HeroSectionProps {
  onInitializeCamera: () => void;
  isCameraActive: boolean;
  onOpenLiveMonitor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onInitializeCamera,
  isCameraActive,
  onOpenLiveMonitor,
}) => {
  return (
    <section className="relative pt-8 pb-12 border-b border-slate-200 bg-linear-to-b from-slate-50/50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono-tech mb-6 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 radar-live" />
          <span>SYNTHETIC PRECISION BIOMETRICS ENGINE • ZERO-NETWORK FOOTPRINT</span>
        </div>

        {/* Hero Title & Subtitle Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Live Facial Emotion & <br className="hidden sm:inline" />
              <span className="text-blue-600">Attentiveness Monitor</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              High-frequency, edge-computed affective computing and spatial landmark regression. 
              Tracks 468 volumetric 3D coordinates, micro-saccadic eye aspect ratios (EAR), and head orientation in volatile memory with zero cloud egress.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onInitializeCamera}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold font-mono-tech text-sm transition-all shadow-md hover:shadow-blue-200 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraActive ? 'Stream Live Active' : 'Initialize Camera'}</span>
              </button>

              <button
                onClick={onOpenLiveMonitor}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold font-mono-tech text-sm transition-all shadow-xs cursor-pointer"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Open Telemetry HUD</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick Spec Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 max-w-xl">
              <div>
                <span className="text-slate-400 text-[11px] font-mono-tech block">SPATIAL MESH</span>
                <span className="text-slate-900 text-base font-bold font-mono-tech">468 Points</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-mono-tech block">END-TO-END LATENCY</span>
                <span className="text-blue-600 text-base font-bold font-mono-tech">&lt;60 ms</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-mono-tech block">NETWORK EGRESS</span>
                <span className="text-slate-900 text-base font-bold font-mono-tech">0.00 KB (Airgapped)</span>
              </div>
            </div>
          </div>

          {/* Realistic Workspace Photo Hero Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="relative rounded-xl overflow-hidden aspect-16/10 bg-slate-100">
                <img
                  src="/workspace_hero.jpg"
                  alt="Well-lit workspace desk with laptop displaying 3D facial landmark mesh"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                />
                
                {/* Visual Glass Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 radar-live" />
                    <span className="text-xs font-mono-tech font-medium">3D Facial Landmark Mesh Display</span>
                  </div>
                  <span className="text-[11px] font-mono-tech text-blue-400">468 Vertices</span>
                </div>

                {/* Floating Precision Hotspot Pin */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-mono-tech backdrop-blur-xs border border-blue-400 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>EAR & Pose Tracking</span>
                </div>
              </div>

              {/* Caption text below image */}
              <div className="px-2 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
                <span>DEPLOYED WORKSPACE BENCHMARK</span>
                <span className="text-slate-400">LOCAL VOLATILE MEMORY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
