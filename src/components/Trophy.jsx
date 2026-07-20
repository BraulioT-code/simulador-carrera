import { TROPHY_NAMES } from "../data";

/**
 * Trofeos dibujados en SVG (sin emojis).
 * Tipos: liga, copa, ballon, bota, mundial
 */

const SILVER = ["#fafafa", "#c8c8cf", "#8e8e98"];
const GOLD = ["#fdeaa0", "#f0c243", "#b07d1e"];

function Defs({ id, colors }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={colors[0]} />
        <stop offset=".55" stopColor={colors[1]} />
        <stop offset="1" stopColor={colors[2]} />
      </linearGradient>
    </defs>
  );
}

function LigaSvg({ size }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-silver" colors={SILVER} />
      {/* asas */}
      <path
        d="M4 6 C1 6 1 12 6 13 M20 6 C23 6 23 12 18 13"
        fill="none"
        stroke="url(#tg-silver)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* copa */}
      <path d="M5 3 h14 v7 a7 7 0 0 1 -14 0 z" fill="url(#tg-silver)" />
      {/* estrellas */}
      <path d="M9 6.2 l.6 1.2 1.3.2-.95.9.2 1.3L9 9.2l-1.15.6.2-1.3-.95-.9 1.3-.2z" fill="#6b6b74" opacity=".55" />
      <path d="M15 6.2 l.6 1.2 1.3.2-.95.9.2 1.3L15 9.2l-1.15.6.2-1.3-.95-.9 1.3-.2z" fill="#6b6b74" opacity=".55" />
      {/* tallo y base */}
      <rect x="10.5" y="17" width="3" height="5" fill="url(#tg-silver)" />
      <path d="M8 22 h8 l1.5 3 h-11 z" fill="url(#tg-silver)" />
      <rect x="6" y="25.5" width="12" height="2.5" rx="1" fill="#7c7c86" />
    </svg>
  );
}

function CopaSvg({ size }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-silver2" colors={SILVER} />
      {/* copa alta y estilizada */}
      <path d="M7 2 h10 l-1 9 c-.6 4 -2 6 -4 6 s-3.4 -2 -4 -6 z" fill="url(#tg-silver2)" />
      <path
        d="M6.5 3.5 C3.5 4 3.5 9 7.6 9.8 M17.5 3.5 C20.5 4 20.5 9 16.4 9.8"
        fill="none"
        stroke="url(#tg-silver2)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="10.8" y="17" width="2.4" height="4.5" fill="url(#tg-silver2)" />
      <ellipse cx="12" cy="23" rx="4.5" ry="1.8" fill="url(#tg-silver2)" />
      <rect x="6.5" y="24.5" width="11" height="3" rx="1.2" fill="#7c7c86" />
    </svg>
  );
}

function BallonSvg({ size }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-gold" colors={GOLD} />
      {/* balón dorado */}
      <circle cx="12" cy="10" r="8.2" fill="url(#tg-gold)" />
      <path
        d="M12 5.5 l2.6 1.9 -1 3.1 h-3.2 l-1 -3.1 z"
        fill="#8a6114"
        opacity=".8"
      />
      <path
        d="M5 8.5 l2.4 2 M19 8.5 l-2.4 2 M8.2 16.6 l1.6-2.6 M15.8 16.6 l-1.6-2.6"
        stroke="#8a6114"
        strokeWidth="1.1"
        opacity=".6"
        fill="none"
      />
      {/* pedestal */}
      <path d="M8.5 19.5 h7 l1 4 h-9 z" fill="url(#tg-gold)" />
      <rect x="6" y="24" width="12" height="3.5" rx="1" fill="#5c5c66" />
    </svg>
  );
}

function BotaSvg({ size }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-gold2" colors={GOLD} />
      {/* botín dorado */}
      <path
        d="M6 4 c0 6 1 10 4 12 l8 3.5 c2 .8 3 2 3 3.5 h-16 c-1.5 0 -2.5 -1 -2.5 -2.5 v-14 z"
        fill="url(#tg-gold2)"
      />
      <path d="M7.5 9 l2.5 1.4 M8.5 12 l2.6 1.5" stroke="#8a6114" strokeWidth="1.1" opacity=".65" />
      {/* base */}
      <rect x="2" y="24.5" width="20" height="3" rx="1.2" fill="#5c5c66" />
    </svg>
  );
}

function MundialSvg({ size }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-gold3" colors={GOLD} />
      {/* globo */}
      <circle cx="12" cy="7.5" r="5.5" fill="url(#tg-gold3)" />
      <path
        d="M12 2 a5.5 5.5 0 0 0 0 11 M6.5 7.5 h11 M8 4.2 c2.4 1.4 5.6 1.4 8 0 M8 10.8 c2.4 -1.4 5.6 -1.4 8 0"
        stroke="#8a6114"
        strokeWidth=".8"
        fill="none"
        opacity=".6"
      />
      {/* cuerpo: figuras que sostienen */}
      <path
        d="M8.5 12.5 C6 15 6.5 18 8 21 l1.5 2.5 h5 L16 21 c1.5 -3 2 -6 -.5 -8.5 c-1 1.6 -6 1.6 -7 0 z"
        fill="url(#tg-gold3)"
      />
      {/* base verde característica */}
      <path d="M7.5 23.5 h9 l.8 2.2 h-10.6 z" fill="#3a7d44" />
      <rect x="5.5" y="25.7" width="13" height="2.3" rx="1" fill="#2c5e34" />
    </svg>
  );
}

function ContinentalSvg({ size, gold = false }) {
  // Copa "orejona" estilo continental
  const grad = gold ? "tg-gold4" : "tg-silver3";
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id={grad} colors={gold ? GOLD : SILVER} />
      {/* orejas grandes */}
      <path
        d="M5.5 4 C0.5 4 0.5 13 6.5 14 M18.5 4 C23.5 4 23.5 13 17.5 14"
        fill="none"
        stroke={`url(#${grad})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* cuerpo ancho */}
      <path d="M6 2 h12 l-.8 10 c-.5 5 -2.4 7 -5.2 7 s-4.7 -2 -5.2 -7 z" fill={`url(#${grad})`} />
      <path d="M8.5 4.5 c0 4 .5 8 1.5 10" stroke="#ffffff" strokeWidth=".8" opacity=".5" fill="none" />
      <rect x="10.8" y="19" width="2.4" height="3.5" fill={`url(#${grad})`} />
      <path d="M8 22.5 h8 l1 3 h-10 z" fill={`url(#${grad})`} />
      <rect x="6.5" y="25.5" width="11" height="2.5" rx="1" fill="#7c7c86" />
    </svg>
  );
}

function MvpSvg({ size }) {
  // Medalla con cinta
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-gold5" colors={GOLD} />
      <path d="M7 1 l4 9 -3 1.5 -4 -8.5 z" fill="#b91c1c" />
      <path d="M17 1 l-4 9 3 1.5 4 -8.5 z" fill="#dc2626" />
      <circle cx="12" cy="19" r="8.5" fill="url(#tg-gold5)" />
      <circle cx="12" cy="19" r="6" fill="none" stroke="#8a6114" strokeWidth=".9" opacity=".55" />
      <path
        d="M12 14.5 l1.5 3 3.3.5 -2.4 2.3 .6 3.3 -3 -1.6 -3 1.6 .6 -3.3 -2.4 -2.3 3.3 -.5 z"
        fill="#8a6114"
        opacity=".75"
      />
    </svg>
  );
}

function EotySvg({ size }) {
  // Escudo con estrella
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
      <Defs id="tg-silver4" colors={SILVER} />
      <path d="M12 2 l9 3 v9 c0 6 -4 9.5 -9 12 c-5 -2.5 -9 -6 -9 -12 v-9 z" fill="url(#tg-silver4)" />
      <path
        d="M12 9 l1.7 3.5 3.8.5 -2.75 2.7 .65 3.8 -3.4 -1.8 -3.4 1.8 .65 -3.8 -2.75 -2.7 3.8 -.5 z"
        fill="#52525b"
        opacity=".7"
      />
    </svg>
  );
}

const TROPHY_SVGS = {
  liga: LigaSvg,
  copa: CopaSvg,
  ballon: BallonSvg,
  bota: BotaSvg,
  mundial: MundialSvg,
  continental: ContinentalSvg,
  mvp: MvpSvg,
  eoty: EotySvg,
};

/**
 * Acepta trofeos como objeto { t, n } o como props sueltas (type, name).
 * El nombre específico (ej: "Liga BetPlay", "Champions League") sale en el tooltip.
 */
export default function Trophy({ type, name, size = 16 }) {
  const Svg = TROPHY_SVGS[type];
  if (!Svg) return null;
  const label = name || TROPHY_NAMES[type] || "";
  const gold = type === "continental" && !/Champions League$/.test(label);
  return (
    <span title={label} className="inline-flex shrink-0 cursor-default items-end">
      <Svg size={size} gold={gold} />
    </span>
  );
}
