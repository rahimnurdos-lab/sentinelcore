import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import type { NavVariant } from '../components/BottomNav';
import { useSentinel } from '../context/SentinelContext';

interface CyberAdvisorScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export const CyberAdvisorScreen: React.FC<CyberAdvisorScreenProps> = (props) => {
  const { onNavigate, onOpenMenu } = props;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Сәлеметсіз бе! Мен Sentinel Core жасанды интеллект кеңесшісімін. Қандай да бір күдікті файл, хат немесе сілтеме болса маған жіберіңіз, мен қауіпсіздік деңгейін анықтаймын.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const recognitionRef = useRef<any>(null);
  const handleSendVoiceRef = useRef<(textOverride?: string) => void>(() => {});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initializing Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'kk-KZ'; // Kazakh
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendVoiceRef.current(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }

    // Initializing Web Worker
    workerRef.current = new Worker(new URL('../workers/chatWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current.postMessage({ type: 'init' });

    workerRef.current.onmessage = (e) => {
       const { status, result, data } = e.data;
       
       if (status === 'progress') {
          if (data && data.progress) setDownloadProgress(data.progress);
       } else if (status === 'ready') {
          setModelReady(true);
       } else if (status === 'complete') {
          setIsTyping(false);
          const aiText = result;
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: aiText,
            timestamp: new Date()
          }]);
       } else if (status === 'error') {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: "Жүйе қателігі: Жергілікті AI модулін іске қосу мүмкін болмады.",
            timestamp: new Date()
          }]);
       }
    };

    return () => {
       workerRef.current?.terminate();
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const { addThreatLog } = useSentinel();

  const getSmartFallback = useCallback((input: string) => {
     if (input.includes('вирус') || input.includes('malware') || input.includes('троян')) return "Вирустар – бұл компьютерге зақым келтіретін немесе деректерді ұрлайтын зиянды бағдарламалар (Malware). Олардан қорғану үшін әрқашан антивирусты жаңартып, бейтаныс файлдарды немесе сілтемелерді ашпаңыз.";
     if (input.includes('фишинг') || input.includes('phishing')) return "Фишинг – бұл алаяқтардың ресми ұйым кейпіне еніп, сіздің логин, құпиясөзіңізді немесе банк картаңызды ұрлау тәсілі. Біздің платформадағы Симулятор арқылы фишингтен қорғануды үйрене аласыз.";
     if (input.includes('пароль') || input.includes('құпиясөз') || input.includes('сырсөз')) return "Мықты пароль жасау үшін: кемінде 12 символ, бас әріптер, сандар және арнайы таңбаларды қолданыңыз. Барлық сайттарда бірдей пароль қолданбау өте маңызды!";
     if (input.includes('vpn') || input.includes('впн')) return "VPN (Virtual Private Network) – интернеттегі трафигіңізді шифрлап, IP мекенжайыңызды жасырады. Бұл әсіресе қоғамдық Wi-Fi (кафе, әуежай) желілерінде деректеріңізді ұрлатпау үшін өте қажет.";
     if (input.includes('хакер') || input.includes('бұзу') || input.includes('кибершабуыл')) return "Көптеген хакерлер әлеуметтік инженерияны немесе бағдарламалардағы осалдықтарды (vulnerabilities) пайдаланады. Жүйені және қосымшаларды уақытылы жаңарту – ең мықты қорғаныс.";
     if (input.includes('сәлем') || input.includes('ассалаумағалейкум') || input.includes('привет')) return "Сәлеметсіз бе! Мен киберқауіпсіздік жөніндегі көмекшімін. Маған файлды тексеруді, киберқауіптер жайлы мәлімет беруді немесе оқу курстарын ашуды бұйыра аласыз.";
     
     return "Local AI моделі (Нейрожелі) алғаш рет браузерге жүктелгенше (кең жолақты интернет болмаса біраз күттіруі мүмкін) сіздің бұл күрделі сұрағыңызға жүйе автоматты жауап бере алмайды. Дегенмен, қазіргі уақытта вирустар, фишинг, VPN, парольдер туралы сұрай аласыз немесе модульдерді ауыстыруды бұйыра аласыз.";
  }, []);

  const handleSendVoice = useCallback((textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const lowerInput = textToSend.toLowerCase();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // AI Orchestration
    let action: (() => void) | null = null;
    let willNavigate = false;

    if (lowerInput.includes('сканер') || lowerInput.includes('url') || lowerInput.includes('тексер')) {
       action = () => setTimeout(() => onNavigate('analyzer'), 1800);
       willNavigate = true;
    } else if (lowerInput.includes('хат') || lowerInput.includes('email') || lowerInput.includes('пошта')) {
       action = () => setTimeout(() => onNavigate('analyzer-email'), 1800);
       willNavigate = true;
    } else if (lowerInput.includes('үйрен') || lowerInput.includes('курс') || lowerInput.includes('оқу')) {
       action = () => setTimeout(() => onNavigate('training'), 1800);
       willNavigate = true;
    } else if (lowerInput.includes('фишинг') || lowerInput.includes('практика') || lowerInput.includes('жарыс')) {
       action = () => setTimeout(() => onNavigate('simulator'), 1800);
       willNavigate = true;
    } else if (lowerInput.includes('лог') || lowerInput.includes('статистика')) {
       action = () => setTimeout(() => onNavigate('home'), 1800);
       willNavigate = true;
    }

    addThreatLog({
      type: 'system',
      status: 'info',
      message: `ЖИ Агентіне сұраныс: ${lowerInput.split(' ').slice(0, 3).join(' ')}...`
    });

    if (willNavigate) {
       // Manual hardcoded response for navigation
       setTimeout(() => {
         setIsTyping(false);
         const navMsg = "Сіздің сұранысыңыз бойынша модульге ауысып жатырмын. Күте тұрыңыз.";
         setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: navMsg,
            timestamp: new Date()
         }]);
         if (action) action();
       }, 1000);
    } else {
       // Send to Local AI for conversation
       if (modelReady && workerRef.current) {
          workerRef.current.postMessage({ type: 'generate', text: textToSend });
       } else {
          // Smart Fallback if LLM is not ready yet
          setTimeout(() => {
             setIsTyping(false);
             const fallbackMsg = getSmartFallback(lowerInput);
             setMessages(prev => [...prev, {
               id: Date.now().toString(),
               sender: 'ai',
               text: fallbackMsg,
               timestamp: new Date()
             }]);
          }, 600);
       }
    }
   }, [addThreatLog, getSmartFallback, input, modelReady, onNavigate]);

  useEffect(() => {
    handleSendVoiceRef.current = handleSendVoice;
  }, [handleSendVoice]);

  const handleSend = () => {
    handleSendVoice();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-6">
      <div className="md:hidden">
        <Header onOpenMenu={onOpenMenu} />
      </div>

      <main className="pt-24 md:pt-10 px-6 flex justify-center w-full h-[calc(100vh-30px)] md:h-screen">
        <div className="w-full max-w-4xl flex flex-col relative bg-[#0c1020]/60 backdrop-blur-xl border border-[#3b82f6]/20 rounded-t-[24px] rounded-b-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Internal Header */}
          <div className="p-4 md:p-6 border-b border-[#3b82f6]/20 flex items-center justify-between bg-[#060810]/80">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#10b981] icon-filled animate-pulse">robot_2</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-[#060810] rounded-full"></span>
              </div>
              <div>
                <h2 className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
                  Cyber Advisor 
                  {!modelReady ? (
                    <span className="text-[10px] text-[#8d909d] tracking-widest lowercase border border-[#8d909d]/30 px-2 rounded">
                      Model DL: {downloadProgress.toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#10b981] tracking-widest lowercase border border-[#10b981]/30 px-2 bg-[#10b981]/10 rounded shadow-[0_0_5px_#10b981]">
                      Ready
                    </span>
                  )}
                </h2>
                <div className="text-xs text-[#10b981] font-mono tracking-widest uppercase">Local LLM • Qwen 0.5B • Offline</div>
              </div>
            </div>
            <button onClick={() => {
                  onNavigate('home');
              }} 
              className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-[#8d909d]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-[#0a0c14]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl relative group ${
                  msg.sender === 'user' 
                  ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-white rounded-tr-sm' 
                  : 'bg-[#1a1c23]/80 border border-white/5 text-[#e2e2e5] rounded-tl-sm'
                }`}>
                  {msg.sender === 'ai' && (
                    <span className="absolute -left-10 top-2 w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20 hidden md:flex">
                         <span className="material-symbols-outlined text-[#10b981] text-[16px]">smart_toy</span>
                    </span>
                  )}
                  <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                  <div className={`text-[10px] mt-2 font-mono opacity-50 flex items-center gap-1 ${msg.sender === 'user' ? 'justify-end text-[#3b82f6]' : 'justify-start text-[#10b981]'}`}>
                    <span className="material-symbols-outlined text-[12px]">{msg.sender === 'user' ? 'check_circle' : 'schedule'}</span>
                    {msg.timestamp.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-[#1a1c23]/80 border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                         <div className="flex gap-1">
                             <div className="w-2 h-2 rounded-full bg-[#10b981]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-2 h-2 rounded-full bg-[#10b981]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                             <div className="w-2 h-2 rounded-full bg-[#10b981]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#0a0c16] border-t border-white/5">
            <div className="relative flex items-center group">
              <button 
                onClick={toggleRecording}
                className={`absolute left-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isRecording ? 'bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/50 animate-pulse' : 'hover:bg-white/10 text-[#8d909d]'
                }`}>
                <span className="material-symbols-outlined text-[20px]">{isRecording ? 'mic' : 'mic_none'}</span>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRecording ? "Сізді тыңдап тұрмын..." : "Системадан не сұрағыңыз келеді?"}
                className="w-full bg-[#1a1c26] text-white border border-white/10 rounded-2xl pl-12 pr-14 py-4 min-h-[56px] max-h-[120px] resize-none focus:outline-none focus:border-[#3b82f6]/50 focus:bg-[#1a1c26]/80 transition-all custom-scrollbar placeholder:text-[#8d909d]/50"
                rows={1}
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`absolute right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                  input.trim() && !isTyping ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] hover:shadow-[0_0_15px_#3b82f6]' : 'bg-[#1a1c26] border border-white/10 text-[#8d909d] opacity-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] ml-1">send</span>
              </button>
            </div>
            <p className="text-center font-mono text-[9px] text-[#8d909d]/50 mt-3 uppercase tracking-widest">
               AI-кеңесші қателесуі мүмкін. Жеке мәліметтерді жібермеңіз.
            </p>
          </div>
        </div>
      </main>

      {/* Decorative blurs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#3b82f6]/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};
export default CyberAdvisorScreen;
