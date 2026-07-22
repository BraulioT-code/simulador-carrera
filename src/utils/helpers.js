/** Entero aleatorio entre a y b (inclusive) */
export const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/** Elemento aleatorio de un array */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Elemento aleatorio ponderado: cada item puede traer un peso `w` (default 1) */
export const pickWeighted = (arr) => {
  const total = arr.reduce((s, e) => s + (e.w ?? 1), 0);
  let r = Math.random() * total;
  for (const e of arr) {
    r -= e.w ?? 1;
    if (r <= 0) return e;
  }
  return arr[arr.length - 1];
};

/** Clamp: limita un valor entre lo y hi */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Sistema de tiers OVR estilo EA Sports FC.
 * Devuelve { gradient, textColor, glow } para el badge hexagonal.
 */
export function ovrTier(ovr) {
  if (ovr >= 96) return {
    gradient: "linear-gradient(160deg,#AD1457,#EC407A)",
    textColor: "#EC407A",
    glow: "rgba(236,64,122,.45)",
  };
  if (ovr >= 90) return {
    gradient: "linear-gradient(160deg,#6A1B9A,#AB47BC)",
    textColor: "#AB47BC",
    glow: "rgba(171,71,188,.45)",
  };
  if (ovr >= 83) return {
    gradient: "linear-gradient(160deg,#1565C0,#42A5F5)",
    textColor: "#42A5F5",
    glow: "rgba(66,165,245,.45)",
  };
  if (ovr >= 77) return {
    gradient: "linear-gradient(160deg,#2E7D32,#66BB6A)",
    textColor: "#66BB6A",
    glow: "rgba(102,187,106,.4)",
  };
  if (ovr >= 70) return {
    gradient: "linear-gradient(160deg,#92750B,#C9A227)",
    textColor: "#C9A227",
    glow: "rgba(201,162,39,.4)",
  };
  if (ovr >= 63) return {
    gradient: "linear-gradient(160deg,#6B7280,#9CA3AF)",
    textColor: "#9CA3AF",
    glow: "rgba(156,163,175,.3)",
  };
  if (ovr >= 55) return {
    gradient: "linear-gradient(160deg,#8B6914,#CD7F32)",
    textColor: "#CD7F32",
    glow: "rgba(205,127,50,.35)",
  };
  return {
    gradient: "linear-gradient(160deg,#7B5B2A,#A67C3D)",
    textColor: "#A67C3D",
    glow: "rgba(166,124,61,.3)",
  };
}

/**
 * Color sólido de fondo según OVR — para uso en Canvas (careerImage).
 * Devuelve el color más oscuro del gradiente del tier.
 */
export function ovrColor(ovr) {
  if (ovr >= 96) return "#AD1457";
  if (ovr >= 90) return "#6A1B9A";
  if (ovr >= 83) return "#1565C0";
  if (ovr >= 77) return "#2E7D32";
  if (ovr >= 70) return "#92750B";
  if (ovr >= 63) return "#6B7280";
  if (ovr >= 55) return "#8B6914";
  return "#7B5B2A";
}

/** Color de texto legible sobre ovrColor */
export function ovrTextColor(ovr) {
  return ovrTier(ovr).textColor;
}

/** Valor de mercado en millones */
export function marketValue(ovr, age) {
  let base = 0;
  if (ovr >= 90) base = randInt(80, 150);
  else if (ovr >= 85) base = randInt(40, 90);
  else if (ovr >= 80) base = randInt(20, 50);
  else if (ovr >= 75) base = randInt(10, 25);
  else if (ovr >= 70) base = randInt(5, 15);
  else if (ovr >= 60) base = randInt(1, 8);
  else base = Math.max(0.1, randInt(1, 30) / 10);

  if (age <= 21) base *= 1.3;
  else if (age >= 33) base *= 0.4;
  else if (age >= 30) base *= 0.7;

  return Math.round(base * 10) / 10;
}
