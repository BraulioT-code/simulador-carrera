import { pick } from "./helpers";

/**
 * Titular de prensa generado a partir de la temporada jugada.
 * Devuelve un string corto listo para mostrar.
 */
export function generateHeadline({ player, stats, trophies, rating, league }) {
  const name = player.name;
  const team = player.team;
  const isGK = player.position === "GK";
  const bigTrophy = (trophies || []).find((t) =>
    ["mundial", "continental", "ballon"].includes(t.t)
  );
  const leagueTitle = (trophies || []).find((t) => t.t === "liga");

  if (bigTrophy) {
    return pick([
      `${name} levanta ${bigTrophy.n} y entra en la historia`,
      `Noche eterna: ${name} conquista ${bigTrophy.n}`,
      `${bigTrophy.n} para ${name}: el mundo habla de él`,
    ]);
  }

  if (leagueTitle) {
    return pick([
      `${team} campeón: ${name} fue clave en la ${leagueTitle.n}`,
      `${name} se corona en la ${leagueTitle.n} con ${team}`,
    ]);
  }

  if (isGK) {
    if (stats.vi >= stats.pj * 0.35) {
      return pick([
        `Muralla: ${name} dejó ${stats.vi} vallas invictas`,
        `${name}, el arquero menos batido del torneo`,
      ]);
    }
    if (stats.gc > stats.pj * 1.4) {
      return pick([
        `Temporada dura bajo los tres palos para ${name}`,
        `${team} sufre atrás: ${stats.gc} goles en contra`,
      ]);
    }
  } else {
    if (stats.gls >= 25) {
      return pick([
        `${name}, goleador con ${stats.gls} tantos en ${league}`,
        `Imparable: ${stats.gls} goles de ${name} en la temporada`,
        `${name} rompe las redes: ${stats.gls} goles con ${team}`,
      ]);
    }
    if (stats.ast >= 18) {
      return pick([
        `${name} reparte magia: ${stats.ast} asistencias`,
        `El socio ideal: ${stats.ast} pases gol de ${name}`,
      ]);
    }
    if (stats.gls >= 12) {
      return `${name} aporta ${stats.gls} goles en una buena temporada`;
    }
  }

  if (stats.pj < (stats.pjMax || 85) * 0.4) {
    return pick([
      `${name} pierde terreno en ${team}: pocos minutos`,
      `Temporada para el olvido: ${name} casi no jugó`,
    ]);
  }

  if (rating >= 8) {
    return `${name} fue de lo mejor de ${team} esta temporada`;
  }
  if (rating < 4) {
    return `Dudas con ${name}: el rendimiento no acompañó en ${team}`;
  }

  return pick([
    `${name} cumple una temporada regular en ${team}`,
    `${name} suma minutos y experiencia en ${team}`,
  ]);
}
