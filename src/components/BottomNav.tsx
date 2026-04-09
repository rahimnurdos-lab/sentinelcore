import React from 'react';

export type NavVariant = 'home' | 'scan' | 'vault' | 'behavior' | 'analyzer' | 'analyzer-email' | 'qr' | 'media' | 'chat' | 'simulator' | 'history' | 'training' | 'course-viewer' | 'game-firewall' | 'game-password';

interface NavItem {
  readonly id: NavVariant;
  readonly icon: string;
  readonly label: string;
}

interface BottomNavProps {
  readonly active: NavVariant;
  readonly onNavigate: (screen: NavVariant) => void;
}

const homeNavItems: NavItem[] = [
  { id: 'home', icon: 'security', label: 'Басты' },
  { id: 'behavior', icon: 'analytics', label: 'Талдау' },
  { id: 'vault', icon: 'fingerprint', label: 'Қойма' },
  { id: 'scan', icon: 'settings', label: 'Сканер' }
];

const otherNavItems: NavItem[] = [
  { id: 'home', icon: 'dashboard', label: 'Басты бет' },
  { id: 'scan', icon: 'timeline', label: 'Сканер' },
  { id: 'behavior', icon: 'psychology', label: 'Диагностика' },
  { id: 'vault', icon: 'lock', label: 'Қойма' }
];

export const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const items = active === 'home' ? homeNavItems : otherNavItems;

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#121416]/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] rounded-t-[12px]">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl active:scale-90 duration-500 transition-all ${
              isActive
                ? 'bg-gradient-to-t from-[#004c8f]/80 to-[#a5c8ff]/20 text-[#a5c8ff] shadow-[0_10px_20px_rgba(165,200,255,0.15)] border border-[#a5c8ff]/30'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className={`material-symbols-outlined mb-1 ${isActive ? 'icon-filled' : ''}`}>{item.icon}</span>
            <span className="font-['Manrope'] text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
