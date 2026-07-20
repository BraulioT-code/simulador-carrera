import { getTeamColor, teamTint, getLogoUrl } from "../data";
import { ovrColor, ovrTextColor } from "./helpers";

const W = 720;
const PAD = 24;
const SCALE = 2;

// Carga una imagen sin manchar el canvas; null si falla o tarda
function loadImg(url, timeout = 2500) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), timeout);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Carga un escudo de forma segura para exportar:
 * 1) intenta el PNG del CDN con CORS,
 * 2) si falla, lo descarga con fetch y lo convierte a data URL,
 * 3) si tampoco, devuelve null y se dibuja un escudo SVG propio.
 */
async function loadCrest(url) {
  if (!url) return null;
  const direct = await loadImg(url);
  if (direct) return direct;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
    return dataUrl ? loadImg(dataUrl, 1500) : null;
  } catch {
    return null;
  }
}

/** Escudo SVG generado con los colores del club (respaldo con aspecto real) */
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

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawLogo(ctx, img, team, league, x, y, size) {
  if (img) ctx.drawImage(img, x, y, size, size);
}

/* ===== Trofeos: los mismos SVG de la app, cargados como imagen ===== */

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

// El continental europeo (Champions League) es plateado; el resto dorado
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

// Dibuja un trofeo manteniendo la proporción 24x30
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

/**
 * Genera la imagen resumen de la carrera (canvas listo para exportar).
 */
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

  const ROW_H = 42;
  const trophyLines = grouped.length ? Math.ceil(grouped.length / 3) : 0;
  const trophiesH = trophyLines ? trophyLines * 44 + 10 : 0;
  const legendH = legend ? 58 : 0;
  const H = PAD + 100 + 60 + trophiesH + 30 + rows.length * ROW_H + legendH + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "middle";

  // fondo
  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(0, 0, W, H);

  // Pre-carga de imágenes
  const teams = [...new Set(rows.map((r) => r.team).concat(player.team))];
  const leagueOf = {};
  rows.forEach((r) => (leagueOf[r.team] = r.league));
  leagueOf[player.team] = leagueOf[player.team] || player.league;

  const logoImgs = {};
  await Promise.all(
    teams.map(async (t) => {
      // Escudo real del CDN; si no se puede exportar, escudo SVG con los colores del club
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

  /* ===== Header ===== */
  let y = PAD;
  // caja OVR
  const oc = ovrColor(player.overall);
  const og = ctx.createLinearGradient(PAD, y, PAD + 84, y + 92);
  og.addColorStop(0, oc);
  og.addColorStop(1, "#3f3f46");
  roundRect(ctx, PAD, y, 84, 92, 14);
  ctx.fillStyle = og;
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.75)";
  ctx.font = "700 11px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OVR", PAD + 42, y + 24);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 40px 'Segoe UI', sans-serif";
  ctx.fillText(String(player.overall), PAD + 42, y + 58);

  // tarjeta identidad
  const cardX = PAD + 96;
  const cardW = W - PAD - cardX;
  const tint = teamTint(player.team, player.league, 0.22);
  const cg = ctx.createLinearGradient(cardX, y, cardX + cardW, y + 92);
  cg.addColorStop(0, tint);
  cg.addColorStop(0.7, "#131316");
  roundRect(ctx, cardX, y, cardW, 92, 14);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = teamTint(player.team, player.league, 0.35);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // chips
  let chipX = cardX + 16;
  const chipY = y + 26;
  ctx.font = "800 11px 'Segoe UI', sans-serif";
  // chip nacionalidad
  if (natData) {
    const code3 = natData.n.substring(0, 3).toUpperCase();
    const chipW = 34 + ctx.measureText(code3).width;
    roundRect(ctx, chipX, chipY - 11, chipW, 22, 5);
    ctx.fillStyle = "rgba(63,63,70,.85)";
    ctx.fill();
    if (flagImg) ctx.drawImage(flagImg, chipX + 7, chipY - 6, 17, 12);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(code3, chipX + 28, chipY + 1);
    chipX += chipW + 8;
  }
  // chip posición
  const posTxt = `#${player.number} ${posData?.s || ""}`;
  const posW = 16 + ctx.measureText(posTxt).width;
  roundRect(ctx, chipX, chipY - 11, posW, 22, 5);
  ctx.fillStyle = getTeamColor(player.team, player.league);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(posTxt, chipX + 8, chipY + 1);

  // apellido + club
  ctx.font = "800 19px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#ffffff";
  drawLogo(ctx, logoImgs[player.team], player.team, player.league, cardX + 16, y + 48, 26);
  ctx.fillText(
    truncate(ctx, `${player.name} · ${player.team}`, cardW - 200),
    cardX + 52,
    y + 62
  );

  // edad / valor (etiqueta a la izquierda del valor, sin solaparse)
  ctx.textAlign = "right";
  ctx.font = "900 22px 'Segoe UI', sans-serif";
  const ageW = ctx.measureText(String(player.age)).width;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(player.age), W - PAD - 16, y + 28);
  ctx.font = "800 16px 'Segoe UI', sans-serif";
  const valTxt = fmtValue(marketVal);
  const valW = ctx.measureText(valTxt).width;
  ctx.fillStyle = "#fbbf24";
  ctx.fillText(valTxt, W - PAD - 16, y + 60);
  ctx.font = "600 10px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText("EDAD", W - PAD - 16 - ageW - 10, y + 30);
  ctx.fillText("VALOR", W - PAD - 16 - valW - 10, y + 61);

  /* ===== Totales ===== */
  y += 100;
  ctx.strokeStyle = "rgba(63,63,70,.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y + 4);
  ctx.lineTo(W - PAD, y + 4);
  ctx.moveTo(PAD, y + 52);
  ctx.lineTo(W - PAD, y + 52);
  ctx.stroke();

  const cols = [
    ["PJ", tPJMax ? `${tPJ}/${tPJMax}` : String(tPJ)],
    [isGK ? "GC" : "GLS", String(tA)],
    [isGK ? "VI" : "AST", String(tB)],
  ];
  cols.forEach(([label, val], i) => {
    const cx = W / 6 + (i * W) / 3;
    ctx.textAlign = "center";
    ctx.fillStyle = "#71717a";
    ctx.font = "700 10px 'Segoe UI', sans-serif";
    ctx.fillText(label, cx, y + 16);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 20px 'Segoe UI', sans-serif";
    ctx.fillText(val, cx, y + 37);
  });

  /* ===== Vitrina ===== */
  y += 60;
  if (grouped.length) {
    let tx = PAD;
    let ty = y;
    ctx.font = "700 12px 'Segoe UI', sans-serif";
    for (const g of grouped) {
      const label = `${g.n}${g.count > 1 ? ` ×${g.count}` : ""}`;
      const wChip = 46 + ctx.measureText(label).width;
      if (tx + wChip > W - PAD) {
        tx = PAD;
        ty += 44;
      }
      roundRect(ctx, tx, ty, wChip, 34, 17);
      ctx.fillStyle = "#1c1917";
      ctx.fill();
      ctx.strokeStyle = "rgba(240,194,67,.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      drawTrophy(ctx, trophyImgs[trophyKey(g)], tx + 11, ty + 5, 24);
      ctx.fillStyle = "#e4e4e7";
      ctx.textAlign = "left";
      ctx.fillText(label, tx + 36, ty + 18);
      tx += wChip + 10;
    }
    y = ty + 44 + 10;
  }

  /* ===== Timeline ===== */
  // encabezados
  const colOVR = 470;
  const colPJ = 566;
  const colGLS = 632;
  const colAST = W - PAD;
  ctx.font = "700 9px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#71717a";
  ctx.textAlign = "left";
  ctx.fillText("EDAD", PAD + 2, y + 8);
  ctx.fillText("CLUB", PAD + 96, y + 8);
  ctx.textAlign = "right";
  ctx.fillText("OVR", colOVR, y + 8);
  ctx.fillText("PJ", colPJ, y + 8);
  ctx.fillText(isGK ? "GC" : "GLS", colGLS, y + 8);
  ctx.fillText(isGK ? "VI" : "AST", colAST, y + 8);
  y += 22;

  for (const row of rows) {
    const tColor = getTeamColor(row.team, row.league);
    const rTint = teamTint(row.team, row.league, 0.18);
    const rg = ctx.createLinearGradient(PAD, y, W - PAD, y);
    rg.addColorStop(0, rTint);
    rg.addColorStop(0.85, "rgba(19,19,22,.9)");
    roundRect(ctx, PAD, y, W - PAD * 2, ROW_H - 6, 9);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.strokeStyle = teamTint(row.team, row.league, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();

    const cy = y + (ROW_H - 6) / 2;

    // edad
    roundRect(ctx, PAD + 8, cy - 12, 34, 24, 6);
    ctx.fillStyle = tColor;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(row.age), PAD + 25, cy + 1);

    // escudo + club
    drawLogo(ctx, logoImgs[row.team], row.team, row.league, PAD + 54, cy - 11, 22);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 14px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    const name = truncate(ctx, row.team, 240);
    ctx.fillText(name, PAD + 84, cy + 1);

    // trofeos de la temporada (mismos íconos que en la app)
    let cupX = PAD + 84 + ctx.measureText(name).width + 8;
    for (const t of row.trophies || []) {
      drawTrophy(ctx, trophyImgs[trophyKey(t)], cupX, cy - 9, 18);
      cupX += 17;
    }

    // OVR
    roundRect(ctx, colOVR - 34, cy - 11, 34, 22, 6);
    ctx.fillStyle = ovrColor(row.ovr);
    ctx.fill();
    ctx.fillStyle = ovrTextColor(row.ovr);
    ctx.font = "900 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(row.ovr), colOVR - 17, cy + 1);

    // stats
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "700 12px 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(row.pjMax ? `${row.pj}/${row.pjMax}` : String(row.pj), colPJ, cy + 1);
    ctx.fillText(String(isGK ? row.gc : row.gls), colGLS, cy + 1);
    ctx.fillText(String(isGK ? row.vi : row.ast), colAST, cy + 1);

    y += ROW_H;
  }

  /* ===== Puntaje de leyenda ===== */
  if (legend) {
    y += 8;
    roundRect(ctx, PAD, y, W - PAD * 2, 44, 12);
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fill();
    ctx.strokeStyle = `${legend.color}55`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#71717a";
    ctx.font = "800 9px 'Segoe UI', sans-serif";
    ctx.fillText("PUNTAJE DE LEYENDA", PAD + 16, y + 15);
    ctx.fillStyle = legend.color;
    ctx.font = "900 16px 'Segoe UI', sans-serif";
    ctx.fillText(legend.title, PAD + 16, y + 31);

    // barra de progreso
    const barX = PAD + 200;
    const barW = W - PAD * 2 - 200 - 90;
    roundRect(ctx, barX, y + 19, barW, 8, 4);
    ctx.fillStyle = "#27272a";
    ctx.fill();
    roundRect(ctx, barX, y + 19, (barW * legend.score) / 100, 8, 4);
    ctx.fillStyle = legend.color;
    ctx.fill();

    ctx.textAlign = "right";
    ctx.fillStyle = legend.color;
    ctx.font = "900 26px 'Segoe UI', sans-serif";
    ctx.fillText(String(legend.score), W - PAD - 42, y + 24);
    ctx.fillStyle = "#52525b";
    ctx.font = "800 13px 'Segoe UI', sans-serif";
    ctx.fillText("/100", W - PAD - 14, y + 26);
  }

  return canvas;
}
