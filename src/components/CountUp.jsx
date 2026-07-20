import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Número animado.
 * - `from`: valor inicial (0 por defecto).
 * - `fromPrevious`: anima desde el valor anterior en vez de desde `from`,
 *   sirviendo para mostrar aumentos y descensos (ej: OVR 72 → 75).
 */
export default function CountUp({
  value,
  from = 0,
  fromPrevious = false,
  duration = 900,
  delay = 0,
  decimals = 0,
  className = "",
  onDone,
}) {
  const target = Number(value) || 0;
  const round = (n) =>
    decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n);
  const prevRef = useRef(fromPrevious ? target : from);
  const start = fromPrevious ? prevRef.current : from;

  const [display, setDisplay] = useState(prefersReducedMotion() ? target : start);
  const rafRef = useRef(null);

  useEffect(() => {
    const origin = fromPrevious ? prevRef.current : from;
    prevRef.current = target;

    if (prefersReducedMotion() || origin === target) {
      setDisplay(target);
      onDone?.();
      return undefined;
    }

    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / duration);
      setDisplay(round(origin + (target - origin) * easeOutCubic(p)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else onDone?.();
    };

    setDisplay(origin);
    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, from, duration, delay, fromPrevious]);

  return (
    <span className={className}>
      {decimals > 0 ? Number(display).toFixed(decimals) : display}
    </span>
  );
}

/**
 * Tiempos de la secuencia al simular una temporada.
 * OVR → Valor → OVR de la lista → PJ → GLS → AST → (300ms) celebración.
 */
export const SEQ = {
  ovrMain: 0,
  value: 300,
  ovrRow: 600,
  pj: 900,
  gls: 1200,
  ast: 1500,
  // AST termina ~1500 + 650 = 2150; el trofeo entra 300ms después
  celebration: 2450,
};

/** Flecha con la diferencia respecto al valor anterior (+3 / -2) */
export function DeltaBadge({ delta, className = "" }) {
  if (!delta) return null;
  const up = delta > 0;
  return (
    <span
      className={`delta-pop inline-flex items-center gap-0.5 rounded px-1 py-[1px] text-[9px] font-black ${
        up ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
      } ${className}`}
    >
      <svg width="8" height="8" viewBox="0 0 10 10">
        <path
          d={up ? "M5 1.5 L8.5 6 H1.5 Z" : "M5 8.5 L1.5 4 H8.5 Z"}
          fill="currentColor"
        />
      </svg>
      {up ? `+${delta}` : delta}
    </span>
  );
}
