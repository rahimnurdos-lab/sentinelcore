import React, { useEffect, useRef } from 'react';

export const ThreatRadar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth * 2); // Retinal scaling
    let h = (canvas.height = canvas.offsetHeight * 2);
    ctx.scale(2, 2);

    let angle = 0;
    const dots: { x: number; y: number; life: number; maxLife: number }[] = [];

    // Generate random threats
    for (let i = 0; i < 15; i++) {
        dots.push({
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            life: Math.random() * 100,
            maxLife: 100 + Math.random() * 50
        });
    }

    const cx = w / 4;
    const cy = h / 4;
    const radius = Math.min(cx, cy) - 10;

    let animationFrameId: number;

    const draw = () => {
      // Clear with dark trail effect
      ctx.fillStyle = 'rgba(18, 20, 22, 0.15)'; // match background #121416
      ctx.fillRect(0, 0, w / 2, h / 2);

      // Draw grid rings
      ctx.strokeStyle = 'rgba(165, 200, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 4) * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Sweeping radar arm
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      const grad = ctx.createLinearGradient(0, 0, radius, 0);
      grad.addColorStop(0, 'rgba(64, 229, 108, 0.8)'); // Green core
      grad.addColorStop(1, 'rgba(64, 229, 108, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.arc(0, 0, radius, 0, 0.3);
      ctx.lineTo(0,0);
      ctx.fillStyle = grad;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.strokeStyle = '#69ff87';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw threat dots (they light up when the arm passes them)
      dots.forEach(dot => {
         // Calculate angle of dot from center
         let dotAngle = Math.atan2(dot.y, dot.x);
         if (dotAngle < 0) dotAngle += Math.PI * 2;
         
         let currentAngle = angle % (Math.PI * 2);
         if (currentAngle < 0) currentAngle += Math.PI * 2;

         let diff = Math.abs(currentAngle - dotAngle);
         
         // If radar just passed
         if (diff < 0.2 || (Math.PI*2 - diff) < 0.2) {
             dot.life = dot.maxLife; // Reset life
         }

         if (dot.life > 0) {
             ctx.beginPath();
             ctx.arc(cx + dot.x, cy + dot.y, 4, 0, Math.PI * 2);
             
             // Red for some, blue for others based on x
             const color = dot.x > 0 ? '#ffb4ab' : '#a5c8ff';
             ctx.fillStyle = color;
             ctx.globalAlpha = Math.max(0, dot.life / dot.maxLife);
             ctx.fill();
             
             // Outer glow
             ctx.beginPath();
             ctx.arc(cx + dot.x, cy + dot.y, 10 - (dot.life/dot.maxLife)*5, 0, Math.PI * 2);
             ctx.strokeStyle = color;
             ctx.stroke();
             
             ctx.globalAlpha = 1.0;
             dot.life -= 1;
         }
      });

      angle += 0.05;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square rounded-full flex items-center justify-center overflow-hidden border border-[#a5c8ff]/10 shadow-[0_0_50px_rgba(64,229,108,0.1)] mb-8 mt-4 bg-[#0c0e10]/60 backdrop-blur-xl">
        <canvas ref={canvasRef} className="w-full h-full" style={{ mixBlendMode: 'screen' }} />
        
        {/* Overlay targeting crosshair UI */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            <div className="flex justify-between w-full">
                <span className="text-[#69ff87] text-[9px] font-mono tracking-widest border border-[#69ff87]/30 px-2 py-0.5 rounded">LAT: 51.169</span>
                <span className="text-[#a5c8ff] text-[9px] font-mono tracking-widest border border-[#a5c8ff]/30 px-2 py-0.5 rounded">NET: SECURE</span>
            </div>
            <div className="flex justify-between w-full">
                <span className="text-[#a5c8ff] text-[9px] font-mono tracking-widest border border-[#a5c8ff]/30 px-2 py-0.5 rounded">SCAN: IN-PROG</span>
                <span className="text-[#69ff87] text-[9px] font-mono tracking-widest border border-[#69ff87]/30 px-2 py-0.5 rounded">LNG: 71.449</span>
            </div>
        </div>
    </div>
  );
};

export default ThreatRadar;
