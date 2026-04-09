import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import type { NavVariant } from '../components/BottomNav';
import { useSentinel } from '../context/SentinelContext';

interface PhishingSimulatorScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

const SCENARIOS = [
  { title: 'АУДАРЫМДЫ БҰҒАТТАУ', sender: 'Apple Security <noreply@aррle.com>', content: 'iPhone құрылғыңыздан күдікті транзакция жасалды. Егер бұл сіз болмасаңыз, төмендегі сілтемемен растаңыз.', link: 'https://apple-secure-auth.net/cancel?ref=541', isPhishing: true, explanation: 'Омограф шабуылы: доменде ұқсас, бірақ басқа таңбалар қолданылған.' },
  { title: 'CEO ШҰҒЫЛ ТАПСЫРМАСЫ', sender: 'Nurlan Tasbolat [CEO] <ceo.nurlan.biz@gmail.com>', content: 'Қазір жиналыстамын. Мердігерге тез ақша аударып, чекті жіберіңіз.', link: 'Тіркеме: invoice_8819.pdf.exe', isPhishing: true, explanation: 'Шұғылдық, бейресми адрес және қауіпті тіркеме BEC шабуылының белгісі.' },
  { title: 'AMAZON: ЖАҢА ҚҰРЫЛҒЫДАН КІРУ', sender: 'Amazon Web Services <no-reply-aws@amazon.com>', content: 'AWS аккаунтыңызға жаңа құрылғыдан кіру тіркелді. Қауіпсіздік журналын тексеріңіз.', link: 'https://aws.amazon.com/console/security-alert/block', isPhishing: false, explanation: 'Домен де, сілтеме де ресми. Хабар қысымға емес, тексеруге шақырады.' },
  { title: 'EGOV АЙЫППҰЛ ТӨЛЕУ', sender: 'EGOV.KZ INFO <system@egov.gov.kz>', content: 'Айыппұлды жеңілдікпен төлеу мерзімі бүгін аяқталады. Сілтемемен төлеңіз.', link: 'https://egov.kz/cms/ru/redirect?url=http://penalty-pay-kz.com', isPhishing: true, explanation: 'Ресми сайтқа ұқсап бастап, сыртқы жалған төлем бетіне апаратын open redirect қолданылған.' },
  { title: 'ТЕХНИКАЛЫҚ ЖАҢАРТУ', sender: 'IT Support Team <it-helpdesk@company-internal.net>', content: 'VPN жаңарту үшін архивті жүктеп, update_cert.vbs файлын іске қосыңыз.', link: 'Тіркеме: vpn_certs_2026.zip', isPhishing: true, explanation: 'IT командасы әдетте VBScript файлдарын қолмен іске қосуды сұрамайды.' },
  { title: 'LINKEDIN: ЖАҢА ЖОБАҒА ШАҚЫРУ', sender: 'LinkedIn Messages <messages-noreply@linkedin.com>', content: 'Сізге жаңа жоба бойынша хабарлама келді. Толығын LinkedIn ішінде ашуға болады.', link: 'https://linkedin.com/in/messaging/thread/18293021', isPhishing: false, explanation: 'Жіберуші де, сілтеме де ресми платформаға сәйкес келеді.' }
];

export const PhishingSimulatorScreen: React.FC<PhishingSimulatorScreenProps> = (props) => {
  const { addThreatLog, unlockCourse, updateUserScore, userScore } = useSentinel();
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wasCorrect, setWasCorrect] = useState(false);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * SCENARIOS.length));
  }, []);

  const currentScenario = useMemo(() => SCENARIOS[currentIndex], [currentIndex]);

  const handleAnswer = (userGuessedPhishing: boolean) => {
    const isCorrect = userGuessedPhishing === currentScenario.isPhishing;
    setWasCorrect(isCorrect);
    setShowResult(true);

    if (isCorrect) {
      setSessionScore((prev) => prev + 10);
      updateUserScore(10);
      addThreatLog({ type: 'simulator', status: 'clean', message: `Симулятор: "${currentScenario.title}" сценарийі сәтті өтті` });
      return;
    }

    updateUserScore(-5);
    unlockCourse(1);
    addThreatLog({ type: 'simulator', status: 'suspicious', message: `Симулятор қателігі: "${currentScenario.title}" қате бағаланды` });
  };

  const handleNext = () => {
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * SCENARIOS.length);
    }

    setCurrentIndex(nextIndex);
    setShowResult(false);
    setLevel((value) => value + 1);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-6">
      <div className="md:hidden">
        <Header title="СИМУЛЯТОР" showSentinel={false} onOpenMenu={props.onOpenMenu} />
      </div>

      <main className="pt-24 md:pt-10 px-6 flex justify-center w-full">
        <div className="w-full max-w-4xl flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => props.onNavigate('home')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-white">arrow_back</span>
            </button>
            <div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-black text-[#f43f5e] uppercase tracking-tight">Phishing Simulator</h2>
              <p className="text-[#8d909d] text-sm">Фишинг сценарийлерін ажыратуды үйренуге арналған шексіз жаттығу режимі.</p>
            </div>
          </div>

          {!started ? (
            <div className="w-full bg-[#0c1020] border border-[#f43f5e]/30 p-10 rounded-3xl text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#f43f5e]/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#f43f5e] text-4xl">phishing</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Қабілетіңізді тексеріңіз</h3>
              <p className="text-[#8d909d] max-w-md mx-auto mb-8">Әр раундта хабарламаны бағалап, оның қауіпсіз не фишинг екенін анықтайсыз. Дұрыс жауап XP қосады.</p>
              <button onClick={() => setStarted(true)} className="bg-[#f43f5e] hover:bg-[#e11d48] text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                СИМУЛЯЦИЯНЫ БАСТАУ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-3 rounded-md text-[#8d909d]">Level {level}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-3 rounded-md text-white">Session XP: <span className="text-[#10b981]">{sessionScore}</span></div>
                <div className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-3 rounded-md text-white">Total XP: <span className="text-[#a5c8ff]">{userScore}</span></div>
              </div>

              <div className="w-full bg-white rounded-xl overflow-hidden text-black shadow-lg">
                <div className="bg-[#f3f4f6] p-4 flex items-center gap-3 border-b border-[#e5e7eb]">
                  <div className="w-10 h-10 rounded-full bg-[#cbd5e1] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <div className="font-bold text-[14px] uppercase">{currentScenario.sender.split('<')[0]}</div>
                    <div className="text-xs text-[#64748b]">{currentScenario.sender}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold mb-4">{currentScenario.title}</h4>
                  <p className="text-[15px] mb-6 whitespace-pre-wrap">{currentScenario.content}</p>
                  <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer pointer-events-none">Сілтемеге өту</div>
                  <div className="mt-2 text-xs text-blue-500 font-mono underline break-all">{currentScenario.link}</div>
                </div>
              </div>

              {!showResult ? (
                <div className="flex gap-4 w-full">
                  <button onClick={() => handleAnswer(false)} className="flex-1 py-4 bg-[#10b981]/10 border border-[#10b981]/50 text-white rounded-xl hover:bg-[#10b981]/30 transition-colors font-bold uppercase tracking-widest text-xs">ТАЗА</button>
                  <button onClick={() => handleAnswer(true)} className="flex-1 py-4 bg-[#ef4444]/10 border border-[#ef4444]/50 text-white rounded-xl hover:bg-[#ef4444]/30 transition-colors font-bold uppercase tracking-widest text-xs">ФИШИНГ</button>
                </div>
              ) : (
                <div className={`${wasCorrect ? 'bg-[#10b981]/10 border-[#10b981]/30' : 'bg-[#ef4444]/10 border-[#ef4444]/30'} border rounded-xl p-6 relative overflow-hidden`}>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <span className={`material-symbols-outlined text-3xl ${wasCorrect ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{wasCorrect ? 'task_alt' : 'error'}</span>
                    <h4 className={`font-bold text-xl uppercase ${wasCorrect ? 'text-white' : 'text-[#ef4444]'}`}>{wasCorrect ? 'ДҰРЫС' : 'ҚАТЕ'}</h4>
                  </div>
                  <p className="text-[#8d909d] text-sm relative z-10 mb-6">{currentScenario.explanation}</p>
                  <button onClick={handleNext} className={`w-full py-3 text-white rounded-xl font-bold uppercase tracking-widest text-xs relative z-10 ${wasCorrect ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#ef4444] hover:bg-[#dc2626]'}`}>КЕЛЕСІ СЦЕНАРИЙ</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PhishingSimulatorScreen;
