import React, { useState, useEffect } from 'react';

export const DeviceTaskManager: React.FC = () => {
  const [access, setAccess] = useState<'locked' | 'requesting' | 'granted'>('locked');
  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramLoad, setRamLoad] = useState(0);
  const [activityTick, setActivityTick] = useState(0);

  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8;

  useEffect(() => {
    if (access === 'granted') {
      let timerId: number | undefined;
      let expected = performance.now() + 1000;

      const sampleLoad = () => {
        const now = performance.now();
        const lag = Math.max(0, now - expected);
        expected = now + 1000;

        // Event-loop lag approximates how busy the main thread is.
        const computedCpu = Math.round(Math.min(100, Math.max(5, 12 + lag * 0.45)));
        const computedRam = Math.round(Math.min(95, Math.max(20, 35 + computedCpu * 0.5)));

        setCpuLoad((prev) => Math.round(prev + (computedCpu - prev) * 0.45));
        setRamLoad((prev) => Math.round(prev + (computedRam - prev) * 0.35));
        setActivityTick((prev) => prev + 1);
      };

      sampleLoad();
      timerId = window.setInterval(sampleLoad, 1000);
      return () => window.clearInterval(timerId);
    }

    setCpuLoad(0);
    setRamLoad(0);
    setActivityTick(0);
  }, [access]);

  const requestAccess = () => {
    setAccess('requesting');
    setTimeout(() => {
      setAccess('granted');
    }, 1800);
  };

  const getRingColor = (val: number) => {
    if (val > 80) return '#ef4444';
    if (val > 50) return '#eab308';
    return '#10b981';
  };

  const getActivityHeight = (index: number) => {
    const wave = Math.sin((activityTick + index) * 0.75) * 0.5 + 0.5;
    const cpuFactor = cpuLoad / 100;
    const base = 20 + index * 4;
    return Math.min(100, Math.max(8, Math.round(base + wave * 35 + cpuFactor * 40)));
  };

  return (
    <div className="relative w-full h-full min-h-[160px] rounded-[16px] border border-white/10 bg-[#060810]/80 backdrop-blur-md overflow-hidden flex shadow-lg">
      {access !== 'granted' && (
        <div className="absolute inset-0 z-20 bg-[#0c1020]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          {access === 'locked' ? (
            <>
              <div className="w-12 h-12 rounded-full border border-white/10 bg-[#3b82f6]/10 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <span className="material-symbols-outlined text-[#3b82f6]">admin_panel_settings</span>
              </div>
              <p className="text-[11px] text-center text-[#8d909d] mb-4 font-mono tracking-widest leading-relaxed uppercase">
                Құрылғы телеметриясы
                <br />
                Сенсорлар бұғатталған
              </p>
              <button onClick={requestAccess} className="bg-gradient-to-r from-[#3b82f6] to-[#1e3a8a] text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 hover:shadow-[0_0_20px_#3b82f6]">
                Рұқсат алу
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-12 h-12 flex items-center justify-center mb-3">
                <span className="absolute w-full h-full border-t-2 border-[#10b981] rounded-full animate-spin" />
                <span className="material-symbols-outlined text-[#10b981]">memory</span>
              </div>
              <span className="text-[#10b981] font-mono text-xs tracking-widest uppercase animate-pulse">Жүйелік рұқсат...</span>
            </div>
          )}
        </div>
      )}

      <div className={`p-5 flex-col md:flex-row flex w-full gap-6 transition-opacity duration-500 ease-in-out ${access === 'granted' ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
        <div className="flex-[1.2] flex flex-col justify-between h-full min-w-[200px]">
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="text-[10px] text-[#8d909d] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">memory</span>
              CPU Жүктемесі
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 border border-[#3b82f6]/30 bg-[#3b82f6]/10 rounded text-[#3b82f6] uppercase tracking-wider">{cores} C.</span>
          </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  <circle cx="32" cy="32" r="28" className="stroke-white/5" strokeWidth="6" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke={getRingColor(cpuLoad)} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="175" strokeDashoffset={175 - (175 * cpuLoad) / 100} className="transition-all duration-1000 ease-in-out" />
              </svg>
              <span className="absolute font-mono text-sm font-bold text-white">{cpuLoad}%</span>
            </div>
            <div className="flex-1 h-12 flex items-end gap-1.5 opacity-80 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-[#3b82f6] to-[#60a5fa] rounded-t-[2px] transition-all duration-700 ease-in-out" style={{ height: access === 'granted' ? `${getActivityHeight(i)}%` : '0%' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="w-px h-full bg-white/5 hidden md:block" />

        <div className="flex-[1.5] w-full flex flex-col justify-center gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#8d909d] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">speed</span>
                Жедел Жады (RAM)
              </span>
              <span className="text-[10px] font-mono text-white tracking-wider">{memory} GB</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#047857] transition-all duration-1000 ease-out" style={{ width: `${ramLoad}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[#8d909d] uppercase font-bold tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">sd_storage</span>
                Сақтау Орны
              </span>
              <span className="text-[10px] font-mono text-white tracking-wider">45.2 / 128 GB</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] transition-all duration-1000 ease-out" style={{ width: '35.3%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceTaskManager;
