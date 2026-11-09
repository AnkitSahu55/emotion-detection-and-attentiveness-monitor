import { useState } from 'react';
import type { PageView } from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LiveMonitor } from './components/LiveMonitor';
import { TechnicalSpecs } from './components/TechnicalSpecs';
import { PrivacySecurity } from './components/PrivacySecurity';
import { Documentation } from './components/Documentation';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsPage } from './components/SettingsPage';
import type { BackendStatus } from './hooks/useBackendStream';

export function App() {
  const [activePage, setActivePage] = useState<PageView>('home');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('disconnected');
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  const [fps, setFps] = useState(0);

  const handleToggleCamera = () => {
    setIsCameraActive((prev) => !prev);
  };

  return (
    <div
      className="app-layout"
      style={{ minHeight: '100vh' }}
    >
      {/* Sidebar — spans both rows */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCameraActive={isCameraActive}
        backendStatus={backendStatus}
        isUsingBackend={isUsingBackend}
      />

      {/* Top bar — col 2, row 1 */}
      <TopBar
        activePage={activePage}
        isCameraActive={isCameraActive}
        onToggleCamera={handleToggleCamera}
        backendStatus={backendStatus}
        isUsingBackend={isUsingBackend}
        fps={fps}
      />

      {/* Main content — col 2, row 2 */}
      <main
        className="overflow-y-auto animate-fade-in"
        style={{
          gridColumn: '2',
          gridRow: '2',
          backgroundColor: 'var(--color-bg)',
        }}
        id="main-content"
        role="main"
        aria-label="Page content"
      >
        {activePage === 'home' && (
          <div className="p-6">
            <LiveMonitor
              isCameraActive={isCameraActive}
              onToggleCamera={handleToggleCamera}
              onStatusChange={setBackendStatus}
              onBackendChange={setIsUsingBackend}
              onFpsChange={setFps}
            />
          </div>
        )}

        {activePage === 'analytics' && (
          <div className="p-6">
            <AnalyticsDashboard />
          </div>
        )}

        {activePage === 'specs' && (
          <div className="p-6">
            <TechnicalSpecs />
          </div>
        )}

        {activePage === 'privacy' && (
          <div className="p-6">
            <PrivacySecurity />
          </div>
        )}

        {activePage === 'docs' && (
          <div className="p-6">
            <Documentation />
          </div>
        )}

        {activePage === 'settings' && (
          <div className="p-6">
            <SettingsPage />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
