import { LEAGUES } from "../data";
import { randInt, clamp } from "./helpers";

/**
 * Genera estadísticas de temporada (2 años) según posición, OVR y edad.
 */
export function generateStats(position, ovr, age) {
  const factor = ovr / 80;
  const maxPJ = age <= 17 ? 45 : age <= 19 ? 70 : age >= 34 ? 65 : 85;
  const minPJ = age <= 17 ? 15 : age <= 19 ? 35 : age >= 34 ? 25 : 50;
  const pj = clamp(randInt(minPJ, maxPJ) + Math.floor((ovr - 60) * 0.3), minPJ, maxPJ);

  if (position === "GK") {
    const gc = Math.max(0, randInt(Math.floor(pj * 0.4), Math.floor(pj * 1.8)) - Math.floor(factor * pj * 0.3));
    const vi = randInt(0, Math.floor(pj * 0.45 * factor));
    return { pj, gls: 0, ast: 0, gc, vi };
  }

  const isAttacker = ["ST", "LW", "RW", "CAM"].includes(position);
  const isMidfielder = ["CM", "CDM", "LM", "RM"].includes(position);

  return {
    pj,
    gls: isAttacker
      ? randInt(0, Math.floor(pj * 0.55 * factor))
      : isMidfielder
        ? randInt(0, Math.floor(pj * 0.18 * factor))
        : randInt(0, Math.floor(pj * 0.06 * factor)),
    ast: isAttacker || isMidfielder
      ? randInt(0, Math.floor(pj * 0.35 * factor))
      : randInt(0, Math.floor(pj * 0.1 * factor)),
    gc: 0,
    vi: 0,
  };
}

/**
 * Genera ofertas aleatorias de clubes.
 */
export function getOffers(count = 3, excludeTeam = "") {
  const all = [];
  Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
    leagueData.teams.forEach((team) => {
      if (team !== excludeTeam) {
        all.push({ team, league: leagueName, flag: leagueData.f });
      }
    });
  });
  return all.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Genera trofeos ganados en la temporada.
 */
export function generateTrophies(player) {
  const trophies = [];
  const leagueData = LEAGUES[player.league];

  if (leagueData) {
    const size = leagueData.teams.length;
    const position = clamp(
      randInt(1, size) - Math.floor(player.overall / 30) + randInt(-2, 2),
      1,
      size
    );
    if (position <= 1) trophies.push("🏆");
    if (position <= 3 && Math.random() < 0.25) trophies.push("🏅");
  }

  if (player.overall >= 85 && Math.random() < 0.08) trophies.push("⭐");
  if (player.overall >= 88 && Math.random() < 0.12) trophies.push("👟");
  if ((player.intCaps || 0) > 20 && Math.random() < 0.04) trophies.push("🌍");

  return trophies;
}

/**
 * Calcula el cambio de OVR según la edad del jugador.
 */
export function calculateOvrDelta(age) {
  if (age < 20) return randInt(2, 6);
  if (age < 24) return randInt(1, 4);
  if (age < 28) return randInt(0, 2);
  if (age < 31) return randInt(-1, 1);
  if (age < 34) return randInt(-3, 0);
  return randInt(-5, -1);
}

/**
 * Verifica si el jugador debe retirarse.
 */
export function shouldRetire(newAge, newOvr) {
  return newAge > 38 || (newAge >= 36 && newOvr < 45);
}
