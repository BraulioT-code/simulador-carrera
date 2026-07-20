import { LEAGUES } from "../data";
import { getClubRating } from "../data/clubRatings";
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

/** Todos los clubes del juego con su liga y ranking */
function allClubs(excludeTeam = "") {
  const all = [];
  Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
    leagueData.teams.forEach((team) => {
      if (team !== excludeTeam) {
        all.push({
          team,
          league: leagueName,
          code: leagueData.code,
          rating: getClubRating(team, leagueName),
        });
      }
    });
  });
  return all;
}

/**
 * Ofertas de clubes filtradas por ranking.
 * `window` = { min, max } acota el nivel de los clubes interesados.
 */
export function getOffers(count = 3, excludeTeam = "", window = null) {
  const all = allClubs(excludeTeam);
  let pool = all;

  if (window) {
    pool = all.filter((c) => c.rating >= window.min && c.rating <= window.max);
    // Si la ventana es muy estrecha, se amplía progresivamente
    let widen = 0;
    while (pool.length < count && widen < 40) {
      widen += 5;
      pool = all.filter(
        (c) => c.rating >= window.min - widen && c.rating <= window.max + widen / 2
      );
    }
  }

  return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Ventana de clubes interesados según el rendimiento de la temporada.
 * - Temporadón: te buscan clubes mejores que el actual.
 * - Buena: clubes de nivel similar o algo mejor.
 * - Floja / sin renovación: solo clubes por debajo de tu club actual.
 */
export function offerWindow(currentRating, season, player = null, stats = null) {
  const r = season?.rating ?? 5;
  const ovr = player?.overall ?? currentRating;

  // Punto de partida: tu club actual, pero si tu OVR le queda grande,
  // los clubes de tu nivel real también se fijan en vos.
  let center = Math.max(currentRating, ovr - 3);

  // Rendimiento global de la temporada (-9 a +9)
  center += (r - 5) * 1.8;

  if (stats) {
    const isGK = player?.position === "GK";
    const share = stats.pj / Math.max(1, stats.pjMax || 85);

    if (isGK) {
      const clean = stats.vi / Math.max(1, stats.pj);
      if (clean >= 0.4) center += 5;
      else if (clean >= 0.28) center += 2;
      else if (clean <= 0.12) center -= 4;
    } else {
      const per = (stats.gls + 0.6 * stats.ast) / Math.max(1, stats.pj);
      // Números de crack
      if (stats.gls >= 30 || stats.ast >= 25 || per >= 0.85) center += 6;
      else if (stats.gls >= 20 || stats.ast >= 16 || per >= 0.6) center += 3.5;
      else if (stats.gls >= 12 || stats.ast >= 10) center += 1.5;
      // Aporte casi nulo jugando seguido
      else if (stats.gls + stats.ast <= 4 && stats.pj > 35) center -= 4;
    }

    // Minutos jugados
    if (share >= 0.9) center += 2;
    else if (share < 0.45) center -= 6;
    else if (share < 0.65) center -= 2;
  }

  // Las carreras se construyen por escalones: nadie salta de la nada a la élite
  center = Math.min(center, currentRating + 20);

  let win;
  if (!season?.good) {
    // Sin renovación: siempre un escalón por debajo de tu club actual
    const top = Math.min(center, currentRating - 3);
    win = { min: top - 16, max: top };
  } else {
    win = { min: center - 6, max: center + 8 };
  }

  // Si ya estás en la cima, los grandes siguen interesados (no hay nada mejor)
  if (win.min > 90) win.min = 88;
  return { min: Math.max(32, Math.round(win.min)), max: Math.min(99, Math.round(win.max)) };
}

/**
 * Ofertas de debut: solo clubes de las ligas del país del jugador.
 * Si el país no tiene liga en el juego, se ofrecen ligas modestas (p <= 62).
 */
export function getDebutOffers(country, count = 3) {
  const add = (leagueName, leagueData) =>
    leagueData.teams.map((team) => ({
      team,
      league: leagueName,
      code: leagueData.code,
      rating: getClubRating(team, leagueName),
    }));

  let pool = [];
  Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
    if (leagueData.c === country) pool.push(...add(leagueName, leagueData));
  });

  if (pool.length === 0) {
    Object.entries(LEAGUES).forEach(([leagueName, leagueData]) => {
      if (leagueData.p <= 62) pool.push(...add(leagueName, leagueData));
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

// Copa de selecciones por confederación
export const NATIONAL_CUPS = {
  eu: "Eurocopa",
  sa: "Copa América",
  na: "Copa Oro",
  as: "Copa Asiática",
  af: "Copa Africana",
};

/** Región (confederación) del país del jugador, según las ligas del juego */
export function regionOf(country) {
  return Object.values(LEAGUES).find((l) => l.c === country)?.r || null;
}

/** Nombre del torneo de selecciones del jugador */
export function nationalCupName(country) {
  return NATIONAL_CUPS[regionOf(country)] || "Copa de Naciones";
}

/** Años de Mundial: cada 4 años de carrera (18, 22, 26, 30, 34, 38) */
export function isWorldCupYear(age) {
  return age >= 18 && (age - 18) % 4 === 0;
}

/** Años de copa continental de selecciones: alternan con el Mundial (20, 24, 28…) */
export function isContinentalCupYear(age) {
  return age >= 20 && (age - 20) % 4 === 0;
}

/**
 * Partidos de eliminatorias por bloque de 2 años, según confederación.
 * CONMEBOL: 18 por ciclo (todos contra todos ida y vuelta) → ~9 por bloque.
 * UEFA: 6-8 por ciclo (grupos de 4 o 5, ida y vuelta) → ~3-4 por bloque.
 * Concacaf / AFC / CAF: rondas variables.
 */
const QUALIFIERS_PER_BLOCK = {
  sa: [8, 10],
  eu: [3, 4],
  na: [3, 6],
  as: [5, 8],
  af: [4, 6],
};

/**
 * Recorrido en un torneo de selecciones.
 * type: "wc" (48 equipos: 3 grupos + hasta 5 eliminatorias = 8),
 *       "cont24" (24 equipos: 3 + octavos… = hasta 7),
 *       "cont16" (16 equipos: 3 + cuartos… = hasta 6).
 */
const RUNS = {
  wc: [
    { stage: "Fase de grupos", matches: 3 },
    { stage: "Dieciseisavos", matches: 4 },
    { stage: "Octavos", matches: 5 },
    { stage: "Cuartos", matches: 6 },
    { stage: "Semifinal", matches: 7 },
    { stage: "Final", matches: 8 },
  ],
  cont24: [
    { stage: "Fase de grupos", matches: 3 },
    { stage: "Octavos", matches: 4 },
    { stage: "Cuartos", matches: 5 },
    { stage: "Semifinal", matches: 6 },
    { stage: "Final", matches: 7 },
  ],
  cont16: [
    { stage: "Fase de grupos", matches: 3 },
    { stage: "Cuartos", matches: 4 },
    { stage: "Semifinal", matches: 5 },
    { stage: "Final", matches: 6 },
  ],
};

/** Tipo de copa continental según confederación (24 equipos en UEFA/CAF/AFC, 16 en CONMEBOL/Concacaf) */
export function continentalCupType(region) {
  return region === "eu" || region === "af" || region === "as" ? "cont24" : "cont16";
}

/**
 * Resuelve hasta dónde llega tu selección.
 * Devuelve { stage, matches, isFinal, champion } — el título se define aparte
 * (por penal) cuando se llega a la final.
 */
export function resolveTournamentRun(player, type = "wc") {
  const table = RUNS[type];
  const strength = clamp(
    (player.overall - 62) / 34 + (player.reputation || 0) / 300,
    0.05,
    0.95
  );
  // Cuanto mejor el jugador, más probable avanzar de ronda
  let idx = 0;
  while (idx < table.length - 1 && Math.random() < 0.32 + strength * 0.42) idx++;
  const entry = table[idx];
  return { ...entry, isFinal: idx === table.length - 1 };
}

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

  return trophies;
}

/**
 * Premios individuales de la temporada según el rendimiento real.
 * Se calculan aparte de los títulos de equipo.
 */
export function generateAwards(player, stats, rating) {
  const awards = [];
  const leagueData = LEAGUES[player.league];
  const prestige = leagueData?.p ?? 60;
  const isGK = player.position === "GK";

  // MVP de la liga: gran temporada + nivel acorde a la liga
  if (rating >= 8.5 && player.overall >= prestige - 6 && Math.random() < 0.35) {
    awards.push({ t: "mvp", n: `MVP de la ${player.league}` });
  }

  // Equipo del año
  if (rating >= 7.5 && Math.random() < 0.4) {
    awards.push({ t: "eoty", n: `Equipo del Año · ${player.league}` });
  }

  // Goleador / Guante de oro
  if (!isGK && stats.gls >= 25 && Math.random() < 0.6) {
    awards.push({ t: "bota", n: `Goleador de la ${player.league}` });
  }
  if (isGK && stats.vi >= stats.pj * 0.38 && Math.random() < 0.5) {
    awards.push({ t: "mvp", n: `Guante de Oro · ${player.league}` });
  }

  return awards;
}

/**
 * Estadísticas con la selección en el bloque de 2 años.
 * Se compone de eliminatorias (según confederación) + amistosos.
 * Los partidos de torneo se suman aparte al resolverse (ver addNationalCompetition).
 */
export function generateNationalStats(player, region) {
  const [qmin, qmax] = QUALIFIERS_PER_BLOCK[region] || [3, 5];
  // Titularidad en la selección según nivel: los mejores juegan casi todo
  const share = clamp((player.overall - 58) / 30, 0.35, 1);

  const comps = [
    { n: "Eliminatorias", pj: Math.max(1, Math.round(randInt(qmin, qmax) * share)) },
    { n: "Amistosos", pj: Math.max(1, Math.round(randInt(2, 5) * share)) },
  ];

  return withNationalTotals({ comps, gls: 0, ast: 0, gc: 0, vi: 0 }, player);
}

/** Recalcula totales y producción a partir de los partidos por competencia */
function withNationalTotals(nt, player) {
  const caps = nt.comps.reduce((s, c) => s + c.pj, 0);
  const factor = clamp(player.overall / 80, 0.5, 1.25);

  if (player.position === "GK") {
    return {
      ...nt,
      caps,
      gls: 0,
      ast: 0,
      gc: Math.max(0, randInt(Math.floor(caps * 0.4), Math.floor(caps * 1.2))),
      vi: randInt(0, Math.round(caps * 0.4 * factor)),
    };
  }

  const isAttacker = ["ST", "LW", "RW", "CAM"].includes(player.position);
  const isMid = ["CM", "CDM", "LM", "RM"].includes(player.position);
  const glsRate = isAttacker ? 0.4 : isMid ? 0.15 : 0.05;
  const astRate = isAttacker || isMid ? 0.28 : 0.08;

  return {
    ...nt,
    caps,
    gls: randInt(0, Math.max(1, Math.round(caps * glsRate * factor))),
    ast: randInt(0, Math.max(1, Math.round(caps * astRate * factor))),
    gc: 0,
    vi: 0,
  };
}

/** Suma un torneo (Mundial / copa continental) a las estadísticas de selección */
export function addNationalCompetition(nt, player, name, pj, stage) {
  const base = nt || { comps: [] };
  const comps = [{ n: name, pj, stage }, ...base.comps.filter((c) => c.n !== name)];
  return withNationalTotals({ ...base, comps }, player);
}

/** Salario anual estimado (millones €) según OVR, edad y prestigio de liga */
export function estimateSalary(player) {
  const prestige = LEAGUES[player.league]?.p ?? 55;
  const base = Math.pow(Math.max(0, player.overall - 42) / 10, 2.35) * 0.42;
  const leagueFactor = 0.35 + (prestige / 95) * 1.15;
  const ageFactor = player.age <= 20 ? 0.45 : player.age >= 34 ? 0.75 : 1;
  return Math.max(0.05, Math.round(base * leagueFactor * ageFactor * 100) / 100);
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
