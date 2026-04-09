import React, { useState, useEffect, useRef } from 'react';
import type { NavVariant } from '../../components/BottomNav';

interface PasswordCrackerProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

const formatTime = (seconds: number): string => {
  if (seconds < 1) return 'лезде';
  if (seconds < 60) return `${Math.floor(seconds)} секунд`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} минут`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} сағат`;
  if (seconds < 31536000) return `${Math.floor(seconds / 86400)} күн`;
  if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} жыл`;
  return 'Ғасырлар бойы';
};

const calculateEntropy = (password: string) => {
  if (!password) return { entropy: 0, crackTime: 0, crackStr: formatTime(0) };

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;
  if (poolSize === 0) poolSize = 1;

  const entropy = password.length * Math.log2(poolSize);
  const combinations = Math.pow(poolSize, password.length);
  const crackTimeSeconds = combinations / 10000000000;

  return { entropy, crackTime: crackTimeSeconds, crackStr: formatTime(crackTimeSeconds) };
};

export const PasswordCrackerGame: React.FC<PasswordCrackerProps> = (props) => {
  const [password, setPassword] = useState('');
  const [isHacked, setIsHacked] = useState(false);
  const [hacking, setHacking] = useState(false);
  const [hackProgress, setHackProgress] = useState(0);
  const [crackStr, setCrackStr] = useState('лезде');
  const [crackTimeSec, setCrackTimeSec] = useState(0);
  const [win, setWin] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const res = calculateEntropy(password);
    setCrackStr(res.crackStr);
    setCrackTimeSec(res.crackTime);
    setIsHacked(false);
    setHacking(false);
    setWin(false);
    setHackProgress(0);
  }, [password]);

  const simulateHack = () => {
    if (!password) return;
    setHacking(true);
    setHackProgress(0);
    setIsHacked(false);
    setWin(false);

    const maxSimulationMs = 3000;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      let progress = (elapsed / maxSimulationMs) * 100;

      if (crackTimeSec < 60) {
        progress = 100;
      } else if (crackTimeSec > 31536000) {
        progress = Math.min(progress, 35);
      }

      setHackProgress(progress);

      if (elapsed >= maxSimulationMs || progress >= 100) {
        clearInterval(interval);
        setHacking(false);

        if (crackTimeSec > 31536000) setWin(true);
        else setIsHacked(true);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#e2e2e5] font-['Space_Grotesk'] pb-6 fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-between p-6 bg-gradient-to-b from-[#121416] to-transparent relative z-20">
        <button onClick={() => props.onNavigate('training')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-widest text-[#f43f5e]">ПАРОЛЬ БҰЗУШЫ</h2>
          <div className="text-[10px] text-[#8d909d] tracking-widest uppercase">Хакердің көзімен қара</div>
        </div>
        <div className="w-10" />
      </div>

      <main className="pt-10 px-6 max-w-md mx-auto w-full" ref={containerRef}>
        <div className="text-center mb-10 text-white animate-[fade-in_0.5s_ease-out]">
          <div className="w-20 h-20 mx-auto rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <span className="material-symbols-outlined text-4xl text-[#a5c8ff]">lock_open_right</span>
          </div>
          <p className="text-sm font-['Manrope'] text-[#8d909d] mb-4">
            Хакерге сіздің құпия сөзіңізді табуға қанша уақыт керек? Күшін сынап көріңіз.
            <span className="text-[#40e56c] font-bold"> Тапсырма: 1 жылдан асатын пароль құрастыру.</span>
          </p>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Парольді осында жазыңыз..."
            className="w-full bg-[#121416] border border-[#a5c8ff]/30 text-white px-6 py-5 rounded-2xl font-bold text-center text-xl focus:outline-none focus:border-[#a5c8ff] focus:ring-1 focus:ring-[#a5c8ff]/50 transition-all font-mono"
            autoComplete="off"
            spellCheck="false"
            disabled={hacking}
          />
          {password.length > 0 && (
            <div className="absolute top-full mt-2 w-full flex justify-between items-center px-2">
              <span className="text-xs font-bold text-[#8d909d]">Ұзындығы: {password.length}</span>
              <span className="text-xs font-bold text-[#8d909d]">Бұзу уақыты: <span className="text-[#f43f5e]">{crackStr}</span></span>
            </div>
          )}
        </div>

        <button
          disabled={!password || hacking}
          onClick={simulateHack}
          className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-lg transition-all mb-8 shadow-lg ${
            !password || hacking ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-[#f43f5e]/30 hover:scale-[1.02]'
          }`}
        >
          {hacking ? 'БҰЗЫЛУДА...' : 'ХАКЕРЛІК ШАБУЫЛ (BRUTE-FORCE)'}
        </button>

        <div className="bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-xs overflow-hidden relative min-h-[200px]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-[#f43f5e]" />
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
            <div className="w-3 h-3 rounded-full bg-[#40e56c]" />
            <span className="ml-2 text-white/50">cracking_terminal.exe</span>
          </div>

          {!hacking && !isHacked && !win && <div className="text-white/30 text-center mt-10">&gt; Дайын... Парольді енгізіп, батырманы басыңыз.</div>}

          {hacking && (
            <div className="text-[#40e56c]">
              <p>&gt; Initializing brute-force tools...</p>
              <p className="mt-2">&gt; Target acquired. Calculating hashes...</p>

              <div className="mt-4 break-all opacity-80 text-[#f43f5e]">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i}>{(Math.random() + 1).toString(36).substring(2)} </span>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-white mb-2">Прогресс: {Math.floor(hackProgress)}%</div>
                <div className="w-full h-2 bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#f43f5e] transition-all" style={{ width: `${hackProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {isHacked && !hacking && (
            <div className="text-center mt-6 animate-[fade-in_0.3s_ease-out]">
              <span className="material-symbols-outlined text-[#f43f5e] text-5xl mb-2">lock_open</span>
              <h3 className="text-xl font-bold text-[#f43f5e] uppercase tracking-widest mb-2">СӘТТІ БҰЗЫЛДЫ!</h3>
              <p className="text-[#8d909d] leading-relaxed">Құпия сөзіңіз тым әлсіз. Эмуляцияланған бұзу уақыты: {crackStr}. Сандарды, бас әріптерді және символдарды қосып көріңіз.</p>
            </div>
          )}

          {win && !hacking && (
            <div className="text-center mt-6 animate-[fade-in_0.3s_ease-out]">
              <span className="material-symbols-outlined text-[#40e56c] text-5xl mb-2">verified_user</span>
              <h3 className="text-xl font-bold text-[#40e56c] uppercase tracking-widest mb-2">БАС ТАРТТЫ</h3>
              <p className="text-[#8d909d] leading-relaxed">Жүйе хакердің компьютерін тежеді. Пароль өте күшті. Бұзу үшін {crackStr} қажет болар еді.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PasswordCrackerGame;
