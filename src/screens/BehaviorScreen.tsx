import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';

interface BehaviorScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const BehaviorScreen: React.FC<BehaviorScreenProps> = ({ onNavigate, onOpenMenu }) => {
  const [toggles, setToggles] = useState({ grasp: true, typing: true, route: false });
  const [currentTime, setCurrentTime] = useState('');
  const [currentAmPm, setCurrentAmPm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_behavior_toggles');
    if (saved) {
      try {
        setToggles(JSON.parse(saved));
      } catch {
        // ignore invalid local state
      }
    }

    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;
      setCurrentTime(`${hours}:${minutes}`);
      setCurrentAmPm(ampm);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('sentinel_behavior_toggles', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope']">
      <div className="md:hidden">
        <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#050510]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={onOpenMenu} className="mr-2 text-[#a5c8ff] hover:text-white transition-colors active:scale-90">
              <span className="material-symbols-outlined text-2xl">menu_open</span>
            </button>
            <span className="material-symbols-outlined text-[#a5c8ff]">shield_with_heart</span>
            <span className="font-['Space_Grotesk'] font-black tracking-[0.2em] text-[#a5c8ff] text-xl">SENTINEL</span>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#a5c8ff]/20 bg-[#333537] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#a5c8ff] text-sm">person</span>
          </div>
        </nav>
      </div>

      <main className="pt-20 pb-32 px-6 max-w-md mx-auto">
        <header className="mb-10 mt-4">
          <div className="flex items-end justify-between mb-2">
            <h1 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-[#e2e2e5]">Талдау</h1>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#02c953]/20 text-[#40e56c] text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#40e56c] animate-pulse" />
              ТІКЕЛЕЙ
            </div>
          </div>
          <p className="text-[#c3c6d4] font-medium leading-relaxed">Үздіксіз мінез-құлық пен биометриялық мониторинг белсенді.</p>
        </header>

        <section className="mb-8 p-6 rounded-[12px] bg-[#282a2c] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl">fingerprint</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#02c953] flex items-center justify-center relative">
                <span className="material-symbols-outlined icon-filled text-[#004d1b]">verified_user</span>
                <span className="absolute inset-[-10px] border-2 border-[#40e56c] rounded-full opacity-10 animate-ping duration-1000" />
                <span className="absolute inset-[-20px] border border-[#40e56c] rounded-full opacity-5" />
              </div>
              <div>
                <div className="text-[#40e56c] font-['Space_Grotesk'] text-2xl font-bold">98% Сәйкестік</div>
                <div className="text-[#c3c6d4] text-sm font-medium">Күйі: Қалыпты</div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#333537] rounded-full overflow-hidden relative">
              <div className="h-full bg-[#40e56c] w-[98%] rounded-full shadow-[0_0_8px_rgba(64,229,108,0.5)]" />
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold mb-4 ml-1 text-[#a5c8ff]">Мінез-құлық үлгілері</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 aspect-video rounded-[12px] bg-[#1e2022] overflow-hidden relative border border-[#434652]/10 group">
              <div className="w-full h-full bg-gradient-to-br from-[#1a1c1e] via-[#1e2022] to-[#0c0e10] flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1 opacity-30 w-full px-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div key={i} className="h-1 bg-[#a5c8ff] rounded-full transition-opacity duration-1000" style={{ opacity: Math.random() * 0.5 + 0.1 }} />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e2022] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-xs text-[#a5c8ff]">location_on</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3c6d4]">НЕГІЗГІ ОРЫНДАР</span>
                </div>
                <div className="text-sm font-bold">Үй, технохаб, орталық</div>
              </div>
              <div className="absolute top-4 right-4 bg-[#333537]/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#a5c8ff]/10">
                <span className="material-symbols-outlined text-[14px] text-[#40e56c]">near_me</span>
                <span className="text-[11px] font-bold">Аймақта</span>
              </div>
            </div>

            <div className="rounded-[12px] bg-[#282a2c] p-4 flex flex-col justify-between border border-[#434652]/10 h-40">
              <span className="material-symbols-outlined text-[#a5c8ff] mb-2">schedule</span>
              <div>
                <div className="text-[10px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1">БЕЛСЕНДІ УАҚЫТ</div>
                <div className="text-xl font-['Space_Grotesk'] font-bold">
                  {currentTime} <span className="text-xs text-[#c3c6d4] font-medium">{currentAmPm}</span>
                </div>
                <div className="flex gap-1 mt-2 items-end h-8">
                  <div className="h-4 w-1 bg-[#a5c8ff]/20 rounded-full animate-pulse opacity-50" />
                  <div className="h-6 w-1 bg-[#a5c8ff]/40 rounded-full animate-pulse opacity-70" style={{ animationDelay: '100ms' }} />
                  <div className="h-8 w-1 bg-[#a5c8ff] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="h-5 w-1 bg-[#a5c8ff]/40 rounded-full animate-pulse opacity-70" style={{ animationDelay: '300ms' }} />
                  <div className="h-3 w-1 bg-[#a5c8ff]/20 rounded-full animate-pulse opacity-50" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>

            <div className="rounded-[12px] bg-[#282a2c] p-4 flex flex-col justify-between border border-[#434652]/10 h-40">
              <span className="material-symbols-outlined text-[#ffb692] mb-2">speed</span>
              <div>
                <div className="text-[10px] font-bold text-[#c3c6d4] uppercase tracking-wider mb-1">ТЕРУ ЫРҒАҒЫ</div>
                <div className="text-xl font-['Space_Grotesk'] font-bold">Тұрақты</div>
                <div className="text-[10px] text-[#c3c6d4] mt-1 italic leading-tight">Пернелерді басу динамикасы расталды</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Space_Grotesk'] text-lg font-bold ml-1 text-[#a5c8ff]">Биометриялық параметрлер</h2>
            <span className="text-[10px] bg-[#333537] text-[#c3c6d4] px-2 py-0.5 rounded uppercase font-bold tracking-tighter">ЖИ-МЕН БАСҚАРЫЛАДЫ</span>
          </div>
          <div className="space-y-3">
            {[
              { key: 'grasp' as const, icon: 'back_hand', title: 'Ұстау стилі', desc: 'Қол өлшемі және қысым сезімталдығы' },
              { key: 'typing' as const, icon: 'keyboard', title: 'Теру қарқыны', desc: 'Пернелер арасындағы аралықты талдау' },
              { key: 'route' as const, icon: 'route', title: 'Маршрут жылдамдығы', desc: 'Жиі жүретін жолдар мен қозғалыс жылдамдығы' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1c1e] rounded-xl hover:bg-[#282a2c] transition-colors border border-[#434652]/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#333537] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#a5c8ff] text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{item.title}</div>
                    <div className="text-[11px] text-[#c3c6d4]">{item.desc}</div>
                  </div>
                </div>
                <button onClick={() => toggle(item.key)} className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${toggles[item.key] ? 'bg-[#a5c8ff]' : 'bg-[#333537]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-[#121416] rounded-full transition-transform duration-200 ${toggles[item.key] ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="p-4 rounded-[12px] bg-[#ffb692]/10 border border-[#ffb692]/20">
          <p className="text-xs text-[#c3c6d4] leading-relaxed">
            Биометриялық деректер орналасу тарихы мен пайдаланушы профилін талдау үшін қолданылады. Жіктеу дәлдігі
            <span className="text-[#ffb692] font-bold"> 12% → </span>
            деңгейіндегі аутентификациямен күшейтіледі.
          </p>
        </div>
      </main>

      <BottomNav active="behavior" onNavigate={onNavigate} />
    </div>
  );
};

export default BehaviorScreen;
