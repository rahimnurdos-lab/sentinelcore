import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import Header from '../components/Header';
import type { NavVariant } from '../components/BottomNav';
import { useHistory } from '../hooks/useHistory';

interface QRScannerScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

type Mode = 'idle' | 'camera' | 'result' | 'error';

function assessUrl(url: string): { safe: boolean; reason: string } {
  const lower = url.toLowerCase();
  if (/\.(xyz|tk|ml|ga|cf|pw|top|click|download|win)\b/.test(lower))
    return { safe: false, reason: 'Күдікті домен домен аяқтауышы (.xyz, .tk...)' };
  if (/login|verify|secure|update|confirm|alert|suspend/.test(lower) && !/kaspi|egov|gov\.kz|halyk|sberbank/.test(lower))
    return { safe: false, reason: 'URL-да фишинг кілт сөздері бар' };
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower))
    return { safe: false, reason: 'IP-мекенжай домен орнына қолданылған' };
  return { safe: true, reason: 'Белгілі қауіп анықталмады' };
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = (props) => {
  const [mode, setMode] = useState<Mode>('idle');
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addEntry } = useHistory();

  const stopCamera = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    animRef.current = null;
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleFound = useCallback((text: string) => {
    stopCamera();
    setQrResult(text);
    setMode('result');
    const assessment = assessUrl(text);
    addEntry({
      type: 'QR Decode',
      target: text.slice(0, 100),
      status: assessment.safe ? 'Clean' : 'Suspicious',
      threat: assessment.safe ? 'Low' : 'Medium',
    });
  }, [stopCamera, addEntry]);

  const startCamera = async () => {
    setMode('camera');
    setQrResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      scanFrame();
    } catch {
      setErrorMsg('Камераға рұқсат берілмеді. Файл жүктеп салыңыз.');
      setMode('error');
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        handleFound(code.data);
        return;
      }
    }
    animRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      URL.revokeObjectURL(url);
      if (code) {
        handleFound(code.data);
      } else {
        setErrorMsg('QR код табылмады. Басқа сурет жүктеп көріңіз.');
        setMode('error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    img.src = url;
  };

  const reset = () => {
    stopCamera();
    setMode('idle');
    setQrResult(null);
    setErrorMsg('');
  };

  const assessment = qrResult ? assessUrl(qrResult) : null;

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-6">
      <div className="md:hidden">
        <Header onOpenMenu={props.onOpenMenu} />
      </div>

      <main className="pt-24 md:pt-10 px-6 flex justify-center w-full">
        <div className="w-full max-w-4xl flex flex-col items-center">

          <div className="text-center mb-8">
            <h2 className="font-['Space_Grotesk'] text-4xl font-black text-white uppercase tracking-tight mb-2">QR Decode</h2>
            <p className="text-[#8d909d]">QR кодты нақты оқып, қауіпсіздігін тексеру</p>
            <p className="text-[#8d909d]/50 text-xs mt-1">/ Real QR code reader with security check</p>
          </div>

          {/* Scanner Box */}
          <div className="relative w-full max-w-sm aspect-square bg-[#060810] border-2 border-[#10b981]/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] flex items-center justify-center">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#10b981] rounded-tl-3xl z-10" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#10b981] rounded-tr-3xl z-10" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#10b981] rounded-bl-3xl z-10" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#10b981] rounded-br-3xl z-10" />

            {mode === 'idle' && (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="material-symbols-outlined text-[#10b981]/40 text-6xl">qr_code_scanner</span>
                <p className="text-[#8d909d] text-sm">Камера немесе файл арқылы сканерлеңіз</p>
              </div>
            )}

            {mode === 'camera' && (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute top-0 w-full h-1 bg-[#10b981] shadow-[0_0_20px_#10b981] animate-[scandown_2s_ease-in-out_infinite_alternate] z-20" />
                <div className="absolute bottom-4 font-mono text-[#10b981] text-xs uppercase tracking-widest bg-[#060810]/80 px-4 py-1 rounded-full border border-[#10b981]/30 z-20">
                  QR Іздеуде...
                </div>
              </>
            )}

            {mode === 'result' && qrResult && assessment && (
              <div className="flex flex-col items-center z-20 text-center p-4 animate-in zoom-in duration-300">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border shadow-lg ${assessment.safe ? 'bg-[#10b981]/20 border-[#10b981]/50 shadow-[#10b981]/20' : 'bg-[#ef4444]/20 border-[#ef4444]/50 shadow-[#ef4444]/20'}`}>
                  <span className={`material-symbols-outlined text-3xl ${assessment.safe ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {assessment.safe ? 'check' : 'warning'}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg uppercase mb-1">
                  {assessment.safe ? 'Қауіпсіз' : 'Күдікті!'}
                </h3>
                <p className="text-[#8d909d] text-xs font-mono break-all px-2 border border-white/10 bg-white/5 rounded p-2 mb-2 max-w-full">
                  {qrResult}
                </p>
                <p className={`text-xs font-bold px-3 py-1 rounded-full border ${assessment.safe ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10' : 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10'}`}>
                  {assessment.reason}
                </p>
              </div>
            )}

            {mode === 'error' && (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <span className="material-symbols-outlined text-[#ef4444] text-4xl">error</span>
                <p className="text-[#ef4444] text-sm">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap gap-3 w-full max-w-sm justify-center">
            <button onClick={() => props.onNavigate('home')} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/5 transition-colors">
              Артқа
            </button>

            {(mode === 'idle' || mode === 'error') && (
              <>
                <button onClick={startCamera} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] text-white font-bold tracking-widest uppercase text-sm transition-all hover:shadow-[0_0_20px_#10b981] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Камера
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 rounded-xl border border-[#10b981]/40 text-[#10b981] font-bold tracking-widest uppercase text-sm transition-all hover:bg-[#10b981]/10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  Файл
                </button>
              </>
            )}

            {mode === 'camera' && (
              <button onClick={reset} className="flex-1 py-4 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] font-bold tracking-widest uppercase text-sm transition-all">
                Тоқтату
              </button>
            )}

            {mode === 'result' && (
              <button onClick={reset} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#047857] text-white font-bold tracking-widest uppercase text-sm transition-all hover:shadow-[0_0_20px_#10b981]">
                Қайта Scan
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

        </div>
      </main>

      <style>{`
        @keyframes scandown {
          0% { top: 0%; opacity: 0.5; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
export default QRScannerScreen;
