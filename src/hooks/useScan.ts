import { useState, useCallback, useRef } from 'react';

export interface ScanState {
  progress: number;
  scanning: boolean;
  completed: boolean;
  currentFile: string;
  cpuLoad: number;
  scannedFiles: number;
  threatsFound: string[];
  suspiciousFiles: string[];
  junkFiles: string[];
  totalJunkSize: number; // in MB
  riskScore: number; // 0 - 100
  recommendation: string;
}

const THREAT_EXTENSIONS = ['.apk', '.exe', '.sh', '.bat', '.cmd', '.scr', '.dll', '.msi'];
const SUSPICIOUS_KEYWORDS = ['crack', 'keygen', 'hack', 'inject', 'spy', 'stealer', 'rat', 'miner', 'mod'];

export function useScan() {
  const [state, setState] = useState<ScanState>({
    progress: 0,
    scanning: false,
    completed: false,
    currentFile: '',
    cpuLoad: 0,
    scannedFiles: 0,
    threatsFound: [],
    suspiciousFiles: [],
    junkFiles: [],
    totalJunkSize: 0,
    riskScore: 0,
    recommendation: 'Сканерлеуді бастаңыз',
  });

  const stopFlag = useRef(false);

  const start = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    stopFlag.current = false;
    setState({
      progress: 0,
      scanning: true,
      completed: false,
      currentFile: 'Басталуда...',
      cpuLoad: 12,
      scannedFiles: 0,
      threatsFound: [],
      suspiciousFiles: [],
      junkFiles: [],
      totalJunkSize: 0,
      riskScore: 0,
      recommendation: 'Талдау жүріп жатыр...',
    });

    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    const threats: string[] = [];
    const suspicious: string[] = [];
    const junk: string[] = [];
    let junkSizeBytes = 0;
    let riskPoints = 0;
    let smoothedCpu = 12;

    for (let i = 0; i < totalFiles; i++) {
      if (stopFlag.current) break;

      const file = fileArray[i];
      const path = file.webkitRelativePath || file.name;
      const nameLower = file.name.toLowerCase();
      const sizeMb = file.size / (1024 * 1024);

      // Keep visual progress smooth even for tiny folders.
      await new Promise((resolve) => setTimeout(resolve, Math.min(20, 1000 / totalFiles)));

      // 1. Junk signal (large temporary/log/backups)
      const isTemp = nameLower.endsWith('.tmp') || nameLower.endsWith('.log') || nameLower.endsWith('.old');
      if (file.size > 20 * 1024 * 1024 || isTemp) {
        junk.push(path);
        junkSizeBytes += file.size;
        riskPoints += 1;
      }

      // 2. High-risk executable patterns
      const hasThreatExtension = THREAT_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
      const hasDoubleExtension = /\.[a-z0-9]{2,4}\.(apk|exe|msi|bat|cmd)$/i.test(nameLower);
      if (hasThreatExtension || hasDoubleExtension) {
        threats.push(path);
        riskPoints += hasDoubleExtension ? 25 : 15;
      }

      // 3. Medium-risk naming patterns
      const hasSuspiciousKeyword = SUSPICIOUS_KEYWORDS.some((keyword) => nameLower.includes(keyword));
      const hiddenExecutable = nameLower.startsWith('.') && hasThreatExtension;
      if ((hasSuspiciousKeyword || hiddenExecutable) && !threats.includes(path)) {
        suspicious.push(path);
        riskPoints += hasSuspiciousKeyword ? 8 : 12;
      }

      const sizeLoad = Math.min(28, sizeMb * 1.8);
      const extensionLoad = hasThreatExtension ? 18 : 4;
      const riskLoad = Math.min(20, riskPoints * 0.35);
      const progressLoad = Math.min(10, (i / Math.max(1, totalFiles)) * 10);
      const targetCpu = Math.max(10, Math.min(95, 18 + sizeLoad + extensionLoad + riskLoad + progressLoad));
      smoothedCpu = smoothedCpu + (targetCpu - smoothedCpu) * 0.4;

      const computedRisk = Math.min(100, Math.round((riskPoints / Math.max(1, totalFiles)) * 20));
      setState((prev) => ({
        ...prev,
        currentFile: path,
        cpuLoad: Math.round(smoothedCpu),
        scannedFiles: i + 1,
        progress: Math.floor(((i + 1) / totalFiles) * 100),
        threatsFound: threats,
        suspiciousFiles: suspicious,
        junkFiles: junk,
        totalJunkSize: parseFloat((junkSizeBytes / (1024 * 1024)).toFixed(2)),
        riskScore: computedRisk,
      }));
    }

    setState((prev) => {
      const recommendation = prev.threatsFound.length > 0
        ? 'Күдікті файлдарды дереу жойып, ресми антивируспен толық тексеріс жасаңыз.'
        : prev.suspiciousFiles.length > 0
          ? 'Күдікті файлдардың көзін тексеріп, белгісіз орнатушыларды ашпаңыз.'
          : prev.junkFiles.length > 0
            ? 'Кэш және қажетсіз файлдарды тазалап, жүйе өнімділігін жақсартыңыз.'
            : 'Қауіпті белгі табылмады. Қолданбаларды тек ресми дүкеннен орнатыңыз.';

      return {
        ...prev,
        scanning: false,
        completed: !stopFlag.current,
        progress: stopFlag.current ? prev.progress : 100,
        cpuLoad: stopFlag.current ? Math.max(8, Math.round(prev.cpuLoad * 0.65)) : 10,
        recommendation: stopFlag.current ? 'Сканерлеу қолданушы тарапынан тоқтатылды.' : recommendation,
      };
    });
  }, []);

  const stop = useCallback(() => {
    stopFlag.current = true;
    setState((prev) => ({
      ...prev,
      scanning: false,
      cpuLoad: Math.max(8, Math.round(prev.cpuLoad * 0.6)),
      recommendation: 'Сканерлеу қолданушы тарапынан тоқтатылды.',
    }));
  }, []);

  return {
    ...state,
    start,
    stop,
  };
}
