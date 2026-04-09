import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';
import DeviceTaskManager from '../components/DeviceTaskManager';
import { useSentinel } from '../context/SentinelContext';

interface HomeScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const { onNavigate } = props;
  const { stats, threatLogs, userScore, courses } = useSentinel();
  const completedCourses = courses.filter((course) => course.progress === 100).length;
  const totalProgress = Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / (courses.length || 1));

  const handleModuleClick = (path: NavVariant) => {
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope']">
      <div className="md:hidden">
        <Header onOpenMenu={props.onOpenMenu} />
      </div>

      <main className="flex-grow pt-24 md:pt-10 pb-32 px-6 flex justify-center w-full">
        <div className="w-full max-w-6xl xl:max-w-[1400px]">
          <section className="mb-6 w-full">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0c1020] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#3b82f6]/10 to-transparent pointer-events-none" />
              <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#a855f7]/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
                  <span className="material-symbols-outlined text-[#3b82f6] text-3xl icon-filled">shield</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#8d909d] tracking-tight uppercase">
                    Басқару Орталығы
                  </h2>
                  <div className="flex items-center gap-3 mt-3 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 w-max">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-xs font-bold font-mono tracking-widest text-[#10b981] uppercase drop-shadow-[0_0_5px_#10b981]">ЖҮЙЕ БЕЛСЕНДІ</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0 relative z-10 flex items-center justify-end w-full md:w-auto">
                <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col gap-2 relative w-full md:w-auto">
                  <span className="text-[10px] text-[#8d909d] uppercase tracking-widest font-bold">ЖЕЛІЛІК КҮЙ</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm tracking-wider uppercase text-white">Secure_Connection</span>
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
            <div className="rounded-[24px] bg-[#0f1526] border border-[#a5c8ff]/10 p-5 shadow-[0_0_30px_rgba(165,200,255,0.08)]">
              <div className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest mb-2">Sentinel XP</div>
              <div className="font-['Space_Grotesk'] text-4xl font-black text-[#a5c8ff]">{userScore}</div>
              <p className="text-xs text-[#8d909d] mt-2">Оқу және симулятор нәтижелері бір жерде жиналады.</p>
            </div>
            <div className="rounded-[24px] bg-[#101812] border border-[#40e56c]/10 p-5 shadow-[0_0_30px_rgba(64,229,108,0.08)]">
              <div className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest mb-2">Оқу Прогресі</div>
              <div className="font-['Space_Grotesk'] text-4xl font-black text-[#40e56c]">{totalProgress}%</div>
              <p className="text-xs text-[#8d909d] mt-2">{completedCourses}/{courses.length} курс аяқталған.</p>
            </div>
            <button onClick={() => handleModuleClick('training')} className="text-left rounded-[24px] bg-[#1a1020] border border-[#f43f5e]/20 p-5 shadow-[0_0_30px_rgba(244,63,94,0.08)] hover:border-[#f43f5e]/40 transition-colors">
              <div className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest mb-2">Келесі Қадам</div>
              <div className="font-['Space_Grotesk'] text-2xl font-black text-white">Академияны жалғастыру</div>
              <p className="text-xs text-[#8d909d] mt-2">Курстарды аяқтап, қосымша XP жинаңыз.</p>
            </button>
          </section>

          <section className="mb-8 w-full h-[180px]">
            <DeviceTaskManager />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 w-full">
            <div className="flex flex-col p-6 rounded-[24px] bg-[#0c1228] border border-[#3b82f6]/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/20 blur-[60px] rounded-full group-hover:bg-[#3b82f6]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1e3a8a] text-white shadow-[0_0_15px_#3b82f6]">
                  <span className="material-symbols-outlined icon-filled">link</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#3b82f6]/30 rounded bg-[#3b82f6]/10 text-[#3b82f6] uppercase">URL_SCAN</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">URL Тексеру</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">Сілтемелерді AI арқылы талдап, қауіп пен фишинг белгілерін тексеріңіз.</p>
              <button onClick={() => handleModuleClick('analyzer')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#3b82f6] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col p-6 rounded-[24px] bg-[#1a0f28] border border-[#a855f7]/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/20 blur-[60px] rounded-full group-hover:bg-[#a855f7]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#581c87] text-white shadow-[0_0_15px_#a855f7]">
                  <span className="material-symbols-outlined icon-filled">mail</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#a855f7]/30 rounded bg-[#a855f7]/10 text-[#a855f7] uppercase">MAIL_SCAN</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">Email Талдау</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">Хат мәтінін, header құрылымын және фишинг үлгілерін автоматты тексеріңіз.</p>
              <button onClick={() => handleModuleClick('analyzer-email')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#a855f7] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col p-6 rounded-[24px] bg-[#0a1816] border border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[60px] rounded-full group-hover:bg-[#10b981]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#064e3b] text-white shadow-[0_0_15px_#10b981]">
                  <span className="material-symbols-outlined icon-filled">qr_code_2</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#10b981]/30 rounded bg-[#10b981]/10 text-[#10b981] uppercase">QR_DECODE</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">QR Код</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">QR кодты декодтап, ішіндегі сілтеме мен қауіпсіздік тәуекелін бағалаңыз.</p>
              <button onClick={() => handleModuleClick('qr')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#10b981] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col p-6 rounded-[24px] bg-[#0c1612] border border-[#10b981]/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/20 blur-[60px] rounded-full group-hover:bg-[#10b981]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#064e3b] text-white shadow-[0_0_15px_#10b981]">
                  <span className="material-symbols-outlined icon-filled">chat</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#10b981]/30 rounded bg-[#10b981]/10 text-[#10b981] uppercase">AI_AGENT</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">Кибер Кеңесші</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">AI арқылы қауіпсіздікке қатысты жедел түсіндірме мен әрекет жоспарын алыңыз.</p>
              <button onClick={() => handleModuleClick('chat')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#10b981] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col p-6 rounded-[24px] bg-[#1a0f28] border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] hover:shadow-[0_0_50px_rgba(217,70,239,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d946ef]/20 blur-[60px] rounded-full group-hover:bg-[#d946ef]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#d946ef] to-[#86198f] text-white shadow-[0_0_15px_#d946ef]">
                  <span className="material-symbols-outlined icon-filled">image</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#d946ef]/30 rounded bg-[#d946ef]/10 text-[#d946ef] uppercase">MEDIA_SCAN</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">Медиа Талдау</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">Сурет пен видеодан жасырын қауіп, метадерек және аномалия іздеңіз.</p>
              <button onClick={() => handleModuleClick('media')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#d946ef] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="flex flex-col p-6 rounded-[24px] bg-[#191012] border border-[#f43f5e]/30 shadow-[0_0_30px_rgba(244,63,94,0.15)] hover:shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f43f5e]/20 blur-[60px] rounded-full group-hover:bg-[#f43f5e]/30 transition-colors" />
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#f43f5e] to-[#9f1239] text-white shadow-[0_0_15px_#f43f5e]">
                  <span className="material-symbols-outlined icon-filled">sports_esports</span>
                </div>
                <span className="text-[10px] font-mono tracking-wider py-1 px-3 border border-[#f43f5e]/30 rounded bg-[#f43f5e]/10 text-[#f43f5e] uppercase">SIMULATOR</span>
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white uppercase tracking-wide mb-2">Фишинг Симулятор</h3>
              <p className="text-sm text-[#8d909d] font-medium leading-relaxed flex-grow">Жаттығу сценарийлері арқылы күмәнді хаттар мен хабарламаларды тануды күшейтіңіз.</p>
              <button onClick={() => handleModuleClick('simulator')} className="mt-8 flex items-center justify-between w-full border-t border-white/5 pt-4 text-[#8d909d] group-hover:text-[#f43f5e] transition-colors">
                <span className="text-xs font-mono uppercase tracking-widest font-bold">Init Module</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-[#0c0e10] border border-white/5 rounded-[20px] p-5 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#a855f7]/10 rounded-tl-full" />
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[10px] text-[#a855f7]">emergency</span>
                <span className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest">Барлық Жазба</span>
              </div>
              <span className="font-['Space_Grotesk'] text-4xl font-black text-white">{stats.total.toLocaleString('kk-KZ')}</span>
            </div>

            <div className="bg-[#0c0e10] border border-white/5 rounded-[20px] p-5 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#10b981]/10 rounded-tl-full" />
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[10px] text-[#10b981]">eco</span>
                <span className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest">Таза</span>
              </div>
              <span className="font-['Space_Grotesk'] text-4xl font-black text-[#10b981]">{stats.clean.toLocaleString('kk-KZ')}</span>
            </div>

            <div className="bg-[#0c0e10] border border-white/5 rounded-[20px] p-5 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#eab308]/10 rounded-tl-full" />
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[10px] text-[#eab308]">warning</span>
                <span className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest">Күдікті</span>
              </div>
              <span className="font-['Space_Grotesk'] text-4xl font-black text-[#eab308]">{stats.suspicious.toLocaleString('kk-KZ')}</span>
            </div>

            <div className="bg-[#0c0e10] border border-white/5 rounded-[20px] p-5 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#ef4444]/10 rounded-tl-full" />
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[10px] text-[#ef4444]">gpp_bad</span>
                <span className="text-[10px] font-bold text-[#8d909d] uppercase tracking-widest">Бұғатталған</span>
              </div>
              <span className="font-['Space_Grotesk'] text-4xl font-black text-[#ef4444]">{stats.blocked.toLocaleString('kk-KZ')}</span>
            </div>
          </section>

          <section className="mt-8 w-full bg-[#0c0e10] border border-white/5 rounded-[24px] p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#3b82f6]">history</span>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white uppercase">Жүйелік Логтар</h3>
              <span className="ml-auto text-xs font-mono text-[#8d909d] uppercase bg-white/5 px-3 py-1 rounded">Real-Time</span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {threatLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-[#121416] border border-white/5 rounded-xl hover:bg-[#1a1c1e] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${log.status === 'clean' ? 'bg-[#10b981] text-[#10b981]' : log.status === 'suspicious' ? 'bg-[#eab308] text-[#eab308]' : log.status === 'blocked' ? 'bg-[#ef4444] text-[#ef4444]' : 'bg-[#3b82f6] text-[#3b82f6]'}`} />
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${log.status === 'clean' ? 'bg-[#10b981]/10 text-[#10b981]' : log.status === 'suspicious' ? 'bg-[#eab308]/10 text-[#eab308]' : log.status === 'blocked' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'}`}>
                        {log.status}
                      </span>
                      <span className="text-white text-sm font-bold uppercase tracking-wider ml-2">{log.type}</span>
                      <p className="text-[#8d909d] text-xs mt-1.5">{log.message}</p>
                    </div>
                  </div>
                  <div className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded text-[#8d909d]">{log.timestamp}</div>
                </div>
              ))}
              {threatLogs.length === 0 && <div className="text-center p-6 text-[#8d909d] text-sm">Әзірге оқиғалар жоқ</div>}
            </div>
          </section>
        </div>
      </main>

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#a5c8ff]/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#40e56c]/3 blur-[120px] rounded-full" />
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
};

export default HomeScreen;
