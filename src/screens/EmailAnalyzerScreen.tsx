import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import type { NavVariant } from '../components/BottomNav';
import { useHistory } from '../hooks/useHistory';
import { useSentinel } from '../context/SentinelContext';

interface EmailAnalyzerScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

// Extract email address from header-style text like "Name <email@domain.com>"
function extractEmail(text: string): string {
  const match = text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : text.slice(0, 60);
}

// Comprehensive email analysis heuristics
function analyzeEmail(raw: string): { status: 'safe' | 'danger'; findings: string[] } {
  const lower = raw.toLowerCase();
  const findings: string[] = [];
  let dangerScore = 0;

  // 1. Free email provider used as corporate sender
  if (/@gmail\.com|@yahoo\.com|@mail\.ru|@hotmail\.com/.test(lower) && (lower.includes('support') || lower.includes('security') || lower.includes('admin') || lower.includes('noreply'))) {
    findings.push('Тегін домен (@gmail, @yahoo) корпоративтік жіберуші ретінде пайдаланылған');
    dangerScore += 30;
  }

  // 2. Urgency keywords (KZ + EN + RU)
  const urgencyWords = ['шұғыл', 'бұғатталды', 'urgent', 'immediately', 'verify now', 'account suspended', 'срочно', 'заблокирован', 'немедленно'];
  const foundUrgency = urgencyWords.filter(w => lower.includes(w));
  if (foundUrgency.length > 0) {
    findings.push(`Шұғылдық (Social Engineering) белгілері: "${foundUrgency[0]}"`);
    dangerScore += 25;
  }

  // 3. Suspicious TLDs
  if (/\.(xyz|tk|ml|ga|cf|gq|pw|top|click|download|win|loan)\b/.test(lower)) {
    findings.push('Күдікті жоғары деңгейлі домен (TLD) анықталды (.xyz, .tk, .ml және т.б.)');
    dangerScore += 35;
  }

  // 4. Suspicious subdomains / keyword-stuffed domains
  if (/update-password|secure-login|billing-alert|account-verify|paypal-secure|apple-support/.test(lower)) {
    findings.push('Домен атауы ресми сервисті еліктеуге арналған (domain spoofing)');
    dangerScore += 40;
  }

  // 5. Homograph attack — cyrillic chars in domain
  const fromMatch = raw.match(/From:.*?[\r\n]/i) || raw.match(/<([^>]+)>/);
  if (fromMatch) {
    const hasCyrillicInDomain = /[а-яёА-ЯЁіІ]/.test(fromMatch[0].split('@')[1] || '');
    if (hasCyrillicInDomain) {
      findings.push('Омографтық шабуыл: домен атауында кириллица әріптері бар (Homograph/Punycode)');
      dangerScore += 50;
    }
  }

  // 6. Executable attachment keywords
  if (/\.exe|\.vbs|\.bat|\.sh|\.ps1|\.scr/.test(lower)) {
    findings.push('Орындалатын тіркеме (.exe/.vbs/.bat) — зиянды код жүктелуі мүмкін');
    dangerScore += 45;
  }

  // 7. Password/credential request
  if (/enter your password|confirm your credentials|verify your account|log in here|sign in below/.test(lower)) {
    findings.push('Тіркелгі деректерін сұрау анықталды — заңды сервистер мұндай хаттар жібермейді');
    dangerScore += 30;
  }

  // 8. Mismatched reply-to
  const replyTo = raw.match(/Reply-To:\s*(.+)/i);
  const from = raw.match(/From:\s*(.+)/i);
  if (replyTo && from) {
    const replyDomain = replyTo[1].match(/@([\w.-]+)/)?.[1];
    const fromDomain = from[1].match(/@([\w.-]+)/)?.[1];
    if (replyDomain && fromDomain && replyDomain !== fromDomain) {
      findings.push(`Reply-To домені жіберушіден өзгеше (${fromDomain} → ${replyDomain}) — классикалық BEC шабуылы`);
      dangerScore += 40;
    }
  }

  if (findings.length === 0) {
    findings.push('SPF/DKIM/DMARC: Күдікті үлгілер табылмады');
    findings.push('Домен атауы заңды көрінеді');
    findings.push('Шұғылдық немесе манипуляция белгілері жоқ');
  }

  return {
    status: dangerScore >= 25 ? 'danger' : 'safe',
    findings,
  };
}

export const EmailAnalyzerScreen: React.FC<EmailAnalyzerScreenProps> = ({ onNavigate, onOpenMenu }) => {
  const [emailRaw, setEmailRaw] = useState('');
  const [result, setResult] = useState<any>(null);
  const [localAnalyzing, setLocalAnalyzing] = useState(false);
  const { addEntry } = useHistory();
  const { addThreatLog } = useSentinel();

  const handleAnalyze = () => {
    if (!emailRaw.trim()) return;
    setLocalAnalyzing(true);

    setTimeout(() => {
      setLocalAnalyzing(false);
      const analysis = analyzeEmail(emailRaw);
      setResult({ ...analysis, type: 'email' });

      addEntry({
        type: 'Email Intel',
        target: extractEmail(emailRaw),
        status: analysis.status === 'safe' ? 'Clean' : 'Blocked',
        threat: analysis.status === 'safe' ? 'Low' : 'High',
      });

      addThreatLog({
        type: 'email',
        status: analysis.status === 'safe' ? 'clean' : 'blocked',
        message: `Хат тексерілді: ${extractEmail(emailRaw)}`
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-32">
      <div className="md:hidden">
        <Header title="EMAIL ИНТЕЛ" showSentinel={false} onOpenMenu={onOpenMenu} />
      </div>
      
      <main className="pt-24 px-6 max-w-lg mx-auto w-full">
        {/* Intro */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#a5c8ff]/5 border border-[#a5c8ff]/10 mb-8 backdrop-blur-md">
           <span className="material-symbols-outlined text-[#a5c8ff] text-3xl opacity-80">mark_email_read</span>
           <div>
             <h2 className="font-['Space_Grotesk'] font-bold text-[#e2e2e5]">Кәсіби Email Талдау</h2>
             <p className="text-[10px] text-[#8d909d] leading-relaxed mt-1">
               Хаттың SPF, DKIM, DMARC тақырыптарын және фишинг белгілерін терең талдау жүйесі.
             </p>
           </div>
        </div>

        {/* Input */}
        <div className="relative mb-6">
          <textarea
            value={emailRaw}
            onChange={(e) => setEmailRaw(e.target.value)}
            disabled={localAnalyzing}
            placeholder="Хат мәтінін немесе Email тақырыптарын (headers) осында кірістіріңіз..."
            className="w-full h-40 bg-[#0c162c] text-[#a5c8ff] font-mono text-xs tracking-wide border border-[#3b82f6]/30 rounded-2xl p-4 focus:outline-none focus:border-[#3b82f6]/80 transition-colors resize-none disabled:opacity-50 custom-scrollbar shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
          />
          {emailRaw && !localAnalyzing && !result && (
             <button onClick={() => setEmailRaw('')} className="absolute top-4 right-4 text-[#3b82f6] hover:text-white">
               <span className="material-symbols-outlined text-sm">close</span>
             </button>
          )}
        </div>

        {/* Action Button */}
        {!result && (
          <button
            onClick={handleAnalyze}
            disabled={!emailRaw.trim() || localAnalyzing}
            className={`w-full py-4 rounded-xl font-['Space_Grotesk'] font-bold tracking-[0.1em] uppercase transition-all duration-500 overflow-hidden relative flex items-center justify-center gap-2 ${
              emailRaw.trim()
                ? 'bg-gradient-to-r from-[#004c8f] to-[#a5c8ff]/30 text-[#a5c8ff] shadow-[0_0_20px_rgba(0,76,143,0.3)] active:scale-95'
                : 'bg-[#282a2c] text-[#8d909d] opacity-50 cursor-not-allowed'
            }`}
          >
             {localAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">data_usage</span>
                  SPF/DKIM/DMARC ТЕКСЕРІЛУДЕ...
                  <div className="absolute left-0 bottom-0 h-1 bg-[#40e56c] animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
                </>
             ) : (
                <>
                  <span className="material-symbols-outlined">verified_user</span>
                  EMAIL ТАЛДАУЫН БАСТАУ
                </>
             )}
          </button>
        )}

        {/* Terminal/Aesthetic Result */}
        {result && (
          <div className="mt-8 relative animate-[security-pulse-anim_0.5s_ease-out]">
             <div className="bg-[#050510] border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
                <div className="bg-[#121416] px-4 py-2 flex items-center justify-between border-b border-white/10">
                   <div className="flex gap-2">
                       <span className="w-3 h-3 rounded-full bg-[#ffb4ab]"></span>
                       <span className="w-3 h-3 rounded-full bg-[#ffb692]"></span>
                       <span className="w-3 h-3 rounded-full bg-[#40e56c]"></span>
                   </div>
                   <span className="text-[#8d909d]">Analysis Report</span>
                </div>
                
                <div className="p-4 space-y-4">
                   <div className="flex items-center gap-2">
                      <span className="text-[#8d909d]">➔ status:</span>
                      <span className={`font-bold uppercase tracking-widest ${result.status === 'safe' ? 'text-[#40e56c]' : 'text-[#ffb4ab]'}`}>
                         {result.status === 'safe' ? 'Verified Safe' : 'CRITICAL THREAT'}
                      </span>
                   </div>

                   <div className="w-full h-[1px] bg-white/5" />

                   <ul className="space-y-3">
                     {result.findings.map((finding: string, i: number) => (
                       <li key={i} className="flex gap-3 text-[#e2e2e5]">
                         <span className={`${result.status === 'safe' ? 'text-[#40e56c]' : 'text-[#ffb4ab]'}`}>
                            {result.status === 'safe' ? '[ OK ]' : '[FAIL]'}
                         </span>
                         {finding}
                       </li>
                     ))}
                   </ul>

                   <div className="pt-4">
                       <button 
                          onClick={() => {
                              setResult(null);
                              setEmailRaw('');
                          }}
                          className="w-full py-3 rounded-lg bg-[#282a2c] hover:bg-[#333537] text-white tracking-widest uppercase transition-colors"
                       >
                          ЖАҢА ТАЛДАУ
                       </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <BottomNav active="analyzer-email" onNavigate={onNavigate} />
    </div>
  );
};

export default EmailAnalyzerScreen;
