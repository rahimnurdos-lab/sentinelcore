import { useState, useCallback, useEffect, useRef } from 'react';

export type AnalysisResult = {
  status: 'safe' | 'danger' | 'caution' | 'unknown';
  score: number;
  findings: string[];
  type: 'url' | 'email' | 'text';
};

export function useIntelligence() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [ready, setReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{file: string, progress: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
        worker.current = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), {
            type: 'module'
        });
        worker.current.postMessage({ type: 'init' });
    }

    const onMessageReceived = (e: MessageEvent) => {
        const { status, item, result: output, error: errMsg } = e.data;

        switch (status) {
            case 'progress':
                if (item.status === 'progress' || item.status === 'downloading') {
                    setLoadingProgress({
                       file: item.file,
                       progress: item.progress
                    });
                } else if (item.status === 'done') {
                    setLoadingProgress(null);
                }
                break;
            case 'ready':
                setReady(true);
                setLoadingProgress(null);
                break;
            case 'error':
                setError(errMsg);
                setAnalyzing(false);
                break;
            case 'complete':
                processResult(output);
                break;
        }
    };

    worker.current.addEventListener('message', onMessageReceived);
    
    return () => {
        if (worker.current) {
            worker.current.removeEventListener('message', onMessageReceived);
        }
    };
  }, []);

  const processResult = (output: any) => {
      if (!output) {
          setAnalyzing(false);
          return;
      }
      
      const { labels, scores } = output;
      
      let finalStatus: 'safe' | 'caution' | 'danger' = 'safe';
      const findings: string[] = [];
      let finalScore = 100;
      
      // const safeScore = scores[labels.indexOf('safe and secure content')];
      const phishScore = scores[labels.indexOf('phishing, scam, or steal password')];
      const casinoScore = scores[labels.indexOf('online casino, gambling, betting')];
      const illegalScore = scores[labels.indexOf('illegal, darknet, drugs, weapon')];

      // Determine highest threat
      const maxThreatScore = Math.max(phishScore, casinoScore, illegalScore);

      if (maxThreatScore > 0.4) {
          if (phishScore === maxThreatScore) {
              finalScore -= (phishScore * 60);
              findings.push(`Фишинг қаупі жоғары шындықпен анықталды (${Math.round(phishScore * 100)}%)`);
              finalStatus = phishScore > 0.6 ? 'danger' : 'caution';
          } else if (casinoScore === maxThreatScore) {
              finalScore -= (casinoScore * 50);
              findings.push(`Онлайн-казино немесе құмар ойындары белгілері (${Math.round(casinoScore * 100)}%)`);
              finalStatus = 'caution';
          } else if (illegalScore === maxThreatScore) {
              finalScore -= (illegalScore * 80);
              findings.push(`Заңсыз контент қаупі расталды (${Math.round(illegalScore * 100)}%)`);
              finalStatus = 'danger';
          }
      }

      if (findings.length === 0) {
          findings.push('Нейрожелі ешқандай қауіпті элемент таппады (100% қауіпсіз)');
          finalStatus = 'safe';
      }

      setResult({
          status: finalStatus,
          score: Math.max(0, Math.round(finalScore)),
          findings,
          type: 'text' 
      });
      setAnalyzing(false);
  };

  const [isScraping, setIsScraping] = useState(false);

  const analyze = useCallback(async (input: string) => {
    if (!ready || !worker.current) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    let textToAnalyze = input;
    const isUrl = input.match(/^https?:\/\//i);

    if (isUrl) {
      setIsScraping(true);
      try {
        // Try to fetch via CORS proxy
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(input)}`);
        
        if (response.ok) {
            const data = await response.json();
            const html = data.contents;
            
            // Extract text from HTML
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const bodyText = doc.body.textContent || '';
            // Clean up text (remove excessive whitespace) and truncate to prevent memory issues with LLM
            textToAnalyze = bodyText.replace(/\s+/g, ' ').trim().slice(0, 1500);
            
            if (textToAnalyze.length < 20) {
               textToAnalyze = `Бұл сайт: ${input}. ` + textToAnalyze;
            }
        }
      } catch (err) {
        console.warn("Failed to scrape URL, falling back to URL string analysis:", err);
      } finally {
        setIsScraping(false);
      }
    }

    worker.current.postMessage({
        type: 'analyze',
        text: textToAnalyze
    });
  }, [ready]);

  const reset = useCallback(() => {
    setResult(null);
    setAnalyzing(false);
    setError(null);
  }, []);

  return { analyzing, result, analyze, reset, ready, loadingProgress, error, isScraping };
}
