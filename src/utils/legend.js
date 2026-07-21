import { clamp } from "./helpers";

/**
 * Puntaje de leyenda 0-100 al terminar la carrera.
 * Combina trofeos (con peso por importancia), producción, longevidad,
 * OVR pico y partidos con la selección.
 */
const TROPHY_POINTS = {
  liga: 4,
  copa: 2.5,
  continental: 8,
  mundial: 18,
  ballon: 14,
  bota: 7,
  asis: 6,
  muro: 6,
  gk1: 6,
  golden: 5,
  mvp: 5,
  eoty: 3,
};

export function legendScore({ player, history }) {
  const trophies = history.flatMap((h) => h.trophies || []);
  const isGK = player.position === "GK";

  // Trofeos (máx 42)
  const trophyPts = clamp(
    trophies.reduce((s, t) => s + (TROPHY_POINTS[t.t] ?? 2), 0),
    0,
    42
  );

  // OVR pico (máx 24): 60 → 0, 99 → 24
  const peak = Math.max(player.overall, ...history.map((h) => h.ovr));
  const peakPts = clamp(((peak - 60) / 39) * 24, 0, 24);

  // Producción (máx 16)
  const pj = history.reduce((s, h) => s + h.pj, 0);
  let prodPts;
  if (isGK) {
    const vi = history.reduce((s, h) => s + (h.vi || 0), 0);
    prodPts = clamp((vi / Math.max(1, pj)) * 45, 0, 16);
  } else {
    const gls = history.reduce((s, h) => s + h.gls, 0);
    const ast = history.reduce((s, h) => s + h.ast, 0);
    prodPts = clamp(((gls + 0.6 * ast) / Math.max(1, pj)) * 40, 0, 16);
  }

  // Longevidad (máx 10): 900 partidos = tope
  const longPts = clamp((pj / 900) * 10, 0, 10);

  // Selección (máx 6): los caps ayudan, pero no definen una leyenda por sí solos
  const capsPts = clamp(((player.intCaps || 0) / 70) * 6, 0, 6);

  const total = Math.round(trophyPts + peakPts + prodPts + longPts + capsPts);
  return clamp(total, 0, 100);
}

export function legendTitle(score) {
  if (score >= 88) return "Leyenda mundial";
  if (score >= 75) return "Ídolo global";
  if (score >= 62) return "Estrella consagrada";
  if (score >= 48) return "Gran profesional";
  if (score >= 34) return "Sólido de primera";
  if (score >= 20) return "Ídolo de barrio";
  return "Carrera humilde";
}

export function legendColor(score) {
  if (score >= 88) return "#c026d3";
  if (score >= 75) return "#eab308";
  if (score >= 62) return "#22c55e";
  if (score >= 48) return "#38bdf8";
  if (score >= 34) return "#94a3b8";
  return "#a16207";
}
