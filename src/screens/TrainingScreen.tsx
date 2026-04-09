import React from 'react';
import Header from '../components/Header';
import type { NavVariant } from '../components/BottomNav';
import { useSentinel } from '../context/SentinelContext';

interface TrainingScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const TrainingScreen: React.FC<TrainingScreenProps> = (props) => {
  const { courses, userScore, selectCourse } = useSentinel();
  const totalProgress = Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / (courses.length || 1));
  const completedCourses = courses.filter((course) => course.progress === 100).length;

  const handleOpenCourse = (courseId: number, isLocked: boolean) => {
    if (isLocked) return;
    selectCourse(courseId);
    props.onNavigate('course-viewer');
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-32">
      <div className="md:hidden">
        <Header title="КИБЕР КУРСТАР" showSentinel={false} onOpenMenu={props.onOpenMenu} />
      </div>

      <main className="pt-24 md:pt-10 px-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => props.onNavigate('home')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-black text-[#a5c8ff] uppercase tracking-tight">Академия</h2>
            <p className="text-[#8d909d] text-sm mt-1">Оқу арқылы цифрлық иммунитетіңізді күшейтіңіз</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr] gap-4 mb-8">
          <div className="w-full bg-[#121416]/50 border border-white/5 p-6 rounded-3xl flex items-center justify-between backdrop-blur-xl">
            <div>
              <h3 className="text-white font-bold opacity-80 uppercase tracking-widest text-[11px] mb-1">ЖАЛПЫ ПРОГРЕСС</h3>
              <div className="text-3xl font-black text-[#40e56c] font-['Space_Grotesk']">{totalProgress}%</div>
              <p className="text-[#8d909d] text-xs mt-2">{completedCourses}/{courses.length} курс аяқталды</p>
            </div>
            <div className="w-20 h-20 rounded-full border-[6px] border-[#1a1c1e] relative flex items-center justify-center">
              <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="34" fill="none" stroke="#40e56c" strokeWidth="6" strokeDasharray="213" strokeDashoffset={213 - (213 * totalProgress) / 100} strokeLinecap="round" />
              </svg>
              <span className="material-symbols-outlined text-white/50 text-2xl">school</span>
            </div>
          </div>

          <div className="rounded-3xl border border-[#a5c8ff]/10 bg-[#0f1526] p-6 shadow-[0_0_30px_rgba(165,200,255,0.08)]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8d909d] mb-2">SENTINEL XP</div>
            <div className="text-3xl font-black text-[#a5c8ff] font-['Space_Grotesk'] mb-2">{userScore}</div>
            <p className="text-xs text-[#8d909d]">Курстар мен симулятордан жиналған тәжірибе ұпайы.</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f43f5e] text-xl">sports_esports</span>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold">Кибер Ойындар</h3>
          </div>
          <span className="text-[10px] bg-[#f43f5e]/20 text-[#f43f5e] px-2 py-1 rounded-md font-bold uppercase tracking-widest">ЖАҢА</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div onClick={() => props.onNavigate('game-firewall')} className="relative overflow-hidden rounded-2xl border border-[#3b82f6]/30 bg-[#0c162c] cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 to-transparent" />
            <div className="p-6 relative z-10 flex gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">policy</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1 uppercase tracking-tight">Firewall Defender</h4>
                <p className="text-[11px] text-[#8d909d] leading-relaxed line-clamp-2">Зиянды пакеттерді тоқтатып, қауіпсіз трафикті өткізіңіз. Бұл желі қорғанысын түсіндіретін шағын ойын.</p>
                <div className="mt-3 text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest">Ойнау →</div>
              </div>
            </div>
          </div>
          <div onClick={() => props.onNavigate('game-password')} className="relative overflow-hidden rounded-2xl border border-[#f43f5e]/30 bg-[#160c14] cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.1)] hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f43f5e]/10 to-transparent" />
            <div className="p-6 relative z-10 flex gap-4">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#f43f5e] to-[#be123c] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">lock_open</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1 uppercase tracking-tight">Пароль Бұзушы</h4>
                <p className="text-[11px] text-[#8d909d] leading-relaxed line-clamp-2">Әлсіз парольдің қанша жылдам бұзылатынын көріп, мықты комбинация құруды жаттықтырыңыз.</p>
                <div className="mt-3 text-[10px] font-bold text-[#f43f5e] uppercase tracking-widest">Ойнау →</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#a5c8ff] text-xl">menu_book</span>
          <h3 className="font-['Space_Grotesk'] text-lg font-bold">Тақырыптар тізімі</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} onClick={() => handleOpenCourse(course.id, course.isLocked)} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${course.isLocked ? 'bg-[#121416]/40 border-white/5 opacity-60 grayscale' : 'bg-[#1a1c1e] border-[#a5c8ff]/10 hover:border-[#a5c8ff]/30 cursor-pointer shadow-lg hover:-translate-y-1'}`}>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {course.progress === 100 && <span className="material-symbols-outlined text-[#40e56c] bg-[#40e56c]/20 rounded-full p-1 text-[16px]">done</span>}
                {course.progress > 0 && course.progress < 100 && <span className="text-[10px] font-bold text-[#a5c8ff] tracking-widest">{course.progress}%</span>}
                {course.isLocked && <span className="material-symbols-outlined text-white/30 text-[20px]">lock</span>}
              </div>

              <div className="p-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                  <span className={`material-symbols-outlined text-2xl ${course.isLocked ? 'text-white/30' : course.progress === 100 ? 'text-[#40e56c]' : 'text-[#a5c8ff]'}`}>{course.icon}</span>
                </div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{course.category} • {course.duration}</div>
                <h4 className="text-white font-bold text-lg mb-2">{course.title}</h4>
                <p className="text-sm text-[#8d909d] leading-relaxed mb-6">{course.description}</p>
                {!course.isLocked && (
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-[#40e56c]' : 'bg-[#a5c8ff]'}`} style={{ width: `${course.progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TrainingScreen;
