import React from 'react';

interface HeaderProps {
  readonly title?: string;
  readonly showSentinel?: boolean;
  readonly onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showSentinel = true, onOpenMenu }) => {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#121416]/70 backdrop-blur-2xl border-b border-white/5 shadow-lg shadow-black/20 transition-all duration-300">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button onClick={onOpenMenu} className="mr-2 text-[#a5c8ff] hover:text-white transition-colors active:scale-90">
            <span className="material-symbols-outlined text-2xl">menu_open</span>
          </button>
        )}
        <span className="material-symbols-outlined icon-filled text-[#a5c8ff]">shield_with_heart</span>
        <h1 className="font-['Space_Grotesk'] font-black tracking-[0.2em] text-[#a5c8ff] text-xl">
          {showSentinel ? 'SENTINEL' : title}
        </h1>
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#a5c8ff]/20 bg-[#333537]">
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiJ4CY2rs9rAqo1DCkVfFV1xD1efRhfLOHaWFHbRgoo5ZkPqkPVAYcewFDZbNHZqMbh3veVsFs75r5zh7TcM69hCygXTKLSfXj5pu1NfYgOg3wSXPl94HaD-X2Aus_S5-dYjeFguNXA-sCUx1Ir8I11O7AmSM7GT6cqMppOCu_3_2EsbatIeJNSXgc-dpM5sEuj-zgwtVNvU2yMtFF1uM8CZ2VCDVvRuS6PbeeqpV9T5d9Yh6CgSzxyX3agi2pmhJ3hXpQPJYEW3I"
          alt="User"
        />
      </div>
    </header>
  );
};

export default Header;
