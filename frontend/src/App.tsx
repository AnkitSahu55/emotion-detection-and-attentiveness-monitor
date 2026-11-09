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
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleToggleCamera = () => {
    setIsCameraActive(prev => !prev);
    if (activePage !== 'home') setActivePage('home');
  };

  const handleOpenLiveMonitor = () => {
    setActivePage('home');
    setTimeout(() => {
      document.getElementById('live-monitor-viewport')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        fps={60}
      />

      <main className="flex-1">
        {activePage === 'home' && (
          <div>
            <HeroSection
              onInitializeCamera={handleToggleCamera}
              isCameraActive={isCameraActive}
              onOpenLiveMonitor={handleOpenLiveMonitor}
            />

            <div id="live-monitor-viewport" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">Live Monitor</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Real-time face mesh, EAR waveform, and emotion classification
                </p>
              </div>
              <LiveMonitor
                isCameraActive={isCameraActive}
                onToggleCamera={handleToggleCamera}
              />
            </div>
          </div>
        )}

        {activePage === 'specs' && (
          <div className="px-4 sm:px-6 lg:px-8"><TechnicalSpecs /></div>
        )}
        {activePage === 'privacy' && (
          <div className="px-4 sm:px-6 lg:px-8"><PrivacySecurity /></div>
        )}
        {activePage === 'docs' && (
          <div className="px-4 sm:px-6 lg:px-8"><Documentation /></div>
        )}
      </main>

      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default App;
