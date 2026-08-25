import { useState } from 'react';
import type { PageView } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveMonitor } from './components/LiveMonitor';
import { TechnicalSpecs } from './components/TechnicalSpecs';
import { PrivacySecurity } from './components/PrivacySecurity';
import { Documentation } from './components/Documentation';
import { Footer } from './components/Footer';

export function App() {
  const [activePage, setActivePage] = useState<PageView>('home');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const handleToggleCamera = () => {
    setIsCameraActive(prev => !prev);
    // If user clicked initialize camera from another page, jump to live monitor
    if (activePage !== 'home') {
      setActivePage('home');
    }
  };

  const handleOpenLiveMonitor = () => {
    setActivePage('home');
    const monitorElem = document.getElementById('live-monitor-viewport');
    if (monitorElem) {
      monitorElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 bg-precision-grid">
      {/* Top Application Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        fps={60}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activePage === 'home' && (
          <div>
            {/* Hero Section with Workspace Photo Placeholder and Primary CTA */}
            <HeroSection
              onInitializeCamera={handleToggleCamera}
              isCameraActive={isCameraActive}
              onOpenLiveMonitor={handleOpenLiveMonitor}
            />

            {/* Live Engagement Application Shell */}
            <div id="live-monitor-viewport" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Live Telemetry HUD & 3D Spatial Canvas
                  </h2>
                  <p className="text-xs text-slate-500 font-mono-tech">
                    Real-time affective computing, ocular metrics, and volumetric mesh regression
                  </p>
                </div>
              </div>

              <LiveMonitor
                isCameraActive={isCameraActive}
                onToggleCamera={handleToggleCamera}
              />
            </div>
          </div>
        )}

        {activePage === 'specs' && (
          <div className="px-4 sm:px-6 lg:px-8">
            <TechnicalSpecs />
          </div>
        )}

        {activePage === 'privacy' && (
          <div className="px-4 sm:px-6 lg:px-8">
            <PrivacySecurity />
          </div>
        )}

        {activePage === 'docs' && (
          <div className="px-4 sm:px-6 lg:px-8">
            <Documentation />
          </div>
        )}
      </main>

      {/* Engineering Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default App;
