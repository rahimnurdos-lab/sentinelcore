import React, { useState, useEffect } from 'react';
import { useIntelligence } from '../hooks/useIntelligence';
import { useHistory } from '../hooks/useHistory';
import { useSentinel } from '../context/SentinelContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';

interface AnalyzerScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const AnalyzerScreen: React.FC<AnalyzerScreenProps> = ({ onNavigate, onOpenMenu }) => {
  const { analyzing, result, analyze, reset, ready, loadingProgress, error, isScraping } = useIntelligence();
  const { addEntry } = useHistory();
  const { addThreatLog } = useSentinel();
  const [input, setInput] = useState('');
  const [lastInput, setLastInput] = useState('');

  useEffect(() => {
    if (result && lastInput) {
      addEntry({
        type: 'URL Scan',
        target: lastInput.slice(0, 100),
        status: result.status === 'safe' ? 'Clean' : result.status === 'caution' ? 'Suspicious' : 'Blocked',
        threat: result.status === 'safe' ? 'Low' : result.status === 'caution' ? 'Medium' : 'High'
      });
      addThreatLog({
        type: 'url',
        status: result.status === 'safe' ? 'clean' : result.status === 'caution' ? 'suspicious' : 'blocked',
        message: `URL: ${lastInput.slice(0, 40)}${lastInput.length > 40 ? '...' : ''}`
      });
    }
  }, [result, lastInput, addEntry, addThreatLog]);

  const submit = () => {
    if (input.trim()) {
      setLastInput(input.trim());
      analyze(input.trim());
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-32">
      <div className="md:hidden">
        <Header title="EMAIL / URL ТАЛДАУ" showSentinel={false} onOpenMenu={onOpenMenu} />
      </div>

      <main className="pt-24 px-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#a5c8ff]/5 border border-[#a5c8ff]/10 mb-8 backdrop-blur-md">
          <span className="material-symbols-outlined text-[#a5c8ff] text-3xl opacity-80">psychology</span>
          <div>
            <h2 className="font-['Space_Grotesk'] font-bold text-[#e2e2e5]">Жасанды интеллект модулі</h2>
            <p className="text-[10px] text-[#8d909d] leading-relaxed mt-1">
              Сілтемелер мен хабарламалардың қауіпсіздігін, соның ішінде фишинг, күмәнді домен және заңсыз әрекет белгілерін автоматты зерттейді.
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={analyzing}
            placeholder="Сілтеме (URL) немесе хабарлама мәтінін осында кірістіріңіз..."
            className="w-full h-40 bg-[#1a1c1e] text-[#e2e2e5] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#a5c8ff]/50 transition-colors resize-none disabled:opacity-50 custom-scrollbar"
          />
          {input && !analyzing && (
            <button onClick={() => setInput('')} className="absolute top-4 right-4 text-[#8d909d] hover:text-[#e2e2e5]">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {!result && (
          <button
            onClick={submit}
            disabled={!input.trim() || analyzing || !ready || !!loadingProgress}
            className={`w-full py-4 rounded-xl font-['Space_Grotesk'] font-bold tracking-[0.1em] uppercase transition-all duration-500 overflow-hidden relative flex items-center justify-center gap-2 ${
              input.trim() && ready ? 'bg-gradient-to-r from-[#004c8f] to-[#a5c8ff]/30 text-[#a5c8ff] shadow-[0_0_20px_rgba(0,76,143,0.3)] active:scale-95' : 'bg-[#282a2c] text-[#8d909d] opacity-50 cursor-not-allowed'
            }`}
          >
            {error ? (
              <>
                <span className="material-symbols-outlined text-[#ffb4ab]">error</span>
                ҚАТЕ КЕТТІ
              </>
            ) : isScraping ? (
              <>
                <span className="material-symbols-outlined animate-spin">language</span>
                САЙТ МӘТІНІН ЖҮКТЕУДЕ...
                <div className="absolute left-0 bottom-0 h-1 bg-[#a5c8ff] animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
              </>
            ) : analyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin">data_usage</span>
                ЖИ ТАЛДАУДА...
                <div className="absolute left-0 bottom-0 h-1 bg-[#40e56c] animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
              </>
            ) : !ready ? (
              <>
                <span className="material-symbols-outlined">downloading</span>
                МОДЕЛЬ ОРНАТЫЛУДА... {(loadingProgress?.progress || 0).toFixed(0)}%
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">radar</span>
                ЖИ ТЕКСЕРУІН БАСТАУ
              </>
            )}
          </button>
        )}

        {loadingProgress && !ready && (
          <div className="mt-4">
            <div className="w-full h-1 bg-[#282a2c] rounded-full overflow-hidden">
              <div className="h-full bg-[#a5c8ff] transition-all duration-300" style={{ width: `${loadingProgress.progress}%` }} />
            </div>
            <div className="text-[10px] text-[#8d909d] mt-2 text-center uppercase tracking-widest font-mono">ЖИ локальды моделі жүктелуде: {loadingProgress.file}</div>
          </div>
        )}

        {analyzing && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-[#c3c6d4] text-[10px] font-mono tracking-widest uppercase">
              <span className="material-symbols-outlined text-xs text-[#a5c8ff] animate-pulse">public</span>
              Доменді верификациялау...
            </div>
            <div className="flex items-center gap-3 text-[#c3c6d4] text-[10px] font-mono tracking-widest uppercase opacity-70">
              <span className="material-symbols-outlined text-xs text-[#a5c8ff] animate-pulse">gavel</span>
              Күдікті кілттерді эвристикалық тексеру...
            </div>
            <div className="flex items-center gap-3 text-[#c3c6d4] text-[10px] font-mono tracking-widest uppercase opacity-40 ml-6">Онлайн мазмұнды салыстыру...</div>
          </div>
        )}

        {result && (
          <div className="mt-8 relative animate-[security-pulse-anim_0.5s_ease-out]">
            <div
              className={`p-6 rounded-2xl border backdrop-blur-xl flex flex-col items-center text-center ${
                result.status === 'safe'
                  ? 'bg-[#40e56c]/5 border-[#40e56c]/30 shadow-[0_0_30px_rgba(64,229,108,0.1)]'
                  : result.status === 'caution'
                    ? 'bg-[#ffb692]/5 border-[#ffb692]/30 shadow-[0_0_30px_rgba(255,182,146,0.1)]'
                    : 'bg-[#ffb4ab]/5 border-[#ffb4ab]/30 shadow-[0_0_50px_rgba(255,180,171,0.2)]'
              }`}
            >
              <span className={`material-symbols-outlined icon-filled text-6xl mb-4 ${result.status === 'safe' ? 'text-[#40e56c]' : result.status === 'caution' ? 'text-[#ffb692]' : 'text-[#ffb4ab]'}`}>
                {result.status === 'safe' ? 'verified_user' : result.status === 'caution' ? 'warning' : 'gpp_bad'}
              </span>

              <h3 className={`font-['Space_Grotesk'] text-2xl font-bold mb-1 ${result.status === 'safe' ? 'text-[#40e56c]' : result.status === 'caution' ? 'text-[#ffb692]' : 'text-[#ffb4ab]'}`}>
                {result.status === 'safe' ? 'Қауіпсіз' : result.status === 'caution' ? 'Күдікті кілттер' : 'СЫН КӨТЕРМЕЙТІН ҚАУІП'}
              </h3>

              <div className="text-[10px] uppercase tracking-[0.2em] text-[#c3c6d4] mb-6">
                {result.type === 'url' ? 'URL МАҚСАТЫ' : result.type === 'email' ? 'EMAIL ПАТТЕРНІ' : 'ХАБАРЛАМА МӘТІНІ'}
              </div>

              <div className="w-full h-[1px] bg-white/10 mb-6" />

              <ul className="text-left w-full space-y-3 mb-8">
                {result.findings.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#e2e2e5]">
                    <span className={`material-symbols-outlined text-[18px] ${result.status === 'safe' ? 'text-[#40e56c]' : 'text-[#ffb4ab]'}`}>{result.status === 'safe' ? 'check_circle' : 'priority_high'}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button onClick={reset} className="w-full py-3 rounded-xl bg-[#282a2c] hover:bg-[#333537] text-[#c3c6d4] font-bold text-xs uppercase tracking-widest transition-colors">
                Жаңа сұраныс
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav active="analyzer" onNavigate={onNavigate} />
    </div>
  );
};

export default AnalyzerScreen;
