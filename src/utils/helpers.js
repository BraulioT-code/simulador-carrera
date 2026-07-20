/** Entero aleatorio entre a y b (inclusive) */
export const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

/** Elemento aleatorio de un array */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Clamp: limita un valor entre lo y hi */
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Color según OVR */
export function ovrColor(ovr) {
  if (ovr >= 90) return "#c026d3";
  if (ovr >= 80) return "#22c55e";
  if (ovr >= 65) return "#eab308";
  if (ovr >= 50) return "#f97316";
  return "#ef4444";
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
