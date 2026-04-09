import React, { useEffect, useMemo, useState } from 'react';
import type { NavVariant } from '../components/BottomNav';
import { useSentinel } from '../context/SentinelContext';

interface CourseViewerScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

interface TextSlide {
  type: 'text';
  title: string;
  content: string;
}

interface QuizSlide {
  type: 'quiz';
  title: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type CourseSlide = TextSlide | QuizSlide;

interface CourseContent {
  rewardXp: number;
  unlocksOnComplete?: number;
  slides: CourseSlide[];
}

const COURSE_LIBRARY: Record<number, CourseContent> = {
  1: {
    rewardXp: 50,
    unlocksOnComplete: 3,
    slides: [
      { type: 'text', title: 'Фишинг эволюциясы', content: 'Бұрын фишинг хаттары қате көп, жасанды мәтіндер болатын. Қазір шабуылдаушылар AI көмегімен стилистикасы жақсы, нақты адамға ұқсайтын хабарламалар жасайды.' },
      { type: 'text', title: 'Spear Phishing', content: 'Жаппай хат орнына шабуылдаушы сіз туралы ақпарат жинап, жеке бағытталған хабарлама дайындайды.' },
      { type: 'quiz', title: 'БІЛІМДІ ТЕКСЕРУ', question: 'Spear phishing-тің негізгі айырмасы неде?', options: ['Тек банктерге барады', 'Нақты нысанаға арналады', 'Әрқашан вирус болады'], correctAnswer: 1, explanation: 'Дұрыс. Бұл белгілі бір адам не ұйымға бағытталған шабуыл.' },
      { type: 'text', title: 'Омограф шабуылы', content: 'Шабуылдаушы доменді көзге ұқсас таңбалармен ауыстырып, пайдаланушыны шатастырады.' },
      { type: 'quiz', title: 'КӨЗ ЖІТІЛІГІ', question: 'Қайсысы күмәнді домен?', options: ['support@kaspi.kz', 'admin@kaspı.kz', 'info@kaspi-bank.kz'], correctAnswer: 1, explanation: 'Дұрыс. Мұнда i орнына басқа таңба қолданылған.' },
      { type: 'text', title: 'AI және Deepfake', content: 'Қазіргі фишинг тек мәтін емес, дауыс пен бейне арқылы да сенімге кіреді.' },
      { type: 'text', title: 'Zero Trust', content: 'Еш хабарламаға бірден сенбеңіз. Доменді тексеріп, басқа арнамен растаңыз.' },
      { type: 'quiz', title: 'ҚОРЫТЫНДЫ', question: 'Шұғыл аударым туралы аудио келсе не істейсіз?', options: ['Бірден аударамын', 'Тағы тыңдаймын', 'Екінші арнамен растаймын'], correctAnswer: 2, explanation: 'Дұрыс. Верификациясыз әрекет етуге болмайды.' }
    ]
  },
  2: {
    rewardXp: 40,
    unlocksOnComplete: 4,
    slides: [
      { type: 'text', title: 'Мықты пароль', content: 'Мықты пароль ұзын, бірегей және болжанбайтын болуы керек.' },
      { type: 'text', title: 'Пароль менеджері', content: 'Әр сервиске бөлек пароль сақтау үшін менеджер қолдану қауіпсіз.' },
      { type: 'quiz', title: 'ТЕКСЕРУ', question: 'Қай нұсқа қауіпсіз?', options: ['Бір парольді барлық жерде қолдану', 'Әр сервиске бөлек пароль және 2FA', 'Парольді чатқа жазып қою'], correctAnswer: 1, explanation: 'Дұрыс. Бірегей пароль және 2FA тәуекелді азайтады.' },
      { type: 'text', title: '2FA', content: 'Екінші фактор құпиясөз таралып кетсе де есептік жазбаны сақтап қалуы мүмкін.' },
      { type: 'quiz', title: 'ҚОРЫТЫНДЫ', question: 'Дерек ағып кетсе, не істеу керек?', options: ['Ештеңе істемеу', 'Парольді бірден ауыстыру', 'Сол парольмен қала беру'], correctAnswer: 1, explanation: 'Дұрыс. Парольді ауыстырып, басқа сервистерді де тексеру керек.' }
    ]
  },
  3: {
    rewardXp: 45,
    unlocksOnComplete: 5,
    slides: [
      { type: 'text', title: 'Манипуляция негізі', content: 'Әлеуметтік инженерия сенім, қорқыныш және шұғылдықты пайдаланады.' },
      { type: 'text', title: 'Pretexting', content: 'Шабуылдаушы өзін HR, IT немесе жеткізуші ретінде таныстырып ақпарат алуға тырысады.' },
      { type: 'quiz', title: 'ТЕКСЕРУ', question: 'Әлеуметтік инженерияның тірегі не?', options: ['Адам эмоциясы', 'Жылдам интернет', 'Қымбат сервер'], correctAnswer: 0, explanation: 'Дұрыс. Негізгі нысана адам мінез-құлқы.' },
      { type: 'text', title: 'Қарсы әрекет', content: 'Рәсімді бұзбау, қайта қоңырау шалу және ішкі арнамен тексеру маңызды.' }
    ]
  },
  4: {
    rewardXp: 55,
    slides: [
      { type: 'text', title: 'Дерек ағып кетсе', content: 'Алдымен қандай дерек таралғанын анықтау керек: email, пароль, құжат не қаржы ақпараты.' },
      { type: 'text', title: 'Incident response', content: 'Сессияларды жабу, пароль ауыстыру, 2FA қосу және жауапты командаларды хабардар ету керек.' },
      { type: 'quiz', title: 'ТЕКСЕРУ', question: 'Қай әрекет қате?', options: ['Тәуекелді бағалау', 'Пайдаланушыларды ескерту', 'Мәселені жасырып қою'], correctAnswer: 2, explanation: 'Дұрыс. Мәселені жасыру залалды ұлғайтады.' }
    ]
  },
  5: {
    rewardXp: 35,
    slides: [
      { type: 'text', title: 'Қоғамдық Wi-Fi', content: 'Кафе мен әуежай желілері әрқашан сенімді емес.' },
      { type: 'text', title: 'MITM', content: 'Шабуылдаушы сіз бен сервис арасындағы трафикті бақылауға тырысады.' },
      { type: 'quiz', title: 'ТЕКСЕРУ', question: 'Қоғамдық желіде дұрыс қадам қайсы?', options: ['VPN қосу', 'Банкке бірден кіру', 'Барлық файлды бөлісу'], correctAnswer: 0, explanation: 'Дұрыс. VPN және сақтық тәуекелді азайтады.' }
    ]
  }
};

export const CourseViewerScreen: React.FC<CourseViewerScreenProps> = (props) => {
  const { courses, selectedCourseId, updateCourseProgress, updateUserScore, unlockCourse } = useSentinel();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activeCourse = useMemo(() => courses.find((course) => course.id === selectedCourseId) ?? courses[0], [courses, selectedCourseId]);
  const courseContent = COURSE_LIBRARY[activeCourse.id] ?? COURSE_LIBRARY[1];
  const slide = courseContent.slides[currentSlide];
  const progress = ((currentSlide + 1) / courseContent.slides.length) * 100;

  useEffect(() => {
    setCurrentSlide(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setCompleted(false);
  }, [activeCourse.id]);

  useEffect(() => {
    updateCourseProgress(activeCourse.id, Math.round(progress));
  }, [activeCourse.id, progress, updateCourseProgress]);

  const handleNext = () => {
    if (currentSlide < courseContent.slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      return;
    }

    updateCourseProgress(activeCourse.id, 100);
    updateUserScore(courseContent.rewardXp);
    if (courseContent.unlocksOnComplete) {
      unlockCourse(courseContent.unlocksOnComplete);
    }
    setCompleted(true);
  };

  const handleOptionSelect = (idx: number) => {
    if (slide.type !== 'quiz' || showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-6 flex items-center justify-center">
        <div className="p-8 bg-[#1a1c1e] rounded-3xl border border-[#40e56c]/30 text-center max-w-md mx-6 animate-[security-pulse-anim_0.5s_ease-out]">
          <div className="w-24 h-24 rounded-full bg-[#40e56c]/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[48px] text-[#40e56c]">workspace_premium</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Курс Аяқталды!</h2>
          <p className="text-[#8d909d] mb-8">Сіз "{activeCourse.title}" курсын сәтті аяқтадыңыз. +{courseContent.rewardXp} XP</p>
          <button onClick={() => props.onNavigate('training')} className="w-full py-4 bg-[#40e56c] hover:bg-[#34d399] text-[#121416] font-bold rounded-xl transition-colors uppercase tracking-widest">
            АКАДЕМИЯҒА ОРАЛУ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-[#e2e2e5] font-['Manrope'] pb-6 fixed inset-0 z-[60] overflow-y-auto">
      <div className="fixed top-0 w-full p-6 flex items-center gap-4 bg-gradient-to-b from-[#050510] to-transparent z-10">
        <button onClick={() => props.onNavigate('training')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 backdrop-blur-md">
          <span className="material-symbols-outlined text-white">close</span>
        </button>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#a5c8ff] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="pt-24 px-6 max-w-md mx-auto w-full h-full flex flex-col justify-center">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8d909d] mb-2">{activeCourse.category}</div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-black text-[#a5c8ff] uppercase">{activeCourse.title}</h1>
        </div>

        {slide.type === 'text' && (
          <div className="animate-[fade-in_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-2xl bg-[#a5c8ff]/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(165,200,255,0.2)]">
              <span className="material-symbols-outlined text-[#a5c8ff] text-3xl">lightbulb</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-3xl font-black text-white mb-6 uppercase leading-tight">{slide.title}</h2>
            <p className="text-[#8d909d] text-lg leading-relaxed">{slide.content}</p>
          </div>
        )}

        {slide.type === 'quiz' && (
          <div className="animate-[fade-in_0.3s_ease-out]">
            <div className="text-[12px] font-bold text-[#f43f5e] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">quiz</span>
              {slide.title}
            </div>
            <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">{slide.question}</h2>

            <div className="space-y-4">
              {slide.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = slide.correctAnswer === idx;
                let bgColor = 'bg-[#1a1c1e] hover:bg-[#282a2c]';
                let borderColor = 'border-transparent';
                let textColor = 'text-[#e2e2e5]';

                if (showExplanation) {
                  if (isCorrect) {
                    bgColor = 'bg-[#40e56c]/10';
                    borderColor = 'border-[#40e56c]/50';
                    textColor = 'text-[#40e56c]';
                  } else if (isSelected) {
                    bgColor = 'bg-[#f43f5e]/10';
                    borderColor = 'border-[#f43f5e]/50';
                    textColor = 'text-[#f43f5e]';
                  } else {
                    textColor = 'text-white/30';
                  }
                } else if (isSelected) {
                  bgColor = 'bg-[#a5c8ff]/20';
                  borderColor = 'border-[#a5c8ff]';
                }

                return (
                  <button key={idx} disabled={showExplanation} onClick={() => handleOptionSelect(idx)} className={`w-full p-5 rounded-2xl border text-left font-bold transition-all ${bgColor} ${borderColor} ${textColor}`}>
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showExplanation && isCorrect && <span className="material-symbols-outlined">check_circle</span>}
                      {showExplanation && isSelected && !isCorrect && <span className="material-symbols-outlined">cancel</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 animate-[fade-in_0.3s_ease-out]">
                <span className="block text-xs font-bold uppercase text-[#a5c8ff] mb-2 tracking-widest">ТҮСІНДІРМЕ</span>
                <p className="text-sm text-[#8d909d] leading-relaxed">{slide.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 flex justify-end">
          <button disabled={slide.type === 'quiz' && !showExplanation} onClick={handleNext} className={`py-4 px-8 rounded-xl font-bold uppercase tracking-widest transition-all ${slide.type !== 'quiz' || showExplanation ? 'bg-[#a5c8ff] hover:bg-white text-[#121416]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
            ЖАЛҒАСТЫРУ
          </button>
        </div>
      </main>
    </div>
  );
};

export default CourseViewerScreen;
