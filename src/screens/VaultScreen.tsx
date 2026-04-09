import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';

interface VaultScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

interface VaultItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  isFullWidth?: boolean;
}

const defaultItems: VaultItem[] = [
  { id: '1', title: 'Паспорт (скан)', subtitle: '2.4 MB • PDF', icon: 'identity_platform', iconBg: 'bg-[#004c8f]', iconColor: 'text-[#a5c8ff]' },
  { id: '2', title: 'Құпия сөздер (14)', subtitle: 'Соңғы өзгеріс: кеше', icon: 'password', iconBg: 'bg-[#333537]', iconColor: 'text-[#a5c8ff]' },
  { id: '3', title: 'Жеке фотолар', subtitle: '128 нысан • 1.2 GB', icon: 'lock', iconBg: 'bg-black/40', iconColor: 'text-white', isFullWidth: true }
];

export const VaultScreen: React.FC<VaultScreenProps> = ({ onNavigate, onOpenMenu }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_vault');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems(defaultItems);
      }
    } else {
      setItems(defaultItems);
    }
    setIsLoaded(true);
  }, []);

  const saveItems = (newItems: VaultItem[]) => {
    setItems(newItems);
    localStorage.setItem('sentinel_vault', JSON.stringify(newItems));
  };

  const handleAddFile = () => {
    const fileName = window.prompt('Құпия файлдың немесе жазбаның атауын енгізіңіз:');
    if (!fileName || fileName.trim() === '') return;

    const icons = ['folder_open', 'description', 'key', 'medical_information'];
    const colors = [
      { bg: 'bg-[#ffb692]/20', fg: 'text-[#ffb692]' },
      { bg: 'bg-[#40e56c]/20', fg: 'text-[#40e56c]' },
      { bg: 'bg-[#a5c8ff]/20', fg: 'text-[#a5c8ff]' },
      { bg: 'bg-[#c3c6d4]/20', fg: 'text-[#c3c6d4]' }
    ];
    const rIcon = icons[Math.floor(Math.random() * icons.length)];
    const rColor = colors[Math.floor(Math.random() * colors.length)];
    const rSize = `${(Math.random() * 5 + 0.1).toFixed(1)} MB`;

    const newItem: VaultItem = {
      id: Date.now().toString(),
      title: fileName,
      subtitle: `${rSize} • ЖАҢА`,
      icon: rIcon,
      iconBg: rColor.bg,
      iconColor: rColor.fg,
      isFullWidth: false
    };

    saveItems([...items, newItem]);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-32">
      <div className="md:hidden">
        <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#050510]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={onOpenMenu} className="mr-2 text-[#a5c8ff] hover:text-white transition-colors active:scale-90">
              <span className="material-symbols-outlined text-2xl">menu_open</span>
            </button>
            <span className="material-symbols-outlined text-[#a5c8ff]">shield_with_heart</span>
            <h1 className="font-['Space_Grotesk'] font-bold text-xl tracking-tight text-[#a5c8ff]">Қауіпсіздік</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#333537] flex items-center justify-center overflow-hidden border border-[#434652]/30">
            <span className="material-symbols-outlined text-[#a5c8ff] text-sm">person</span>
          </div>
        </header>
      </div>

      <div className="fixed top-20 right-6 z-40 aegis-badge border border-[#434652]/20 px-4 py-2 rounded-full flex items-center gap-2 pointer-events-none bg-[#121416]/80 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#40e56c] animate-pulse" />
        <span className="text-[10px] font-bold tracking-widest text-[#e2e2e5] uppercase">Aegis Active</span>
      </div>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <section className="flex flex-col items-center mb-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#40e56c]/10 rounded-full blur-3xl" />
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-[#1e2022] vault-pulse">
              <span className="material-symbols-outlined icon-filled text-6xl text-[#40e56c]">fingerprint</span>
            </div>
          </div>
          <h2 className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight mb-2">Құпия қойма қорғалған</h2>
          <p className="text-[#c3c6d4] font-medium tracking-wide flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#40e56c]" />
            БИОМЕТРИЯЛЫҚ ТЕКСЕРУ БЕЛСЕНДІ
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className={`${item.isFullWidth ? 'md:col-span-2' : 'col-span-1'} p-6 rounded-[12px] bg-[#282a2c] hover:bg-[#37393b] transition-all group cursor-pointer relative overflow-hidden flex ${item.isFullWidth ? 'items-center gap-6' : 'flex-col'}`}>
              {item.isFullWidth ? (
                <>
                  <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">lock</span>
                    </div>
                    <div className="w-full h-full bg-gradient-to-br from-[#004c8f] to-[#121416] blur-sm scale-110" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-['Space_Grotesk'] text-lg font-bold truncate max-w-[200px]">{item.title}</h3>
                    <p className="text-sm text-[#c3c6d4] mt-1 truncate">{item.subtitle}</p>
                  </div>
                  <div className="pr-4">
                    <span className="material-symbols-outlined text-[#c3c6d4]">chevron_right</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.iconBg} ${item.iconColor}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#c3c6d4] group-hover:text-[#a5c8ff] transition-colors">more_vert</span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold truncate w-full">{item.title}</h3>
                  <p className="text-sm text-[#c3c6d4] mt-1 truncate w-full">{item.subtitle}</p>
                  <div className="absolute bottom-0 right-0 p-2 opacity-5 lg:opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">{item.icon}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button onClick={handleAddFile} className="w-full py-5 rounded-[12px] border border-dashed border-[#434652] hover:border-[#a5c8ff] hover:bg-[#a5c8ff]/5 transition-all flex items-center justify-center gap-3 text-[#c3c6d4] hover:text-[#a5c8ff]">
            <span className="material-symbols-outlined">add_circle</span>
            <span className="font-['Space_Grotesk'] font-medium">Жаңа файл қосу</span>
          </button>
        </div>
      </main>

      <BottomNav active="vault" onNavigate={onNavigate} />
    </div>
  );
};

export default VaultScreen;
