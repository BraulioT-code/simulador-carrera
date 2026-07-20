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
    return { pj, pjMax: maxPJ, gls: 0, ast: 0, gc, vi };
  }

  const isAttacker = ["ST", "LW", "RW", "CAM"].includes(position);
  const isMidfielder = ["CM", "CDM", "LM", "RM"].includes(position);

  return {
    pj,
    pjMax: maxPJ,
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
        all.push({ team, league: leagueName, code: leagueData.code });
      }
    });
  });
  return all.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Ofertas de debut: solo clubes de las ligas del país del jugador.
 * Si el país no tiene liga en el juego, se ofrecen ligas modestas (p <= 62).
 */
export function getDebutOffers(country, count = 3) {
  let pool = [];
  Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
    if (leagueData.c === country) {
      leagueData.teams.forEach((team) =>
        pool.push({ team, league: leagueName, code: leagueData.code })
      );
    }
  });

  if (pool.length === 0) {
    Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
      if (leagueData.p <= 62) {
        leagueData.teams.forEach((team) =>
          pool.push({ team, league: leagueName, code: leagueData.code })
        );
      }
    });
  }

  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

// Nombre de la copa nacional según el país de la liga
const COPA_BY_COUNTRY = {
  Inglaterra: "FA Cup",
  España: "Copa del Rey",
  Italia: "Coppa Italia",
  Alemania: "DFB-Pokal",
  Francia: "Copa de Francia",
  Argentina: "Copa Argentina",
  Colombia: "Copa Colombia",
  Brasil: "Copa do Brasil",
  México: "Copa MX",
  Portugal: "Taça de Portugal",
  "Países Bajos": "Copa KNVB",
  Escocia: "Scottish Cup",
  Japón: "Copa del Emperador",
  "Estados Unidos": "US Open Cup",
  Marruecos: "Copa del Trono",
};

// Torneo continental según la región de la liga
const CONTINENTAL_BY_REGION = {
  eu: "Champions League",
  sa: "Copa Libertadores",
  na: "Concachampions",
  as: "Champions League de Asia",
  af: "Champions League Africana",
};

/**
 * Genera trofeos ganados en la temporada.
 * Cada trofeo es { t: tipo, n: nombre } — ej: { t: "liga", n: "Liga BetPlay" }.
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
    if (position <= 1) trophies.push({ t: "liga", n: player.league });
    if (position <= 3 && Math.random() < 0.25)
      trophies.push({ t: "copa", n: COPA_BY_COUNTRY[leagueData.c] || `Copa de ${leagueData.c}` });

    // Torneo continental: solo primeras divisiones, peleando arriba
    if (leagueData.d !== 2 && position <= 2) {
      const pCont = clamp(
        (player.overall - 62) / 60 + (leagueData.p - 70) / 120,
        0.03,
        0.45
      );
      if (Math.random() < pCont)
        trophies.push({ t: "continental", n: CONTINENTAL_BY_REGION[leagueData.r] || "Copa Continental" });
    }
  }

  if (player.overall >= 85 && Math.random() < 0.08) trophies.push({ t: "ballon", n: "Balón de Oro" });
  if (player.overall >= 88 && Math.random() < 0.12) trophies.push({ t: "bota", n: "Bota de Oro" });
  if ((player.intCaps || 0) > 20 && Math.random() < 0.04) trophies.push({ t: "mundial", n: "Copa del Mundo" });

  return trophies;
}

/**
 * Evalúa el rendimiento real de la temporada (para decidir la renovación).
 *
 * - Participación: partidos jugados frente al máximo posible para su edad
 *   (jugar el 75% del máximo ya cuenta como titularidad plena).
 * - Producción (ratio): goles + 0.6×asistencias por partido comparado con la
 *   producción PROMEDIO esperada para su posición y nivel (1.0 = temporada normal).
 *   Arqueros: goles en contra por partido y % de vallas invictas.
 *   Defensores: sus números son poca señal, así que pesa más la titularidad.
 * - Exigencia según el club: si tu OVR sobra para la liga (+10) te renuevan con
 *   menos producción; si la liga te queda grande (−15) te exigen más.
 *
 * Devuelve { rating: 0-10, good: boolean }.
 */
export function evaluateSeason(player, stats) {
  const leagueData = LEAGUES[player.league];
  const prestige = leagueData?.p ?? 60;
  const factor = player.overall / 80;
  const age = player.age;

  const maxPJ = stats.pjMax ?? (age <= 17 ? 45 : age <= 19 ? 70 : age >= 34 ? 65 : 85);
  const participation = Math.min(1, stats.pj / (maxPJ * 0.75));

  let ratio;
  if (player.position === "GK") {
    const gcPerGame = stats.gc / Math.max(1, stats.pj);
    const cleanRate = stats.vi / Math.max(1, stats.pj);
    ratio = 0.5 * (cleanRate / (0.2 * factor)) + 0.5 * clamp((1.15 - gcPerGame) / 0.35, 0, 2);
  } else {
    const isAttacker = ["ST", "LW", "RW", "CAM"].includes(player.position);
    const isMid = ["CM", "CDM", "LM", "RM"].includes(player.position);
    const contrib = (stats.gls + 0.6 * stats.ast) / Math.max(1, stats.pj);
    const expected = (isAttacker ? 0.38 : isMid ? 0.15 : 0.06) * factor;
    ratio = contrib / Math.max(0.03, expected);
    // Defensores: jugar seguido ya es rendir
    if (!isAttacker && !isMid) ratio = Math.max(ratio, participation * 0.85);
  }

  const levelGap = player.overall - prestige;
  let threshold = 0.65;
  if (levelGap >= 10) threshold = 0.45;
  else if (levelGap <= -15) threshold = 0.8;

  const good = participation >= 0.5 && ratio >= threshold;
  const rating = clamp(participation * 3 + Math.min(1.4, ratio) * 5, 0, 10);

  return { rating: Math.round(rating * 10) / 10, good };
}

/**
 * Calcula el cambio de OVR según la edad y el rendimiento de la temporada.
 * Una gran temporada (rating >= 8) acelera el crecimiento; una muy mala lo frena.
 */
export function calculateOvrDelta(age, rating = null) {
  let delta;
  if (age < 20) delta = randInt(3, 7);
  else if (age < 24) delta = randInt(2, 5);
  else if (age < 28) delta = randInt(0, 3);
  else if (age < 31) delta = randInt(-1, 1);
  else if (age < 34) delta = randInt(-3, 0);
  else delta = randInt(-5, -1);

  if (rating != null) {
    if (rating >= 8) delta += 2;
    else if (rating >= 6.5) delta += 1;
    else if (rating < 3) delta -= 1;
  }

  return delta;
}

/**
 * Verifica si el jugador debe retirarse.
 */
export function shouldRetire(newAge, newOvr) {
  return newAge > 38 || (newAge >= 36 && newOvr < 45);
}
