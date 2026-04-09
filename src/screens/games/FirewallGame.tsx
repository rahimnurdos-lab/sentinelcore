import React, { useState, useEffect, useRef } from 'react';
import type { NavVariant } from '../../components/BottomNav';

interface FirewallGameProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

type PacketType = 'safe' | 'malware' | 'spam';

interface Packet {
  id: number;
  x: number;
  y: number;
  type: PacketType;
  speed: number;
  label: string;
}

const generatePacket = (): Packet => {
  const types: PacketType[] = ['safe', 'safe', 'malware', 'spam'];
  const type = types[Math.floor(Math.random() * types.length)];
  let label = 'DATA';
  if (type === 'safe') label = ['HTTPS', 'SSL', 'TCP'][Math.floor(Math.random() * 3)];
  if (type === 'malware') label = ['TROJAN', 'WORM', 'RAT'][Math.floor(Math.random() * 3)];
  if (type === 'spam') label = ['AD', 'PHISH', 'SPAM'][Math.floor(Math.random() * 3)];

  return {
    id: Date.now() + Math.random(),
    x: Math.random() * 80 + 10, // 10% to 90% width
    y: -10,
    type,
    speed: Math.random() * 1.5 + 1.0, // speed
    label
  };
};

export const FirewallGame: React.FC<FirewallGameProps> = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [packets, setPackets] = useState<Packet[]>([]);
  const requestRef = useRef<number>();

  const startGame = () => {
     setScore(0);
     setLives(3);
     setPackets([]);
     setGameOver(false);
     setIsPlaying(true);
  };

  const endGame = () => {
     setIsPlaying(false);
     setGameOver(true);
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const handlePacketInteract = (packetId: number, block: boolean) => {
    setPackets(prev => {
        const p = prev.find(pkt => pkt.id === packetId);
        if (!p) return prev;
        
        let newScore = score;
        let newLives = lives;

        if (block) {
            // Жібермедік (Блоктадық)
            if (p.type === 'malware' || p.type === 'spam') {
                newScore += 10;
            } else {
                newLives -= 1; // Қауіпсізді блоктасақ, жаза
            }
        } else {
            // Қабылдадық
            if (p.type === 'safe') {
                newScore += 5;
            } else {
                newLives -= 1; // Вирусты қабылдасақ жаза
            }
        }

        if (newLives <= 0) {
            endGame();
        } else {
            setScore(newScore);
            setLives(newLives);
        }

        return prev.filter(pkt => pkt.id !== packetId);
    });
  };

  useEffect(() => {
    if (!isPlaying) return;

    let lastSpawn = 0;
    const LOOP = (time: number) => {
        if (time - lastSpawn > 1500 - Math.min(score * 5, 1000)) {
            setPackets(prev => [...prev, generatePacket()]);
            lastSpawn = time;
        }

        setPackets(prev => {
            const current = prev.map(p => ({ ...p, y: p.y + p.speed }));
            
            // Егер экраннан шығып кетсе - қабылданды (allow) деп саналады
            const missed = current.filter(p => p.y >= 100);
            const active = current.filter(p => p.y < 100);

            let newLives = lives;
            missed.forEach(m => {
                if (m.type !== 'safe') {
                    newLives -= 1;
                }
            });

            if (newLives <= 0 && isPlaying) {
                setTimeout(endGame, 0); // avoid state update in render
            } else if (newLives !== lives) {
                setLives(newLives);
            }

            return active;
        });

        requestRef.current = requestAnimationFrame(LOOP);
    };

    requestRef.current = requestAnimationFrame(LOOP);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isPlaying, score, lives]);

  return (
    <div className="min-h-screen bg-[#050510] text-[#e2e2e5] font-['Space_Grotesk'] pb-6 fixed inset-0 z-[60] overflow-hidden flex flex-col">
       <div className="flex items-center justify-between p-6 bg-gradient-to-b from-[#121416] to-transparent relative z-20">
          <button onClick={() => props.onNavigate('training')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div className="text-center">
             <h2 className="text-xl font-bold tracking-widest text-[#a5c8ff]">FIREWALL DEFENDER</h2>
             <div className="text-[10px] text-[#40e56c] font-mono tracking-widest uppercase">Системан қорға</div>
          </div>
          <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-xl ${i < lives ? 'text-[#f43f5e] icon-filled' : 'text-white/20'}`}>favorite</span>
              ))}
          </div>
       </div>

       <div className="flex-1 relative w-full max-w-sm mx-auto border-x border-[#3b82f6]/20 bg-[#0c0e10]">
           {/* Grid Background */}
           <div className="absolute inset-0 cyber-grid-bg opacity-30" />

           {!isPlaying && !gameOver && (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-black/50 z-30">
                   <span className="material-symbols-outlined text-6xl text-[#3b82f6] mb-6">shield</span>
                   <h3 className="text-2xl font-bold mb-4 uppercase">Желіні Қорғау</h3>
                   <p className="text-sm font-['Manrope'] text-[#8d909d] mb-8">
                       Төменге түсіп келе жатқан пакеттерді басыңыз (click/tap) - бұл оларды блоктайды (Firewall Block).
                       Қауіпсіз (жасыл) пакеттерді өткізіп жіберіңіз! Вирустар өтсе немесе қауіпсізді блоктасаңыз - өміріңіз азаяды.
                   </p>
                   <button onClick={startGame} className="py-4 px-12 bg-[#3b82f6] text-white font-bold tracking-widest rounded-xl hover:bg-[#2563eb] transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                       БАСТАУ
                   </button>
               </div>
           )}

           {gameOver && (
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-black/80 z-30">
                   <span className="material-symbols-outlined text-6xl text-[#f43f5e] mb-6 animate-pulse">crisis_alert</span>
                   <h3 className="text-3xl font-bold mb-2 uppercase text-[#f43f5e]">Бұзылды!</h3>
                   <p className="text-sm font-['Manrope'] mb-8 text-white/50">Вирустар жүйеге кіріп кетті.</p>
                   
                   <div className="text-6xl font-black text-white mb-8">{score}</div>

                   <button onClick={startGame} className="py-4 px-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold tracking-widest rounded-xl transition-all">
                       ҚАЙТА ОЙНАУ
                   </button>
               </div>
           )}

           {/* Packets */}
           {isPlaying && packets.map(p => {
               const isSafe = p.type === 'safe';
               return (
                   <div 
                      key={p.id}
                      onClick={() => handlePacketInteract(p.id, true)}
                      className={`absolute w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer shadow-[0_0_15px_currentColor] transition-transform active:scale-50 ${isSafe ? 'border-[#40e56c] text-[#40e56c] bg-[#40e56c]/10' : 'border-[#f43f5e] text-[#f43f5e] bg-[#f43f5e]/10'}`}
                      style={{ 
                          left: `${p.x}%`, 
                          top: `${p.y}%`, 
                          transform: 'translate(-50%, -50%)' 
                      }}
                   >
                       <span className="text-[8px] font-bold tracking-widest">{p.label}</span>
                   </div>
               );
           })}

           {/* Server Target Area */}
           <div className="absolute bottom-0 w-full h-24 border-t-2 border-[#a5c8ff]/30 bg-gradient-to-t from-[#a5c8ff]/10 to-transparent flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#a5c8ff]/50">storage</span>
              <span className="absolute bottom-2 text-[10px] text-[#a5c8ff]/50 tracking-widest uppercase">Қорғалған Жүйе</span>
           </div>

           {/* Score display */}
           {isPlaying && (
              <div className="absolute top-4 right-4 bg-black/50 px-4 py-2 border border-white/10 rounded-lg text-white font-mono font-bold">
                  {score.toString().padStart(4, '0')}
              </div>
           )}
       </div>
    </div>
  );
};

export default FirewallGame;
