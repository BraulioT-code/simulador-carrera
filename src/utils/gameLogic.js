import { LEAGUES } from "../data";
import { getClubRating } from "../data/clubRatings";
import { randInt, clamp } from "./helpers";

/**
 * Genera estadísticas de temporada (2 años) según posición, OVR y edad.
 */
/**
 * Producción esperada por partido según la posición (goles / asistencias).
 * Los valores se escalan con el nivel: factor = (ovr/80)^1.4, así los cracks
 * producen mucho más que los jugadores promedio.
 */
const POSITION_PROFILE = {
  ST: { g: 0.6, a: 0.16 },
  LW: { g: 0.42, a: 0.28 },
  RW: { g: 0.42, a: 0.28 },
  CAM: { g: 0.3, a: 0.38 },
  LM: { g: 0.2, a: 0.3 },
  RM: { g: 0.2, a: 0.3 },
  CM: { g: 0.14, a: 0.26 },
  CDM: { g: 0.07, a: 0.14 },
  LB: { g: 0.04, a: 0.16 },
  RB: { g: 0.04, a: 0.16 },
  CB: { g: 0.06, a: 0.04 },
};

// Curva de habilidad: crece más rápido en la élite, para que los cracks
// produzcan como cracks (un 90+ pesa mucho más que un 80).
const skillFactor = (ovr) => {
  const base = Math.pow(Math.max(0.4, ovr / 80), 1.55);
  // Prima de estrella mundial: +hasta 35% de 88 a 99
  const starBonus = ovr >= 88 ? 1 + (ovr - 88) * 0.032 : 1;
  return base * starBonus;
};

/** Contribución media esperada por partido (gls + 0.6·ast), para evaluar temporadas */
export function expectedContribution(position, ovr) {
  const p = POSITION_PROFILE[position] || POSITION_PROFILE.CM;
  return (p.g + 0.6 * p.a) * skillFactor(ovr);
}

/** Variación de temporada: 0.55 (año flojo) a 1.45 (año enorme), centrada en 1 */
const seasonSwing = () => 0.55 + Math.random() * 0.9;

export function generateStats(position, ovr, age) {
  const f = skillFactor(ovr);
  const maxPJ = age <= 17 ? 45 : age <= 19 ? 70 : age >= 34 ? 65 : 85;
  const minPJ = age <= 17 ? 15 : age <= 19 ? 35 : age >= 34 ? 25 : 50;
  const pj = clamp(randInt(minPJ, maxPJ) + Math.floor((ovr - 60) * 0.3), minPJ, maxPJ);

  if (position === "GK") {
    // Goles en contra: menos cuanto mejor el arquero; vallas invictas al revés
    const gc = Math.max(0, Math.round(pj * (1.35 - 0.45 * f) * seasonSwing()));
    const vi = Math.round(pj * 0.3 * f * seasonSwing());
    return { pj, pjMax: maxPJ, gls: 0, ast: 0, gc, vi };
  }

  const p = POSITION_PROFILE[position] || POSITION_PROFILE.CM;
  return {
    pj,
    pjMax: maxPJ,
    gls: Math.round(pj * p.g * f * seasonSwing()),
    ast: Math.round(pj * p.a * f * seasonSwing()),
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

  // Sin renovación: solo clubes por debajo del tuyo
  if (!season?.good) {
    const top = currentRating - 3;
    return {
      min: Math.max(32, Math.round(top - 16)),
      max: Math.min(99, Math.round(top)),
    };
  }

  // ── Tu NIVEL REAL manda: los clubes fichan según tu OVR, no según el club
  //    en el que estés. Un crack de OVR 81 en la segunda colombiana recibe
  //    ofertas de clubes de ~80, no de la segunda. ──
  //
  // El techo parte de tu OVR y sube con la calidad de la temporada:
  //   excepcional (9+): +6 · muy buena (8+): +4 · buena (7+): +2
  //   correcta (5.5+): +1 · mediocre: 0
  let bonus;
  if (r >= 9) bonus = 6;
  else if (r >= 8) bonus = 4;
  else if (r >= 7) bonus = 2;
  else if (r >= 5.5) bonus = 1;
  else bonus = 0;

  let share = 1;
  if (stats) {
    const isGK = player?.position === "GK";
    share = stats.pj / Math.max(1, stats.pjMax || 85);

    // Números de crack empujan un poco más arriba
    if (isGK) {
      const clean = stats.vi / Math.max(1, stats.pj);
      if (clean >= 0.4) bonus += 2;
      else if (clean >= 0.3) bonus += 1;
    } else {
      const per = (stats.gls + 0.6 * stats.ast) / Math.max(1, stats.pj);
      if (stats.gls >= 35 || per >= 0.85) bonus += 2;
      else if (stats.gls >= 22 || stats.ast >= 18 || per >= 0.6) bonus += 1;
    }

    // Suplencia: pocos clubes te miran y desde abajo
    if (share < 0.5) bonus = -3;
    else if (share < 0.65) bonus = Math.max(0, bonus - 2);
  }

  // Techo = tu nivel real + la proyección de la temporada. El club actual solo
  // importa para que nunca te ofrezcan algo peor de lo que ya tenés.
  const max = Math.max(ovr + bonus, currentRating);

  // Piso: no baja demasiado respecto al techo (el pool siempre trae opciones)
  let floor = max - 14;
  if (share < 0.5) floor -= 4;

  let win = { min: floor, max };
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

/**
 * Fuerza de cada selección (0-100), según su pedigrí futbolístico real.
 * Define hasta dónde llega tu país en el Mundial y las copas continentales:
 * jugar para Brasil te acerca a la gloria; para Panamá necesitás una gesta.
 */
export const NATIONAL_STRENGTH = {
  // Sudamérica
  Brasil: 95, Argentina: 93, Uruguay: 78, Colombia: 74, Chile: 70,
  Ecuador: 66, Perú: 63, Paraguay: 62, Venezuela: 55, Bolivia: 52,
  // Europa
  Francia: 94, España: 92, Alemania: 91, Inglaterra: 88, Italia: 86,
  Portugal: 85, "Países Bajos": 83, Bélgica: 82, Croacia: 80, Dinamarca: 74,
  Suiza: 72, Serbia: 71, Polonia: 70, Suecia: 70, Ucrania: 69, Austria: 68,
  Turquía: 68, Gales: 67, Escocia: 66, "Rep. Checa": 68, Noruega: 70,
  Hungría: 65, Grecia: 66, Rumania: 64, Irlanda: 64, Eslovaquia: 63,
  Rusia: 70, Islandia: 62, Finlandia: 60, "Macedonia del Norte": 58,
  "Bosnia y Herzegovina": 63, Eslovenia: 62, Albania: 58, Montenegro: 55,
  Kosovo: 54, Georgia: 58, Armenia: 52, Bulgaria: 60, "Irlanda del Norte": 60,
  // Norte / Centroamérica y Caribe
  México: 72, "Estados Unidos": 70, Canadá: 66, "Costa Rica": 62, Panamá: 60,
  Honduras: 58, Jamaica: 58, "El Salvador": 54, Guatemala: 53, Haití: 52,
  "Trinidad y Tobago": 54, Curazao: 52, Cuba: 48,
  // Asia
  Japón: 72, "Corea del Sur": 70, Australia: 68, "Arabia Saudita": 66,
  Irán: 66, Catar: 62, Irak: 60, "Emiratos Árabes": 58, Uzbekistán: 58,
  China: 56, "Corea del Norte": 54, Jordania: 56, Bahréin: 52, Siria: 54,
  Tailandia: 54, Vietnam: 54, India: 48, Indonesia: 50, Malasia: 48,
  Líbano: 52, Palestina: 50, Omán: 54, Kuwait: 52,
  // África
  Marruecos: 74, Senegal: 72, Nigeria: 70, "Costa de Marfil": 68, Egipto: 68,
  Camerún: 67, Argelia: 67, Ghana: 66, Túnez: 65, Malí: 63, "Sudáfrica": 60,
  "Burkina Faso": 60, "Cabo Verde": 58, Guinea: 58, "Rep. Dem. Congo": 60,
  Angola: 57, Zambia: 55, Gabón: 55, Uganda: 52, Kenia: 50, Mozambique: 50,
  // Oceanía
  "Nueva Zelanda": 55,
};

/** Fuerza de la selección del jugador (default 50 para países sin fútbol de élite) */
export function nationalStrength(country) {
  return NATIONAL_STRENGTH[country] ?? 50;
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

/** Potencias por confederación para sortear el rival de una final */
const FINAL_RIVALS = {
  sa: ["Brasil", "Argentina", "Uruguay", "Colombia", "Chile", "Ecuador", "Perú", "Paraguay"],
  eu: ["Francia", "España", "Alemania", "Inglaterra", "Italia", "Portugal", "Países Bajos", "Croacia", "Bélgica"],
  na: ["México", "Estados Unidos", "Canadá", "Panamá", "Costa Rica", "Honduras"],
  as: ["Japón", "Corea del Sur", "Arabia Saudita", "Australia", "Irán", "Catar"],
  af: ["Marruecos", "Senegal", "Nigeria", "Egipto", "Costa de Marfil", "Camerún", "Argelia"],
};

/**
 * Rival de la final: una potencia de la confederación (copa continental) o de
 * cualquier parte del mundo (Mundial), nunca tu propio país.
 */
export function pickFinalRival(scope, country) {
  const pool =
    scope === "wc"
      ? Object.values(FINAL_RIVALS).flat()
      : FINAL_RIVALS[scope] || Object.values(FINAL_RIVALS).flat();
  const options = pool.filter((c) => c !== country);
  return options[Math.floor(Math.random() * options.length)];
}

/** Estrellas ficticias para el podio del Balón de Oro */
const STAR_SURNAMES = [
  "Moreau", "Okafor", "Yamazaki", "Kovacic", "Ferreira", "Bergkamp", "Diallo", "Rossi",
  "Novak", "Karlsen", "Mensah", "Petit", "Domínguez", "Weiss", "Castellanos", "Traoré",
  "Lindqvist", "Marchetti", "Sowah", "Beaumont", "Kramer", "Aldana", "Vermeulen", "Zubiri",
];
const STAR_CLUBS = [
  "Real Madrid", "Barcelona", "Man. City", "Liverpool", "Bayern München", "PSG",
  "Arsenal", "Inter", "Chelsea", "Atlético Madrid", "Juventus", "Dortmund",
];

/**
 * Podio del Balón de Oro de la temporada.
 * - Si lo ganaste: vos primero + dos estrellas generadas.
 * - Si no, pero tuviste una temporada enorme: podés colarte 2º o 3º.
 * Devuelve [{ name, club, you? } x3] o null si no hubo podio para vos.
 */
export function generateBallonPodium(player, rating, won) {
  const usedNames = new Set([player.name]);
  const usedClubs = new Set([player.team]);
  const star = () => {
    let name = STAR_SURNAMES[Math.floor(Math.random() * STAR_SURNAMES.length)];
    while (usedNames.has(name))
      name = STAR_SURNAMES[Math.floor(Math.random() * STAR_SURNAMES.length)];
    usedNames.add(name);
    let club = STAR_CLUBS[Math.floor(Math.random() * STAR_CLUBS.length)];
    while (usedClubs.has(club))
      club = STAR_CLUBS[Math.floor(Math.random() * STAR_CLUBS.length)];
    usedClubs.add(club);
    return { name: name.toUpperCase(), club };
  };

  const me = { name: player.name, club: player.team, you: true };

  if (won) return [me, star(), star()];

  // Cerca del premio: gran temporada de un jugador de élite
  if (rating >= 8 && player.overall >= 84 && Math.random() < 0.35) {
    const podium = [star(), star(), star()];
    podium[Math.random() < 0.5 ? 1 : 2] = me;
    return podium;
  }

  return null;
}

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

  // Fuerza de la SELECCIÓN (lo que más pesa: un solo crack no gana un Mundial)
  const natS = clamp((nationalStrength(player.nationality) - 58) / 40, 0, 1);
  // Aporte INDIVIDUAL del jugador (menor peso)
  const playerS = clamp(
    (player.overall - 70) / 34 + (player.reputation || 0) / 340,
    0,
    0.85
  );

  // El Mundial es más difícil que una copa continental (más rondas, mejores rivales)
  const floor = type === "wc" ? 0.12 : 0.18;
  const perRound = clamp(floor + natS * 0.55 + playerS * 0.2, 0.05, 0.92);

  let idx = 0;
  while (idx < table.length - 1 && Math.random() < perRound) idx++;
  const entry = table[idx];
  return { ...entry, isFinal: idx === table.length - 1 };
}

/**
 * Genera trofeos ganados en la temporada.
 * Cada trofeo es { t: tipo, n: nombre } — ej: { t: "liga", n: "Liga BetPlay" }.
 * Los premios individuales exigen números reales, no solo OVR.
 */
export function generateTrophies(player, stats = null, rating = 5) {
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

  // Balón de Oro: nivel de crack + temporada sobresaliente
  if (player.overall >= 85 && rating >= 7.5 && Math.random() < 0.14) {
    trophies.push({ t: "ballon", n: "Balón de Oro" });
  }

  // Bota de Oro: es para el MÁXIMO GOLEADOR — exige una barbaridad de goles
  // (el bloque cubre 2 temporadas, ~45 goles ≈ 22-23 por año)
  if (stats && stats.gls >= 55 && Math.random() < 0.45) {
    trophies.push({ t: "bota", n: "Bota de Oro" });
  }

  return trophies;
}

/**
 * Boost que otorga cada premio individual al ganarlo.
 * Devuelve { ovr, rep, morale } para aplicar al jugador.
 */
export const AWARD_BOOSTS = {
  ballon:      { ovr: 2, rep: 15, morale: 12 }, // Balón de Oro: el mayor salto
  bota:        { ovr: 1, rep: 8, morale: 8 },   // Bota de Oro (máximo goleador mundial)
  asis:        { ovr: 1, rep: 7, morale: 8 },   // Rey de Asistencias
  muro:        { ovr: 1, rep: 7, morale: 8 },   // Mejor Defensa
  gk1:         { ovr: 1, rep: 7, morale: 8 },   // Portero del Año
  golden:      { ovr: 2, rep: 8, morale: 10 },  // Revelación / Golden Boy (joven)
  mvp:         { ovr: 1, rep: 6, morale: 6 },   // MVP / Guante de Oro / Goleador de liga
  eoty:        { rep: 4, morale: 4 },           // Equipo del Año
};

/**
 * Premios individuales de la temporada según el rendimiento real.
 * Se calculan aparte de los títulos de equipo.
 */
export function generateAwards(player, stats, rating, age) {
  const awards = [];
  const leagueData = LEAGUES[player.league];
  const prestige = leagueData?.p ?? 60;
  const isGK = player.position === "GK";
  const isDef = ["CB", "LB", "RB"].includes(player.position);
  const isPlaymaker = ["CAM", "CM", "LM", "RM", "LW", "RW"].includes(player.position);
  const lg = player.league;

  // MVP de la liga: gran temporada + nivel acorde a la liga
  if (rating >= 8.5 && player.overall >= prestige - 6 && Math.random() < 0.35) {
    awards.push({ t: "mvp", n: `MVP de la ${lg}` });
  }

  // Equipo del año
  if (rating >= 7.5 && Math.random() < 0.4) {
    awards.push({ t: "eoty", n: `Equipo del Año · ${lg}` });
  }

  // Goleador de la liga (delanteros): números de goleador de verdad
  if (!isGK && stats.gls >= 40 && Math.random() < 0.55) {
    awards.push({ t: "bota", n: `Goleador de la ${lg}` });
  }

  // Rey de las Asistencias (creativos): reparte muchísimo juego
  if (isPlaymaker && stats.ast >= 28 && Math.random() < 0.55) {
    awards.push({ t: "asis", n: `Rey de Asistencias · ${lg}` });
  }

  // Mejor Defensa del Año (zagueros y laterales): temporada sólida jugando casi todo
  if (isDef && rating >= 7.8 && stats.pj >= (stats.pjMax || 85) * 0.75 && Math.random() < 0.45) {
    awards.push({ t: "muro", n: `Mejor Defensa · ${lg}` });
  }

  // Portero del Año (arqueros): gran temporada + muchas vallas invictas
  if (isGK && rating >= 7.8 && stats.vi >= stats.pj * 0.42 && Math.random() < 0.5) {
    awards.push({ t: "gk1", n: `Portero del Año · ${lg}` });
  }
  // Guante de Oro (arqueros): menos exigente que Portero del Año
  else if (isGK && stats.vi >= stats.pj * 0.34 && Math.random() < 0.45) {
    awards.push({ t: "mvp", n: `Guante de Oro · ${lg}` });
  }

  // Revelación del Año / Golden Boy: jugador joven con temporada sobresaliente
  if (age != null && age <= 22 && rating >= 8.2 && player.overall >= 72 && Math.random() < 0.4) {
    awards.push({ t: "golden", n: "Revelación del Año" });
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
export function addNationalCompetition(nt, player, name, pj, stage, extra = {}) {
  const base = nt || { comps: [] };
  const comps = [{ n: name, pj, stage, ...extra }, ...base.comps.filter((c) => c.n !== name)];
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
    ratio = 0.5 * (cleanRate / (0.3 * factor)) + 0.5 * clamp((1.35 - gcPerGame) / 0.45, 0, 2);
  } else {
    const isDef = ["CB", "LB", "RB"].includes(player.position);
    const contrib = (stats.gls + 0.6 * stats.ast) / Math.max(1, stats.pj);
    // 1.0 = la producción media esperada para su posición y nivel
    ratio = contrib / Math.max(0.03, expectedContribution(player.position, player.overall));
    // Defensores: jugar seguido ya es rendir
    if (isDef) ratio = Math.max(ratio, participation * 0.85);
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
