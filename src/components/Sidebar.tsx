import React from 'react';
import type { NavVariant } from './BottomNav';

interface SidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (screen: NavVariant) => void;
  readonly activeScreen: NavVariant;
}

const menuItems = [
  { id: 'home', icon: 'diamond', label: 'Басқару орталығы', subtitle: 'DASHBOARD' },
  { id: 'analyzer', icon: 'link', label: 'URL тексеру', subtitle: 'URL SCAN' },
  { id: 'analyzer-email', icon: 'mail', label: 'Email талдау', subtitle: 'EMAIL INTEL' },
  { id: 'scan', icon: 'smartphone', label: 'Телефон тексеру', subtitle: 'PHONE SCAN' },
  { id: 'qr', icon: 'qr_code_scanner', label: 'QR код', subtitle: 'QR DECODE' },
  { id: 'media', icon: 'mic', label: 'Медиа талдау', subtitle: 'MEDIA INTEL' },
  { id: 'chat', icon: 'chat', label: 'Кибер кеңесші', subtitle: 'AI CHAT' },
  { id: 'training', icon: 'school', label: 'Кибер курстар', subtitle: 'TRAINING' },
  { id: 'simulator', icon: 'sports_esports', label: 'Фишинг симулятор', subtitle: 'SIMULATOR' },
  { id: 'history', icon: 'history', label: 'Тарих', subtitle: 'HISTORY' }
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, activeScreen }) => {
  const [timeStr, setTimeStr] = React.useState('');
  const [dateStr, setDateStr] = React.useState('');
  const telegramBotUrl = import.meta.env.VITE_TELEGRAM_BOT_URL?.trim() || '';

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('kk-KZ', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('kk-KZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const openTelegram = () => {
    if (!telegramBotUrl) return;
    window.open(telegramBotUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-[#0c0e10]/80 backdrop-blur-sm z-[60] transition-opacity md:hidden" onClick={onClose} />}

      <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#0c0e10]/95 backdrop-blur-xl border-r border-[#3b82f6]/10 z-[70] shadow-[10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto custom-scrollbar flex flex-col`}>
        <div className="p-6 flex-grow">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <span className="font-['Space_Grotesk'] font-black text-white text-lg">SC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-black tracking-[0.1em] text-white text-sm leading-tight">SENTINEL CORE</span>
              <span className="font-mono text-[8px] text-[#8d909d] tracking-widest uppercase">AI Defence System</span>
            </div>
            <button onClick={onClose} className="ml-auto text-[#8d909d] hover:text-white transition-colors md:hidden">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as NavVariant);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive ? 'bg-gradient-to-r from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20 shadow-[inset_4px_0_0_#3b82f6]' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10 w-full">
                    <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-[#3b82f6] icon-filled drop-shadow-[0_0_8px_#3b82f6]' : 'text-[#8d909d] group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className={`font-['Manrope'] font-bold text-[13px] truncate w-full text-left transition-colors ${isActive ? 'text-white' : 'text-[#8d909d]'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                  <span className={`absolute right-3 font-['Space_Grotesk'] text-[8px] font-bold tracking-[0.1em] transition-opacity duration-300 ${isActive ? 'opacity-100 text-[#3b82f6]/70' : 'opacity-0'}`}>
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 relative mt-auto border-t border-white/5">
          <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none" />

          <button
            onClick={openTelegram}
            disabled={!telegramBotUrl}
            className={`relative w-full mb-6 p-4 rounded-xl border transition-colors flex items-center justify-between group overflow-hidden ${
              telegramBotUrl
                ? 'bg-[#0c162c] border-[#3b82f6]/30 hover:bg-[#112040]'
                : 'bg-[#101524] border-white/10 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" />
            <div className="flex items-center gap-3 relative z-10">
              <span className="material-symbols-outlined text-[#3b82f6]">send</span>
              <span className="font-['Space_Grotesk'] font-bold text-white text-sm">Telegram Bot</span>
            </div>
            <span className="text-[10px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-2 py-1 rounded">{telegramBotUrl ? 'JOIN' : 'SET URL'}</span>
          </button>

          <div className="text-center mb-6">
            <div className="font-['Space_Grotesk'] font-black text-2xl text-[#e2e2e5] tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{timeStr || '00:00:00'}</div>
            <div className="text-[10px] text-[#8d909d] font-medium lowercase">{dateStr || '...'}</div>
          </div>

          <div className="w-full relative">
            <div className="absolute inset-0 bg-[#10b981]/20 blur-xl rounded-full" />
            <div className="relative border border-[#10b981]/30 bg-[#05110d] rounded-xl p-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-bold text-[#10b981] uppercase tracking-widest">ЖҮЙЕ БЕЛСЕНДІ</span>
              </div>
              <div className="text-[8px] font-mono text-[#10b981]/60 uppercase tracking-widest">Neural Engine v2.0 - Pytorch</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
