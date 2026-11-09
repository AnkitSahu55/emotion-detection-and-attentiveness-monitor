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
    <section className="relative pt-10 pb-12 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Real-time facial emotion<br />
                <span className="text-blue-600">& attentiveness tracking</span>
              </h1>
              <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-lg">
                Detects 468 face landmarks, computes eye aspect ratio, blink rate, head orientation, 
                and classifies emotional state — all processed locally, nothing sent to a server.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onInitializeCamera}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-blue-200/60 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                {isCameraActive ? 'Camera active' : 'Start camera'}
              </button>

              <button
                onClick={onOpenLiveMonitor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-sm transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-blue-600" />
                Open monitor
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Specs strip */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
              {[
                { label: 'Landmarks', value: '468 pts' },
                { label: 'Latency target', value: '<60 ms' },
                { label: 'Data egress', value: 'None' },
              ].map(stat => (
                <div key={stat.label}>
                  <span className="block text-xs text-gray-400 mb-0.5">{stat.label}</span>
                  <span className="block text-base font-bold font-data text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Workspace image */}
          <div className="relative rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden aspect-video shadow-sm">
            <img
              src="/workspace_hero.jpg"
              alt="Workspace showing facial landmark mesh overlay on a laptop screen"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/70 backdrop-blur-sm text-white text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-live" />
              <span>468-point 3D face mesh</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
