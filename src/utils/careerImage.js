import { getTeamColor, teamTint, getLogoUrl } from "../data";
import { ovrColor, ovrTextColor } from "./helpers";

const W = 720;
const PAD = 24;
const SCALE = 2;

// Carga una imagen sin manchar el canvas; null si falla o tarda
function loadImg(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), 2500);
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

function drawMonogram(ctx, team, league, x, y, size) {
  ctx.save();
  roundRect(ctx, x, y, size, size, size / 2);
  ctx.fillStyle = getTeamColor(team, league);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${size * 0.42}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(team), x + size / 2, y + size / 2 + 1);
  ctx.restore();
}

function drawLogo(ctx, img, team, league, x, y, size) {
  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    drawMonogram(ctx, team, league, x, y, size);
  }
}

// Pequeño trofeo (copa) dibujado a mano
function drawCup(ctx, x, y, h, gold = false) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  if (gold) {
    grad.addColorStop(0, "#fdeaa0");
    grad.addColorStop(1, "#b07d1e");
  } else {
    grad.addColorStop(0, "#fafafa");
    grad.addColorStop(1, "#8e8e98");
  }
  ctx.save();
  ctx.fillStyle = grad;
  const w = h * 0.78;
  // copa
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.quadraticCurveTo(x + w, y + h * 0.62, x + w / 2, y + h * 0.62);
  ctx.quadraticCurveTo(x, y + h * 0.62, x, y);
  ctx.fill();
  // tallo y base
  ctx.fillRect(x + w / 2 - h * 0.07, y + h * 0.58, h * 0.14, h * 0.22);
  ctx.fillRect(x + w * 0.18, y + h * 0.8, w * 0.64, h * 0.16);
  ctx.restore();
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
export async function generateCareerImage({ player, history, natData, posData, marketVal }) {
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
  const H = PAD + 100 + 60 + trophiesH + 30 + rows.length * ROW_H + PAD;

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
  const logoImgs = {};
  await Promise.all(
    teams.map(async (t) => {
      logoImgs[t] = await loadImg(logoUrlFor(t));
    })
  );
  const flagImg = natData ? await loadImg(`https://flagcdn.com/w40/${natData.c}.png`) : null;

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

  // edad / valor
  ctx.textAlign = "right";
  ctx.font = "600 10px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#a1a1aa";
  ctx.fillText("EDAD", W - PAD - 58, y + 28);
  ctx.fillText("VALOR", W - PAD - 58, y + 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 22px 'Segoe UI', sans-serif";
  ctx.fillText(String(player.age), W - PAD - 16, y + 28);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "800 16px 'Segoe UI', sans-serif";
  ctx.fillText(fmtValue(marketVal), W - PAD - 16, y + 60);

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
      const wChip = 42 + ctx.measureText(label).width;
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
      const goldTypes = ["ballon", "bota", "mundial"];
      drawCup(ctx, tx + 12, ty + 8, 18, goldTypes.includes(g.t) || g.t === "continental");
      ctx.fillStyle = "#e4e4e7";
      ctx.textAlign = "left";
      ctx.fillText(label, tx + 34, ty + 18);
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

    // trofeos de la temporada
    let cupX = PAD + 84 + ctx.measureText(name).width + 8;
    for (const t of row.trophies || []) {
      drawCup(ctx, cupX, cy - 8, 15, ["ballon", "bota", "mundial", "continental"].includes(t.t));
      cupX += 15;
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

  return canvas;
}
