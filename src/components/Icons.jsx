/** Íconos pequeños para estadísticas (sin emojis) */

export function IconMatches({ size = 12 }) {
  // mini cancha
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="inline-block shrink-0">
      <rect x="1" y="2" width="12" height="10" rx="1.5" fill="#15803d" />
      <rect x="1" y="2" width="12" height="10" rx="1.5" fill="none" stroke="#4ade80" strokeWidth=".8" />
      <line x1="7" y1="2" x2="7" y2="12" stroke="#4ade80" strokeWidth=".8" />
      <circle cx="7" cy="7" r="1.8" fill="none" stroke="#4ade80" strokeWidth=".8" />
    </svg>
  );
}

export function IconBall({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="inline-block shrink-0">
      <circle cx="7" cy="7" r="5.8" fill="#e5e5e5" />
      <path d="M7 4.2 l2 1.45 -.76 2.35 h-2.48 L5 5.65 z" fill="#27272a" />
      <path
        d="M7 1.2 v3 M2.2 5 l2.8 .65 M11.8 5 L9 5.65 M4 12 l1.76-2 M10 12 L8.24 10"
        stroke="#27272a"
        strokeWidth=".7"
        fill="none"
      />
    </svg>
  );
}

export function IconAssist({ size = 12 }) {
  // botín
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="inline-block shrink-0">
      <path
        d="M3 2.5 c0 3 .6 5 2.2 6.2 l4.8 2 c1 .4 1.6 1 1.6 1.8 H3.4 c-.9 0 -1.4 -.5 -1.4 -1.4 V4 z"
        fill="#d4d4d8"
      />
      <path d="M4 5 l1.4.8 M4.6 6.8 l1.5.9" stroke="#52525b" strokeWidth=".7" />
    </svg>
  );
}

export function IconGoalConceded({ size = 12 }) {
  // arco / red
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="inline-block shrink-0">
      <path d="M2 12 V3 h10 v9" fill="none" stroke="#d4d4d8" strokeWidth="1.1" />
      <path
        d="M4.5 3 v9 M7 3 v9 M9.5 3 v9 M2 5.5 h10 M2 8 h10 M2 10.5 h10"
        stroke="#71717a"
        strokeWidth=".5"
      />
    </svg>
  );
}

export function IconCleanSheet({ size = 12 }) {
  // guante
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" className="inline-block shrink-0">
      <path
        d="M4 12.5 V6 c0-3 1-4.5 3-4.5 s3 1.5 3 4.5 l1.2-1.4 c.5-.6 1.3-.2 1 .6 L10.8 8.5 V12.5 z"
        fill="#d4d4d8"
      />
      <path d="M5.6 3.5 v3 M7.3 3 v3.5 M9 3.5 v3" stroke="#52525b" strokeWidth=".6" fill="none" />
    </svg>
  );
}
