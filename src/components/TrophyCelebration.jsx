import { useEffect, useRef } from "react";
import Trophy from "./Trophy";

/**
 * Overlay de celebración: trofeo en grande + fuegos artificiales durante 2s.
 */
export default function TrophyCelebration({ trophy, onDone, duration = 2000 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trophy) return undefined;
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [trophy, onDone, duration]);

  useEffect(() => {
    if (!trophy) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const COLORS = ["#fbbf24", "#f97316", "#22c55e", "#38bdf8", "#e879f9", "#ffffff", "#ef4444"];
    const particles = [];

    const burst = (x, y) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const count = 34 + Math.floor(Math.random() * 18);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 1.6 + Math.random() * 3.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.014,
          color: Math.random() < 0.2 ? "#ffffff" : color,
          size: 1.6 + Math.random() * 2.2,
        });
      }
    };

    // Ráfaga inicial y luego cohetes periódicos
    burst(W() * 0.5, H() * 0.32);
    const launch = setInterval(() => {
      burst(W() * (0.15 + Math.random() * 0.7), H() * (0.15 + Math.random() * 0.45));
    }, 260);

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045; // gravedad
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      clearInterval(launch);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [trophy]);

  if (!trophy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onDone}
      role="presentation"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="celebrate-pop relative flex flex-col items-center px-6 text-center">
        <div className="drop-shadow-[0_0_40px_rgba(251,191,36,0.55)]">
          <Trophy type={trophy.t} name={trophy.n} size={120} />
        </div>
        <div className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-amber-400">
          ¡Campeón!
        </div>
        <div className="mt-1.5 max-w-[90vw] text-2xl font-black leading-tight text-white sm:text-3xl">
          {trophy.n}
        </div>
      </div>
    </div>
  );
}
