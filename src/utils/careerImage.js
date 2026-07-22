import { getTeamColor, teamTint, getLogoUrl } from "../data";
import { ovrColor, ovrTextColor } from "./helpers";

const W = 720;
const PAD = 24;
const SCALE = 2;

// ─── Image loading ─────────────────────────────────────────────────────────

function loadImg(url, timeout = 2500) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), timeout);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

function corsProxy(url, size = 128) {
  const clean = url.replace(/^https?:\/\//, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=${size}&h=${size}&fit=inside&output=png`;
}

async function toDataUrl(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function loadCrest(url) {
  if (!url) return null;
  const direct = await loadImg(url, 1500);
  if (direct) return direct;
  const viaProxy = await loadImg(corsProxy(url), 2500);
  if (viaProxy) return viaProxy;
  for (const candidate of [url, corsProxy(url)]) {
    const dataUrl = await toDataUrl(candidate);
    if (dataUrl) {
      const img = await loadImg(dataUrl, 1500);
      if (img) return img;
    }
  }
  return null;
}

function crestSvg(team, league) {
  const color = getTeamColor(team, league);
  const ini = initials(team);
  const light = "#ffffff";
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'>
    <defs>
      <linearGradient id='cg' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='${color}'/>
        <stop offset='1' stop-color='${color}' stop-opacity='.75'/>
      </linearGradient>
      <clipPath id='cs'>
        <path d='M24 2 L44 8 v16 c0 11 -8 17.5 -20 22 C12 41.5 4 35 4 24 V8 z'/>
      </clipPath>
    </defs>
    <path d='M24 2 L44 8 v16 c0 11 -8 17.5 -20 22 C12 41.5 4 35 4 24 V8 z' fill='url(#cg)'/>
    <g clip-path='url(#cs)'>
      <rect x='18' y='0' width='5' height='48' fill='${light}' opacity='.22'/>
      <rect x='27' y='0' width='5' height='48' fill='${light}' opacity='.22'/>
    </g>
    <path d='M24 2 L44 8 v16 c0 11 -8 17.5 -20 22 C12 41.5 4 35 4 24 V8 z'
      fill='none' stroke='${light}' stroke-opacity='.55' stroke-width='2'/>
    <text x='24' y='27' text-anchor='middle' font-family='Segoe UI, Arial, sans-serif'
      font-weight='900' font-size='17' fill='${light}'>${ini}</text>
  </svg>`;
}

function logoUrlFor(team) {
  const direct = getLogoUrl(team);
  if (direct) return direct;
  try {
    const cache = JSON.parse(localStorage.getItem("clubLogoCache_v1") || "{}");
    return cache[team] || null;
  } catch {
    return null;
  }
}

function initials(team) {
  return team
    .replace(/[.'']/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Trophy SVGs ───────────────────────────────────────────────────────────

const SILVER = ["#fafafa", "#c8c8cf", "#8e8e98"];
const GOLD = ["#fdeaa0", "#f0c243", "#b07d1e"];

function gradDef(colors) {
  return `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0' stop-color='${colors[0]}'/>
    <stop offset='.55' stop-color='${colors[1]}'/>
    <stop offset='1' stop-color='${colors[2]}'/>
  </linearGradient></defs>`;
}

function trophySvg(type, gold = false) {
  const open = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30'>`;
  const close = `</svg>`;
  const star = (cx) =>
    `<path d='M${cx} 6.2 l.6 1.2 1.3.2 -.95.9 .2 1.3 L${cx} 9.2 l-1.15.6 .2-1.3 -.95-.9 1.3-.2 z' fill='#6b6b74' opacity='.55'/>`;

  switch (type) {
    case "liga":
      return `${open}${gradDef(SILVER)}
        <path d='M4 6 C1 6 1 12 6 13 M20 6 C23 6 23 12 18 13' fill='none' stroke='url(#g)' stroke-width='2' stroke-linecap='round'/>
        <path d='M5 3 h14 v7 a7 7 0 0 1 -14 0 z' fill='url(#g)'/>
        ${star(9)}${star(15)}
        <rect x='10.5' y='17' width='3' height='5' fill='url(#g)'/>
        <path d='M8 22 h8 l1.5 3 h-11 z' fill='url(#g)'/>
        <rect x='6' y='25.5' width='12' height='2.5' rx='1' fill='#7c7c86'/>${close}`;
    case "copa":
      return `${open}${gradDef(SILVER)}
        <path d='M7 2 h10 l-1 9 c-.6 4 -2 6 -4 6 s-3.4 -2 -4 -6 z' fill='url(#g)'/>
        <path d='M6.5 3.5 C3.5 4 3.5 9 7.6 9.8 M17.5 3.5 C20.5 4 20.5 9 16.4 9.8' fill='none' stroke='url(#g)' stroke-width='1.8' stroke-linecap='round'/>
        <rect x='10.8' y='17' width='2.4' height='4.5' fill='url(#g)'/>
        <ellipse cx='12' cy='23' rx='4.5' ry='1.8' fill='url(#g)'/>
        <rect x='6.5' y='24.5' width='11' height='3' rx='1.2' fill='#7c7c86'/>${close}`;
    case "ballon":
      return `${open}${gradDef(GOLD)}
        <circle cx='12' cy='10' r='8.2' fill='url(#g)'/>
        <path d='M12 5.5 l2.6 1.9 -1 3.1 h-3.2 l-1 -3.1 z' fill='#8a6114' opacity='.8'/>
        <path d='M5 8.5 l2.4 2 M19 8.5 l-2.4 2 M8.2 16.6 l1.6-2.6 M15.8 16.6 l-1.6-2.6' stroke='#8a6114' stroke-width='1.1' opacity='.6' fill='none'/>
        <path d='M8.5 19.5 h7 l1 4 h-9 z' fill='url(#g)'/>
        <rect x='6' y='24' width='12' height='3.5' rx='1' fill='#5c5c66'/>${close}`;
    case "bota":
      return `${open}${gradDef(GOLD)}
        <path d='M6 4 c0 6 1 10 4 12 l8 3.5 c2 .8 3 2 3 3.5 h-16 c-1.5 0 -2.5 -1 -2.5 -2.5 v-14 z' fill='url(#g)'/>
        <path d='M7.5 9 l2.5 1.4 M8.5 12 l2.6 1.5' stroke='#8a6114' stroke-width='1.1' opacity='.65'/>
        <rect x='2' y='24.5' width='20' height='3' rx='1.2' fill='#5c5c66'/>${close}`;
    case "mundial":
      return `${open}${gradDef(GOLD)}
        <circle cx='12' cy='7.5' r='5.5' fill='url(#g)'/>
        <path d='M12 2 a5.5 5.5 0 0 0 0 11 M6.5 7.5 h11 M8 4.2 c2.4 1.4 5.6 1.4 8 0 M8 10.8 c2.4 -1.4 5.6 -1.4 8 0' stroke='#8a6114' stroke-width='.8' fill='none' opacity='.6'/>
        <path d='M8.5 12.5 C6 15 6.5 18 8 21 l1.5 2.5 h5 L16 21 c1.5 -3 2 -6 -.5 -8.5 c-1 1.6 -6 1.6 -7 0 z' fill='url(#g)'/>
        <path d='M7.5 23.5 h9 l.8 2.2 h-10.6 z' fill='#3a7d44'/>
        <rect x='5.5' y='25.7' width='13' height='2.3' rx='1' fill='#2c5e34'/>${close}`;
    case "mvp":
      return `${open}${gradDef(GOLD)}
        <path d='M7 1 l4 9 -3 1.5 -4 -8.5 z' fill='#b91c1c'/>
        <path d='M17 1 l-4 9 3 1.5 4 -8.5 z' fill='#dc2626'/>
        <circle cx='12' cy='19' r='8.5' fill='url(#g)'/>
        <circle cx='12' cy='19' r='6' fill='none' stroke='#8a6114' stroke-width='.9' opacity='.55'/>
        <path d='M12 14.5 l1.5 3 3.3.5 -2.4 2.3 .6 3.3 -3 -1.6 -3 1.6 .6 -3.3 -2.4 -2.3 3.3 -.5 z' fill='#8a6114' opacity='.75'/>${close}`;
    case "eoty":
      return `${open}${gradDef(SILVER)}
        <path d='M12 2 l9 3 v9 c0 6 -4 9.5 -9 12 c-5 -2.5 -9 -6 -9 -12 v-9 z' fill='url(#g)'/>
        <path d='M12 9 l1.7 3.5 3.8.5 -2.75 2.7 .65 3.8 -3.4 -1.8 -3.4 1.8 .65 -3.8 -2.75 -2.7 3.8 -.5 z' fill='#52525b' opacity='.7'/>${close}`;
    case "asis":
      return `${open}${gradDef(SILVER)}
        <path d='M6 4 c0 6 1 10 4 12 l8 3.5 c2 .8 3 2 3 3.5 h-16 c-1.5 0 -2.5 -1 -2.5 -2.5 v-14 z' fill='url(#g)'/>
        <text x='10.5' y='16' font-size='7' font-weight='900' fill='#5c5c66' font-family='Arial'>A</text>
        <rect x='2' y='24.5' width='20' height='3' rx='1.2' fill='#5c5c66'/>${close}`;
    case "muro":
      return `${open}<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#dfe6ee'/><stop offset='.55' stop-color='#9fb0c3'/><stop offset='1' stop-color='#5a6b7d'/></linearGradient></defs>
        <path d='M12 2 l9 3 v9 c0 6 -4 9.5 -9 12 c-5 -2.5 -9 -6 -9 -12 v-9 z' fill='url(#g)'/>
        <g stroke='#41505f' stroke-width='.7' opacity='.6'><path d='M4 9 h16 M4 14 h16 M4 19 h14'/><path d='M9 5 v4 M15 9 v5 M9 14 v5 M15 19 v3'/></g>${close}`;
    case "gk1":
      return `${open}${gradDef(GOLD)}
        <path d='M6 12 V6 c0-2.6 1-4 2.6-4 s2.6 1.4 2.6 4 l1-1.2 c.5-.6 1.4-.2 1.1.6 L12 8.5 M6 12 h9 v9 c0 2 -1 3.5 -3.2 3.5 H8 c-1.2 0 -2 -.9 -2 -2.4 z' fill='url(#g)' stroke='#8a6114' stroke-width='.5'/>
        <path d='M8 6 v4 M10.5 5.5 v4.5 M13 6 v4' stroke='#8a6114' stroke-width='.6' fill='none'/>
        <rect x='4.5' y='25' width='12' height='2.5' rx='1' fill='#5c5c66'/>${close}`;
    case "golden":
      return `${open}${gradDef(GOLD)}
        <circle cx='12' cy='11' r='9' fill='url(#g)'/>
        <path d='M12 5 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z' fill='#8a6114' opacity='.85'/>
        <path d='M8 22 h8 l1 5 h-10 z' fill='url(#g)'/>
        <rect x='6' y='26.5' width='12' height='2.5' rx='1' fill='#5c5c66'/>${close}`;
    case "continental":
      return `${open}${gradDef(gold ? GOLD : SILVER)}
        <path d='M5.5 4 C0.5 4 0.5 13 6.5 14 M18.5 4 C23.5 4 23.5 13 17.5 14' fill='none' stroke='url(#g)' stroke-width='2.4' stroke-linecap='round'/>
        <path d='M6 2 h12 l-.8 10 c-.5 5 -2.4 7 -5.2 7 s-4.7 -2 -5.2 -7 z' fill='url(#g)'/>
        <path d='M8.5 4.5 c0 4 .5 8 1.5 10' stroke='#ffffff' stroke-width='.8' opacity='.5' fill='none'/>
        <rect x='10.8' y='19' width='2.4' height='3.5' fill='url(#g)'/>
        <path d='M8 22.5 h8 l1 3 h-10 z' fill='url(#g)'/>
        <rect x='6.5' y='25.5' width='11' height='2.5' rx='1' fill='#7c7c86'/>${close}`;
    default:
      return `${open}${gradDef(SILVER)}<path d='M7 2 h10 l-1 9 c-.6 4 -2 6 -4 6 s-3.4 -2 -4 -6 z' fill='url(#g)'/>${close}`;
  }
}

function isGoldContinental(t) {
  return t.t === "continental" && !/Champions League$/.test(t.n || "");
}

function trophyKey(t) {
  return t.t === "continental" ? `continental-${isGoldContinental(t) ? "g" : "s"}` : t.t;
}

async function loadTrophyImages(trophies) {
  const imgs = {};
  const unique = new Map();
  for (const t of trophies) unique.set(trophyKey(t), t);
  await Promise.all(
    [...unique.entries()].map(async ([key, t]) => {
      const svg = trophySvg(t.t, isGoldContinental(t));
      imgs[key] = await loadImg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
    })
  );
  return imgs;
}

// ─── Design system helpers ─────────────────────────────────────────────────

/** Colores de gradiente por tier de OVR */
function ovrGradientColors(ovr) {
  if (ovr >= 96) return ["#AD1457", "#EC407A"];
  if (ovr >= 90) return ["#6A1B9A", "#AB47BC"];
  if (ovr >= 83) return ["#1565C0", "#42A5F5"];
  if (ovr >= 77) return ["#2E7D32", "#66BB6A"];
  if (ovr >= 70) return ["#92750B", "#C9A227"];
  if (ovr >= 63) return ["#6B7280", "#9CA3AF"];
  if (ovr >= 55) return ["#8B6914", "#CD7F32"];
  return ["#7B5B2A", "#A67C3D"];
}

/** Color del número OVR por tier */
function ovrTextCol(ovr) {
  if (ovr >= 96) return "#F48FB1";
  if (ovr >= 90) return "#CE93D8";
  if (ovr >= 83) return "#90CAF9";
  if (ovr >= 77) return "#A5D6A7";
  if (ovr >= 70) return "#FFE082";
  if (ovr >= 63) return "#E2E8F0";
  if (ovr >= 55) return "#FFB74D";
  return "#FFCC80";
}

/** Color de la moral */
function moraleColor(v) {
  if (v >= 75) return "#66BB6A";
  if (v >= 55) return "#84cc16";
  if (v >= 40) return "#eab308";
  if (v >= 25) return "#f97316";
  return "#EF5350";
}

/**
 * Path hexagonal que coincide con el CSS clip-path:
 * polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
 */
function hexPath(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w, y + h * 0.25);
  ctx.lineTo(x + w, y + h * 0.75);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x, y + h * 0.75);
  ctx.lineTo(x, y + h * 0.25);
  ctx.closePath();
}

/**
 * Dibuja un badge hexagonal OVR con gradiente por tier.
 * Retorna la altura real del hex (w * 1.14).
 */
function drawOvrHex(ctx, ovr, x, y, w, fontSize) {
  const h = Math.round(w * 1.14);
  const [c1, c2] = ovrGradientColors(ovr);
  const textCol = ovrTextCol(ovr);
  const inset = Math.max(2, Math.round(w * 0.07));

  // Glow exterior
  ctx.save();
  ctx.shadowColor = c2 + "aa";
  ctx.shadowBlur = w * 0.4;
  const outerGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  outerGrad.addColorStop(0, c1);
  outerGrad.addColorStop(1, c2);
  hexPath(ctx, x, y, w, h);
  ctx.fillStyle = outerGrad;
  ctx.fill();
  ctx.restore();

  // Interior oscuro
  hexPath(ctx, x + inset, y + inset, w - inset * 2, h - inset * 2);
  ctx.fillStyle = "#0F1420";
  ctx.fill();

  // Número
  const fs = fontSize || Math.round(w * 0.48);
  ctx.font = `800 ${fs}px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif`;
  ctx.fillStyle = textCol;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(ovr), x + w / 2, y + h * 0.51);
  ctx.textBaseline = "alphabetic";

  return h;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawLogo(ctx, img, x, y, size) {
  if (img) ctx.drawImage(img, x, y, size, size);
}

function drawTrophy(ctx, img, x, y, h) {
  if (img) ctx.drawImage(img, x, y, h * 0.8, h);
}

function truncate(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 2 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

function fmtValue(mv) {
  return mv >= 1 ? `€${mv}M` : `€${Math.round(mv * 1000)}K`;
}

// ─── Función principal ─────────────────────────────────────────────────────

export async function generateCareerImage({
  player,
  history,
  natData,
  posData,
  marketVal,
  legend = null,
}) {
  const rows = history;
  const allTrophies = rows.flatMap((h) => h.trophies || []);
  const grouped = [];
  for (const t of allTrophies) {
    const f = grouped.find((g) => g.n === t.n);
    if (f) f.count += 1;
    else grouped.push({ ...t, count: 1 });
  }

  const isGK = player.position === "GK";
  const tPJ = rows.reduce((s, h) => s + h.pj, 0);
  const tPJMax = rows.reduce((s, h) => s + (h.pjMax || 0), 0);
  const tA = rows.reduce((s, h) => s + (isGK ? h.gc || 0 : h.gls), 0);
  const tB = rows.reduce((s, h) => s + (isGK ? h.vi || 0 : h.ast), 0);
  const ntCaps = rows.reduce((s, h) => s + (h.nt?.caps || 0), 0);
  const ntA = rows.reduce((s, h) => s + (isGK ? h.nt?.gc || 0 : h.nt?.gls || 0), 0);
  const ntB = rows.reduce((s, h) => s + (isGK ? h.nt?.vi || 0 : h.nt?.ast || 0), 0);
  const hasNT = ntCaps > 0;

  // ── Métricas de layout ──────────────────────────────────────────────────
  const HEADER_H = 110;
  const STATS_H = hasNT ? 90 : 72;
  const TROPHY_H = grouped.length ? Math.ceil(grouped.length / 4) * 38 + 30 : 0;
  const ROW_H = 40;
  const LEGEND_H = legend ? 58 : 0;

  const H =
    PAD +
    HEADER_H + 12 +
    STATS_H + 12 +
    TROPHY_H + (TROPHY_H ? 12 : 0) +
    22 +
    rows.length * ROW_H +
    (LEGEND_H ? 12 + LEGEND_H : 0) +
    PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);

  // ── Fondo ───────────────────────────────────────────────────────────────
  ctx.fillStyle = "#080C14";
  ctx.fillRect(0, 0, W, H);

  // Subtle noise/grid overlay (diagonal lines)
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.018)";
  ctx.lineWidth = 0.5;
  for (let i = -H; i < W + H; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // ── Pre-carga de imágenes ───────────────────────────────────────────────
  const teams = [...new Set(rows.map((r) => r.team).concat(player.team))];
  const leagueOf = {};
  rows.forEach((r) => (leagueOf[r.team] = r.league));
  leagueOf[player.team] = leagueOf[player.team] || player.league;

  const logoImgs = {};
  await Promise.all(
    teams.map(async (t) => {
      const real = await loadCrest(logoUrlFor(t));
      logoImgs[t] =
        real ||
        (await loadImg(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(crestSvg(t, leagueOf[t]))}`,
          1500
        ));
    })
  );
  const flagImg = natData ? await loadImg(`https://flagcdn.com/w40/${natData.c}.png`) : null;
  const trophyImgs = await loadTrophyImages(allTrophies);

  /* ═══════════════════════════════════════════════════════════════════════
     HEADER
  ═══════════════════════════════════════════════════════════════════════ */
  let y = PAD;

  const HEX_W = 80;
  const HEX_H = Math.round(HEX_W * 1.14); // 91
  const hexY = y + Math.round((HEADER_H - HEX_H) / 2);

  // OVR hex grande
  drawOvrHex(ctx, player.overall, PAD, hexY, HEX_W, Math.round(HEX_W * 0.5));

  // ── Tarjeta de identidad ──────────────────────────────────────────────
  const cX = PAD + HEX_W + 10;
  const cY = y;
  const cW = W - PAD - cX;
  const cH = HEADER_H;
  const teamColor = getTeamColor(player.team, player.league);
  const tintBg = teamTint(player.team, player.league, 0.12);
  const tintBorder = teamTint(player.team, player.league, 0.28);

  // Fondo con gradiente
  const cardGrad = ctx.createLinearGradient(cX, cY, cX + cW, cY);
  cardGrad.addColorStop(0, tintBg);
  cardGrad.addColorStop(0.75, "#0d1525");
  roundRect(ctx, cX, cY, cW, cH, 10);
  ctx.fillStyle = cardGrad;
  ctx.fill();
  ctx.strokeStyle = tintBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Overlay radial (top-right)
  const radGrad = ctx.createRadialGradient(cX + cW, cY, 0, cX + cW, cY, 180);
  radGrad.addColorStop(0, tintBg.replace ? tintBg : "rgba(255,255,255,.04)");
  radGrad.addColorStop(1, "rgba(0,0,0,0)");
  roundRect(ctx, cX, cY, cW, cH, 10);
  ctx.fillStyle = radGrad;
  ctx.fill();

  // Borde izquierdo de acento (team color)
  ctx.fillStyle = teamColor;
  ctx.fillRect(cX, cY + 10, 3, cH - 20);

  // ── Chips: nacionalidad + posición ──────────────────────────────────
  let chipX = cX + 15;
  const chipY = cY + 22;
  ctx.textBaseline = "middle";

  if (natData) {
    const code3 = natData.n.substring(0, 3).toUpperCase();
    ctx.font = "600 10px 'Outfit', 'Segoe UI', sans-serif";
    const txtW = ctx.measureText(code3).width;
    const chipW = 8 + 18 + 5 + txtW + 8;
    roundRect(ctx, chipX, chipY - 10, chipW, 20, 10);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    if (flagImg) ctx.drawImage(flagImg, chipX + 8, chipY - 6, 18, 12);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.textAlign = "left";
    ctx.fillText(code3, chipX + 8 + 18 + 5, chipY);
    chipX += chipW + 8;
  }

  const posTxt = `#${player.number} ${posData?.s || ""}`;
  ctx.font = "700 10px 'Outfit', 'Segoe UI', sans-serif";
  const posChipW = 12 + ctx.measureText(posTxt).width + 12;
  roundRect(ctx, chipX, chipY - 10, posChipW, 20, 10);
  ctx.fillStyle = teamColor + "30";
  ctx.fill();
  ctx.strokeStyle = teamColor + "60";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = teamColor;
  ctx.textAlign = "left";
  ctx.fillText(posTxt, chipX + 12, chipY);

  // ── Logo + nombre del club ───────────────────────────────────────────
  const nameY = cY + 56;
  drawLogo(ctx, logoImgs[player.team], cX + 15, nameY - 11, 20);
  ctx.font = "800 18px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(truncate(ctx, player.team, cW - 190), cX + 43, nameY);

  // ── Barras REP / MOR ─────────────────────────────────────────────────
  const barLX = cX + 15;
  const barW = Math.min(148, cW - 190);
  const rep = player.reputation ?? 20;
  const mor = player.morale ?? 70;

  const drawStatBar = (bY, label, val, fillColor) => {
    ctx.font = "700 8px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, barLX, bY);
    const bx = barLX + 30;
    roundRect(ctx, bx, bY - 1.5, barW, 3, 1.5);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.fill();
    if (val > 0) {
      roundRect(ctx, bx, bY - 1.5, (barW * val) / 100, 3, 1.5);
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.textBaseline = "alphabetic";
  };

  drawStatBar(cY + 78, "REP", rep, "#42A5F5");
  drawStatBar(cY + 93, "MOR", mor, moraleColor(mor));

  // ── Edad / Valor (columna derecha de la tarjeta) ─────────────────────
  const rX = cX + cW - 14;
  ctx.textBaseline = "middle";

  ctx.font = "700 8px 'Outfit', 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.textAlign = "right";
  ctx.fillText("EDAD", rX, cY + 14);

  ctx.font = "800 26px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(player.age), rX, cY + 36);

  ctx.font = "700 8px 'Outfit', 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.35)";
  ctx.fillText("VALOR", rX, cY + 62);

  ctx.font = "700 17px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  ctx.fillStyle = "#66BB6A";
  ctx.fillText(fmtValue(marketVal), rX, cY + 82);

  ctx.textBaseline = "alphabetic";

  /* ═══════════════════════════════════════════════════════════════════════
     TOTAL DE CARRERA
  ═══════════════════════════════════════════════════════════════════════ */
  y = PAD + HEADER_H + 12;

  roundRect(ctx, PAD, y, W - PAD * 2, STATS_H, 10);
  ctx.fillStyle = "#0d1525";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.06)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Etiqueta
  ctx.font = "700 9px 'Outfit', 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.22)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("TOTAL DE CARRERA", PAD + 14, y + 13);
  ctx.textBaseline = "alphabetic";

  // Divisores verticales
  ctx.strokeStyle = "rgba(255,255,255,.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const dx = PAD + ((W - PAD * 2) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(dx, y + 20);
    ctx.lineTo(dx, y + STATS_H - 8);
    ctx.stroke();
  }

  const statCols = [
    {
      label: "PJ",
      val: tPJMax ? `${tPJ + ntCaps}/${tPJMax + ntCaps}` : String(tPJ + ntCaps),
      club: tPJ,
      nat: ntCaps,
    },
    { label: isGK ? "GC" : "GLS", val: String(tA + ntA), club: tA, nat: ntA },
    { label: isGK ? "VI" : "AST", val: String(tB + ntB), club: tB, nat: ntB },
  ];

  statCols.forEach(({ label, val, club, nat }, i) => {
    const cx = PAD + ((W - PAD * 2) * (i + 0.5)) / 3;

    // Label
    ctx.font = "700 9px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, y + 26);

    // Número grande
    ctx.font = "800 26px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(val, cx, y + 52);

    // Desglose club / selección
    if (hasNT) {
      ctx.font = "600 10px 'Outfit', 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,.38)";
      ctx.fillText(`clubes ${club}`, cx - 26, y + 73);
      ctx.fillStyle = "#7dd3fc";
      ctx.fillText(`sel. ${nat}`, cx + 26, y + 73);
    }

    ctx.textBaseline = "alphabetic";
  });

  /* ═══════════════════════════════════════════════════════════════════════
     VITRINA
  ═══════════════════════════════════════════════════════════════════════ */
  y += STATS_H + 12;

  if (grouped.length) {
    // Etiqueta
    ctx.font = "700 9px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`VITRINA · ${grouped.length} TROFEO${grouped.length !== 1 ? "S" : ""}`, PAD, y + 10);
    ctx.textBaseline = "alphabetic";

    let tx = PAD;
    let ty = y + 22;

    ctx.font = "600 11px 'Outfit', 'Segoe UI', sans-serif";

    for (const g of grouped) {
      const label = `${g.n}${g.count > 1 ? ` ×${g.count}` : ""}`;
      const wChip = 36 + ctx.measureText(label).width;

      if (tx + wChip > W - PAD) {
        tx = PAD;
        ty += 38;
      }

      // Chip bg
      roundRect(ctx, tx, ty, wChip, 30, 15);
      ctx.fillStyle = "#0d1525";
      ctx.fill();
      ctx.strokeStyle = "rgba(201,162,39,.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Icono trofeo
      drawTrophy(ctx, trophyImgs[trophyKey(g)], tx + 8, ty + 3, 24);

      // Texto
      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, tx + 33, ty + 15);
      ctx.textBaseline = "alphabetic";

      tx += wChip + 8;
    }

    y = ty + 30 + 12;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     TIMELINE — Encabezado de columnas
  ═══════════════════════════════════════════════════════════════════════ */

  // Posiciones de columnas (right-edge)
  const OVR_HEX_W = 28;
  const OVR_HEX_H = Math.round(OVR_HEX_W * 1.14); // 32
  const OVR_L = 448;        // left edge del hex OVR en filas
  const PJ_R = 566;
  const GLS_R = 630;
  const AST_R = W - PAD;    // 696

  ctx.font = "600 9px 'Outfit', 'Segoe UI', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.2)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EDAD", PAD + 2, y + 10);
  ctx.fillText("CLUB", PAD + 62, y + 10);
  ctx.textAlign = "right";
  ctx.fillText("OVR", OVR_L + OVR_HEX_W, y + 10);
  ctx.fillText("PJ", PJ_R, y + 10);
  ctx.fillText(isGK ? "GC" : "GLS", GLS_R, y + 10);
  ctx.fillText(isGK ? "VI" : "AST", AST_R, y + 10);
  ctx.textBaseline = "alphabetic";

  y += 20;

  /* ═══════════════════════════════════════════════════════════════════════
     TIMELINE — Filas
  ═══════════════════════════════════════════════════════════════════════ */

  for (const row of rows) {
    const tColor = getTeamColor(row.team, row.league);
    const rTint = teamTint(row.team, row.league, 0.15);
    const rBorder = teamTint(row.team, row.league, 0.25);
    const cy = y + ROW_H / 2 - 1;

    // Fondo con gradiente horizontal
    const rg = ctx.createLinearGradient(PAD, y, W - PAD, y);
    rg.addColorStop(0, rTint);
    rg.addColorStop(0.8, "#0d152588");
    roundRect(ctx, PAD + 3, y + 1, W - PAD * 2 - 3, ROW_H - 3, 8);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.strokeStyle = rBorder;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Borde izquierdo 3px (team color)
    roundRect(ctx, PAD, y + 1, 3, ROW_H - 3, [2, 0, 0, 2]);
    ctx.fillStyle = tColor;
    ctx.fill();

    // Edad (Barlow Condensed, sin badge)
    ctx.font = "700 15px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.45)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(row.age), PAD + 22, cy);

    // Logo del club
    drawLogo(ctx, logoImgs[row.team], PAD + 40, cy - 9, 18);

    // Nombre del club
    ctx.font = "500 13px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.textAlign = "left";
    const maxNameW = OVR_L - (PAD + 66) - 8;
    const nameStr = truncate(ctx, row.team, maxNameW);
    ctx.fillText(nameStr, PAD + 66, cy);

    // Trofeos inline (tras el nombre)
    const nameW = ctx.measureText(nameStr).width;
    let cupX = PAD + 66 + nameW + 5;
    for (const t of row.trophies || []) {
      if (cupX + 13 < OVR_L - 4) {
        drawTrophy(ctx, trophyImgs[trophyKey(t)], cupX, cy - 8, 16);
        cupX += 13;
      }
    }

    // OVR hex pequeño
    drawOvrHex(ctx, row.ovr, OVR_L, cy - OVR_HEX_H / 2, OVR_HEX_W, 12);

    // Stats
    ctx.font = "700 12px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "#d4d4d8";
    ctx.textAlign = "right";
    ctx.fillText(row.pjMax ? `${row.pj}/${row.pjMax}` : String(row.pj), PJ_R, cy);
    ctx.fillText(String(isGK ? row.gc : row.gls), GLS_R, cy);
    ctx.fillText(String(isGK ? row.vi : row.ast), AST_R, cy);

    ctx.textBaseline = "alphabetic";
    y += ROW_H;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PUNTAJE DE LEYENDA
  ═══════════════════════════════════════════════════════════════════════ */
  if (legend) {
    y += 12;
    roundRect(ctx, PAD, y, W - PAD * 2, LEGEND_H - 2, 12);
    ctx.fillStyle = "#0d1525";
    ctx.fill();
    ctx.strokeStyle = (legend.color || "#C9A227") + "55";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    ctx.font = "700 9px 'Outfit', 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.3)";
    ctx.fillText("PUNTAJE DE LEYENDA", PAD + 16, y + 15);

    ctx.font = "900 18px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = legend.color || "#C9A227";
    ctx.fillText(legend.title, PAD + 16, y + 36);

    // Barra de progreso
    const bX = PAD + 200;
    const bW = W - PAD * 2 - 200 - 88;
    roundRect(ctx, bX, y + 28, bW, 6, 3);
    ctx.fillStyle = "#1e2840";
    ctx.fill();

    const fillPct = Math.max(0, Math.min(1, (legend.score || 0) / 100));
    if (fillPct > 0) {
      const barGrad = ctx.createLinearGradient(bX, 0, bX + bW * fillPct, 0);
      barGrad.addColorStop(0, (legend.color || "#92750B"));
      barGrad.addColorStop(1, (legend.color || "#C9A227"));
      roundRect(ctx, bX, y + 28, bW * fillPct, 6, 3);
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    // Score
    ctx.textAlign = "right";
    ctx.font = "900 28px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = legend.color || "#C9A227";
    ctx.fillText(String(legend.score), W - PAD - 36, y + 30);

    ctx.font = "700 13px 'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.fillText("/100", W - PAD - 12, y + 33);

    ctx.textBaseline = "alphabetic";
  }

  return canvas;
}
