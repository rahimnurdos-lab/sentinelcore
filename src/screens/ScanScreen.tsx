import React, { useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';
import { useScan } from '../hooks/useScan';
import { useSecurity } from '../hooks/useSecurity';

interface ScanScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onNavigate, onOpenMenu }) => {
  const {
    progress,
    scanning,
    completed,
    currentFile,
    cpuLoad,
    scannedFiles,
    threatsFound,
    suspiciousFiles,
    junkFiles,
    totalJunkSize,
    riskScore,
    recommendation,
    stop,
    start,
  } = useScan();
  const { setState } = useSecurity();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const threatFound = threatsFound.length > 0;
  const suspiciousFound = suspiciousFiles.length > 0;
  const junkFound = junkFiles.length > 0;

  useEffect(() => {
    if (!completed) return;
    if (threatFound || riskScore >= 60) setState('danger');
    else if (suspiciousFound || junkFound) setState('caution');
    else setState('safe');
  }, [completed, threatFound, suspiciousFound, junkFound, riskScore, setState]);

  const handleStartScan = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) start(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scanItems = [
    {
      id: 'threats',
      icon: 'verified_user',
      iconColor: completed && threatFound ? 'text-[#ffb4ab]' : 'text-[#40e56c]',
      title: completed && threatFound ? `${threatsFound.length} жоғары қауіп` : 'Жоғары қауіп табылмады',
      desc: scanning ? currentFile || 'Файлдар оқылуда...' : threatFound ? 'Күдікті орындалатын файлдар анықталды' : 'Зиянды орындалатын үлгілер байқалмады',
      status: scanning ? <span className="material-symbols-outlined animate-spin text-[#c3c6d4] text-lg">sync</span> : <span className={`material-symbols-outlined text-lg ${threatFound ? 'text-[#ffb4ab]' : 'text-[#40e56c]'}`}>{threatFound ? 'warning' : 'check_circle'}</span>,
    },
    {
      id: 'suspicious',
      icon: 'rule',
      iconColor: completed && suspiciousFound ? 'text-[#ffd58f]' : 'text-[#40e56c]',
      title: completed && suspiciousFound ? `${suspiciousFiles.length} күмәнді файл` : 'Күмәнді мінез-құлық жоқ',
      desc: scanning ? 'Атауы мен үлгісі тексерілуде' : suspiciousFound ? 'Кілтсөз және жасырын файл паттерндары табылды' : 'Қауіпті атау үлгілері табылмады',
      status: scanning ? <span className="material-symbols-outlined animate-spin text-[#c3c6d4] text-lg">sync</span> : <span className={`material-symbols-outlined text-lg ${suspiciousFound ? 'text-[#ffd58f]' : 'text-[#40e56c]'}`}>{suspiciousFound ? 'warning' : 'check_circle'}</span>,
    },
    {
      id: 'junk',
      icon: 'delete',
      iconColor: completed && junkFound ? 'text-[#ffb692]' : 'text-[#40e56c]',
      title: completed && junkFound ? `${totalJunkSize} MB қоқыс` : 'Жүйе таза',
      desc: scanning ? 'Кэш пен артық файлдар қаралуда' : junkFound ? `${junkFiles.length} үлкен немесе кэш файл табылды` : 'Қоқыс жоқ',
      status: scanning ? <span className="material-symbols-outlined animate-spin text-[#c3c6d4] text-lg">sync</span> : <span className={`material-symbols-outlined text-lg ${junkFound ? 'text-[#ffb692]' : 'text-[#40e56c]'}`}>{junkFound ? 'warning' : 'check_circle'}</span>,
    },
    {
      id: 'cpu',
      icon: 'memory',
      iconColor: cpuLoad > 80 ? 'text-[#ffb4ab]' : cpuLoad > 50 ? 'text-[#ffd58f]' : 'text-[#40e56c]',
      title: `CPU жүктемесі: ${cpuLoad}%`,
      desc: scanning ? 'Файл талдауына сай нақты есептеліп жатыр' : 'Соңғы скан кезіндегі жүктеме көрсеткіші',
      status: <span className={`text-[10px] font-mono px-2 py-1 rounded ${cpuLoad > 80 ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : cpuLoad > 50 ? 'bg-[#ffd58f]/20 text-[#ffd58f]' : 'bg-[#40e56c]/20 text-[#40e56c]'}`}>{cpuLoad > 80 ? 'HIGH' : cpuLoad > 50 ? 'MED' : 'LOW'}</span>,
    },
    {
      id: 'apps',
      icon: 'apps',
      iconColor: 'text-[#c3c6d4]',
      title: 'Файл қамтуы',
      desc: scanning ? `${scannedFiles} файл тексерілді` : completed ? `Жалпы ${scannedFiles} файл талданды` : 'Скан басталған жоқ',
      status: scanning ? <span className="text-[10px] font-mono text-[#a5c8ff] bg-[#004c8f]/20 px-2 py-1 rounded animate-pulse">SCANNING</span> : <span className="text-[10px] font-mono text-[#40e56c] bg-[#40e56c]/20 px-2 py-1 rounded">DONE</span>,
    },
  ] as const;

  const statusColor = completed && (threatFound || riskScore >= 60) ? 'text-[#ffb4ab]' : completed && suspiciousFound ? 'text-[#ffd58f]' : 'text-[#a5c8ff]';
  const ringColor = completed && (threatFound || riskScore >= 60) ? 'bg-[#ffb4ab]' : completed && suspiciousFound ? 'bg-[#ffd58f]' : 'bg-[#40e56c]';
  const pulseColor = completed && (threatFound || riskScore >= 60) ? 'shadow-[0_0_10px_#ffb4ab]' : completed && suspiciousFound ? 'shadow-[0_0_10px_#ffd58f]' : 'shadow-[0_0_10px_#40e56c]';

  const headline = scanning
    ? 'Телефонды терең тексеру жүріп жатыр...'
    : completed
      ? threatFound || riskScore >= 60
        ? 'Талдау аяқталды: қауіп жоғары!'
        : suspiciousFound
          ? 'Талдау аяқталды: орташа тәуекел байқалды'
          : 'Талдау сәтті аяқталды'
      : 'Телефон тексеруді бастау үшін батырманы басыңыз';

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope']">
      <div className="md:hidden">
        <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#050510]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button onClick={onOpenMenu} className="mr-2 text-[#a5c8ff] hover:text-white transition-colors active:scale-90">
              <span className="material-symbols-outlined text-2xl">menu_open</span>
            </button>
            <span className="material-symbols-outlined text-[#a5c8ff]">shield_with_heart</span>
            <h1 className="font-['Space_Grotesk'] font-bold text-xl tracking-tight text-[#a5c8ff]">Телефон тексеру</h1>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#333537] border border-[#434652]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#a5c8ff] text-sm">person</span>
          </div>
        </header>
      </div>

      <main className="flex-grow pt-24 pb-32 px-6 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="relative w-72 h-72 flex items-center justify-center mb-12">
          <div className="absolute inset-0 rounded-full bg-[#1a1c1e]/50" />
          {scanning && (
            <>
              <div className="absolute inset-4 scanner-ring opacity-40" />
              <div className="absolute inset-8 scanner-ring-reverse opacity-20" />
            </>
          )}

          <div className={`relative z-10 w-48 h-48 rounded-full bg-[#282a2c] flex flex-col items-center justify-center border border-[#a5c8ff]/10 ${scanning ? 'pulse-core' : ''}`}>
            <span className={`material-symbols-outlined ${statusColor} text-5xl mb-1`}>{scanning ? 'security_update_good' : threatFound || riskScore >= 60 ? 'gpp_bad' : suspiciousFound ? 'gpp_maybe' : 'gpp_good'}</span>
            <div className={`font-['Space_Grotesk'] font-bold text-3xl ${statusColor}`}>{progress}%</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#c3c6d4] font-medium">{scanning ? 'Талдауда' : completed ? 'Аяқталды' : 'Дайын'}</div>
            <div className={`mt-1 text-[10px] font-mono px-2 py-1 rounded ${riskScore >= 60 ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : riskScore >= 30 ? 'bg-[#ffd58f]/20 text-[#ffd58f]' : 'bg-[#40e56c]/20 text-[#40e56c]'}`}>
              RISK {riskScore}%
            </div>
          </div>

          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${ringColor} ${pulseColor}`} />
        </div>

        <div className="text-center mb-8 w-full min-h-[4rem]">
          <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-[#e2e2e5] mb-2 transition-all">{headline}</h2>
          <p className="text-[#c3c6d4] text-[11px] font-mono break-all line-clamp-2 px-4 opacity-70" style={{ direction: 'rtl', textAlign: 'center' }}>
            {scanning ? currentFile : completed ? recommendation : 'Рұқсат берілген папкадағы файлдар қауіп үлгілеріне тексеріледі'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full">
          {scanItems.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-300 ${threatFound && item.id === 'threats' ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]/30' : item.id === 'suspicious' && suspiciousFound ? 'bg-[#ffd58f]/10 border-[#ffd58f]/30' : 'bg-[#1a1c1e] border-[#434652]/5'}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#282a2c] flex items-center justify-center flex-shrink-0">
                  <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-sm font-bold text-[#e2e2e5] truncate">{item.title}</div>
                  <div className="text-xs text-[#c3c6d4] truncate">{item.desc}</div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center w-8">{item.status}</div>
            </div>
          ))}
        </div>

        {completed && (threatFound || suspiciousFound) && (
          <div className="mt-4 w-full rounded-xl border border-white/10 bg-[#121416]/80 p-4">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold mb-2 text-[#e2e2e5]">Тексеру нәтижесі (алғашқы 3 файл)</h3>
            {(threatFound ? threatsFound : suspiciousFiles).slice(0, 3).map((file, index) => (
              <div key={file} className="text-xs text-[#c3c6d4] mb-1 truncate">{index + 1}. {file}</div>
            ))}
          </div>
        )}

        <div className="mt-8 w-full">
          <input type="file" ref={fileInputRef} onChange={onFilesSelected} className="hidden" {...({ webkitdirectory: '', directory: '' } as any)} multiple />
          {scanning ? (
            <button onClick={() => stop()} className="w-full py-4 rounded-full bg-[#333537] text-[#e2e2e5] font-['Space_Grotesk'] font-bold tracking-wide active:scale-95 transition-all duration-200 border border-[#434652]/20 hover:bg-[#37393b]">
              Сканерлеуді тоқтату
            </button>
          ) : (
            <button onClick={handleStartScan} className={`w-full py-4 rounded-full font-['Space_Grotesk'] font-bold tracking-wide active:scale-95 transition-all duration-200 border shadow-lg text-[#121416] ${threatFound || riskScore >= 60 ? 'bg-gradient-to-r from-[#ffb4ab] to-[#ff8c82] border-[#ffb4ab]/20' : suspiciousFound ? 'bg-gradient-to-r from-[#ffd58f] to-[#f8b84c] border-[#ffd58f]/20' : 'bg-gradient-to-r from-[#40e56c] to-[#02c953] border-[#40e56c]/20'}`}>
              {completed ? 'Қайта тексеру' : 'Тексеруді бастау'}
            </button>
          )}
        </div>
      </main>

      <BottomNav active="scan" onNavigate={onNavigate} />
    </div>
  );
};

export default ScanScreen;
