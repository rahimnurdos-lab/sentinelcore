import React, { useState } from 'react';
import { SentinelProvider } from './context/SentinelContext';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import VaultScreen from './screens/VaultScreen';
import BehaviorScreen from './screens/BehaviorScreen';
import AnalyzerScreen from './screens/AnalyzerScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import MediaAnalyzerScreen from './screens/MediaAnalyzerScreen';
import CyberAdvisorScreen from './screens/CyberAdvisorScreen';
import PhishingSimulatorScreen from './screens/PhishingSimulatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import TrainingScreen from './screens/TrainingScreen';
import CourseViewerScreen from './screens/CourseViewerScreen';
import FirewallGame from './screens/games/FirewallGame';
import PasswordCrackerGame from './screens/games/PasswordCrackerGame';
import Sidebar from './components/Sidebar';
import EmailAnalyzerScreen from './screens/EmailAnalyzerScreen';
import type { NavVariant } from './components/BottomNav';

const App: React.FC = () => {
  const [screen, setScreen] = useState<NavVariant>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const screens: Record<NavVariant, React.ReactNode> = {
    home: <HomeScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    scan: <ScanScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    vault: <VaultScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    behavior: <BehaviorScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    analyzer: <AnalyzerScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    'analyzer-email': <EmailAnalyzerScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    qr: <QRScannerScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    media: <MediaAnalyzerScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    chat: <CyberAdvisorScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    simulator: <PhishingSimulatorScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    history: <HistoryScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    training: <TrainingScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    'course-viewer': <CourseViewerScreen onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    'game-firewall': <FirewallGame onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />,
    'game-password': <PasswordCrackerGame onNavigate={setScreen} onOpenMenu={() => setSidebarOpen(true)} />
  };

  return (
    <SentinelProvider>
      <div className="dark relative overflow-x-hidden min-h-screen bg-[#050510] md:pl-[280px]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={setScreen}
          activeScreen={screen}
        />
        {(Object.keys(screens) as NavVariant[]).map((key) => (
          <div key={key} style={{ display: key === screen ? 'block' : 'none' }}>
            {screens[key]}
          </div>
        ))}
      </div>
    </SentinelProvider>
  );
};

export default App;
