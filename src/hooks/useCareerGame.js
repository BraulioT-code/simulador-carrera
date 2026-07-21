import { useState, useCallback, useEffect, useRef } from "react";
import { LEAGUES, EVENTS, PHASES, areRivals, getClubRating } from "../data";
import { randInt, clamp, pickWeighted } from "../utils/helpers";
import {
  generateStats,
  generateNationalStats,
  addNationalCompetition,
  resolveTournamentRun,
  continentalCupType,
  isContinentalCupYear,
  regionOf,
  getOffers,
  offerWindow,
  getDebutOffers,
  generateTrophies,
  generateAwards,
  AWARD_BOOSTS,
  pickFinalRival,
  generateBallonPodium,
  calculateOvrDelta,
  shouldRetire,
  evaluateSeason,
  isWorldCupYear,
  nationalCupName,
  estimateSalary,
} from "../utils/gameLogic";
import { generateHeadline } from "../utils/headlines";
import { legendScore, legendTitle } from "../utils/legend";
import { saveGame, loadGame, clearSave, addToHallOfFame } from "../utils/careerStore";

const initialState = {
  player: null,
  history: [],
  offers: [],
  event: null,
  message: "",
  headline: "",
  firstClub: "",
  canStay: true,
  offerWin: null,
  celebration: null,
  phase: PHASES.SETUP,
};

// Qué trofeo se celebra primero cuando se ganan varios
const CELEBRATION_ORDER = ["mundial", "continental", "ballon", "liga", "copa", "bota", "mvp", "eoty"];

function topTrophy(list) {
  if (!list?.length) return null;
  return [...list].sort(
    (a, b) => CELEBRATION_ORDER.indexOf(a.t) - CELEBRATION_ORDER.indexOf(b.t)
  )[0];
}

export default function useCareerGame() {
  const [state, setState] = useState(() => loadGame() || initialState);
  const hydrated = useRef(false);

  const {
    player,
    history,
    offers,
    event,
    message,
    headline,
    firstClub,
    canStay,
    offerWin,
    celebration,
    phase,
  } = state;

  // Guardado automático de la partida en curso
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    if (state.phase === PHASES.SETUP) clearSave();
    else saveGame(state);
  }, [state]);

  const update = (changes) => setState((prev) => ({ ...prev, ...changes }));

  /** Suma un trofeo a la última temporada jugada y lo devuelve para celebrar */
  const awardTrophy = (hist, trophy) => {
    if (!hist.length) return hist;
    const copy = [...hist];
    const last = { ...copy[copy.length - 1] };
    last.trophies = [...(last.trophies || []), trophy];
    copy[copy.length - 1] = last;
    return copy;
  };

  /**
   * Resuelve una final de selección contra un rival concreto.
   * La mitad de las finales se definen desde el punto del penal (evento jugable);
   * la otra mitad se simula directamente, con un 50/50 de ganar el título.
   */
  const resolveFinal = (hist, p, trophy, base = {}, finalInfo = null) => {
    const vsTxt = finalInfo?.rival ? ` contra ${finalInfo.rival}` : "";

    if (Math.random() < 0.5) {
      update({
        ...base,
        player: p,
        history: hist,
        message: "",
        event: {
          type: "penal",
          title: "Penal decisivo",
          desc: `Te toca definir la final de la ${trophy.n}${vsTxt}.`,
          trophy,
          finalInfo,
          choices: [
            { label: "Izquierda", eff: "penalty" },
            { label: "Derecha", eff: "penalty" },
          ],
        },
        phase: PHASES.EVENT,
      });
      return;
    }

    const won = Math.random() < 0.5;
    const histResolved = finalInfo
      ? setCompResult(hist, finalInfo.compName, won)
      : hist;

    update({
      ...base,
      player: won
        ? {
            ...p,
            reputation: clamp(p.reputation + 12, 0, 100),
            morale: clamp(p.morale + 10, 0, 100),
          }
        : { ...p, morale: clamp(p.morale - 6, 0, 100) },
      history: won ? awardTrophy(histResolved, trophy) : histResolved,
      celebration: won ? trophy : null,
      message: won
        ? `¡Campeones de la ${trophy.n}! Vencieron a ${finalInfo?.rival || "un gran rival"} en la final`
        : `Subcampeones: ${finalInfo?.rival || "el rival"} se quedó con la final de la ${trophy.n}`,
      offers: getOffers(3, p.team, base.offerWin ?? offerWin),
      phase: PHASES.TRANSFER,
    });
  };

  /** Suma los partidos de un torneo de selección a la última temporada */
  const addCompetition = (hist, p, name, pj, stage, extra = {}) => {
    if (!hist.length) return hist;
    const copy = [...hist];
    const last = { ...copy[copy.length - 1] };
    last.nt = addNationalCompetition(last.nt, p, name, pj, stage, extra);
    copy[copy.length - 1] = last;
    return copy;
  };

  /** Marca el resultado de la final (ganada/perdida) en la competencia */
  const setCompResult = (hist, compName, won) => {
    if (!hist.length || !compName) return hist;
    const copy = [...hist];
    const last = { ...copy[copy.length - 1] };
    if (!last.nt?.comps) return hist;
    last.nt = {
      ...last.nt,
      comps: last.nt.comps.map((c) => (c.n === compName ? { ...c, won } : c)),
    };
    copy[copy.length - 1] = last;
    return copy;
  };

  const startGame = useCallback((setup) => {
    const newPlayer = {
      name: setup.surname,
      number: setup.number,
      foot: setup.foot,
      nationality: setup.country,
      position: setup.position,
      age: 16,
      overall: randInt(45, 55),
      morale: 70,
      reputation: 20,
      intCaps: 0,
      team: "Libre",
      league: "-",
      contractYears: 0,
      salary: 0,
      earnings: 0,
    };

    setState({
      ...initialState,
      player: newPlayer,
      offers: getDebutOffers(setup.country, 3),
      phase: PHASES.CANTERA,
    });
  }, []);

  const pickClub = useCallback(
    (offer) => {
      const rival = areRivals(player.team, offer.team);
      const updatedPlayer = {
        ...player,
        team: offer.team,
        league: offer.league,
        contractYears: randInt(2, 4),
        morale: clamp(player.morale + (rival ? -15 : 0), 0, 100),
        reputation: clamp(player.reputation + (rival ? -5 : 0), 0, 100),
        salary: estimateSalary({ ...player, league: offer.league }),
      };

      update({
        player: updatedPlayer,
        firstClub: firstClub || offer.team,
        message: rival
          ? `¡Fichaste por ${offer.team}, el clásico rival! La hinchada de ${player.team} no te lo perdona`
          : `¡Fichaste por ${offer.team}!`,
        offers: [],
        phase: PHASES.PLAYING,
      });
    },
    [player, firstClub]
  );

  const simulate = useCallback(() => {
    // Solo se puede simular en fase PLAYING: evita que un doble clic (o un
    // estado inconsistente) procese dos veces la misma temporada.
    if (!player || phase !== PHASES.PLAYING) return;

    const stats = generateStats(player.position, player.overall, player.age);
    // Minutos reducidos por decisiones de eventos (ej: conflicto con el DT)
    if (player.pjPenalty) {
      stats.pj = Math.max(5, Math.round(stats.pj * player.pjPenalty));
    }
    const season = evaluateSeason(player, stats);
    const trophies = [
      ...generateTrophies(player, stats, season.rating),
      ...generateAwards(player, stats, season.rating, player.age),
    ];

    // Boost por premios individuales ganados esta temporada
    const boost = trophies.reduce(
      (acc, t) => {
        const b = AWARD_BOOSTS[t.t];
        if (b) {
          acc.ovr += b.ovr || 0;
          acc.rep += b.rep || 0;
          acc.morale += b.morale || 0;
        }
        return acc;
      },
      { ovr: 0, rep: 0, morale: 0 }
    );

    // Podio del Balón de Oro (si lo ganaste, o si te colaste 2º/3º)
    const ballonPodium = generateBallonPodium(
      player,
      season.rating,
      trophies.some((t) => t.t === "ballon" && t.n === "Balón de Oro")
    );

    // Ciclo con la selección: eliminatorias + amistosos (los torneos se suman al resolverse)
    const region = regionOf(player.nationality);
    // Nivel de los clubes que se van a interesar, según cómo te fue
    const clubRating = getClubRating(player.team, player.league);
    // Tiene en cuenta OVR, minutos, goles y asistencias de la temporada
    const window = offerWindow(clubRating, season, player, stats);
    // Convocatoria automática por mérito: un titular consolidado (OVR ≥ 72)
    // con una temporada sólida (nota ≥ 6.5) empieza a ser tenido en cuenta por
    // su selección, aunque nunca haya salido el evento de convocatoria.
    const firstCallUp =
      (player.intCaps || 0) === 0 && player.overall >= 72 && season.rating >= 6.5;
    const hasNT = (player.intCaps || 0) > 0 || firstCallUp;
    const nt = hasNT ? generateNationalStats(player, region) : null;

    const seasonHeadline = generateHeadline({
      player,
      stats,
      trophies,
      rating: season.rating,
      league: player.league,
    });

    const newHistory = [
      ...history,
      {
        age: player.age,
        team: player.team,
        league: player.league,
        ovr: player.overall,
        pj: stats.pj,
        pjMax: stats.pjMax,
        gls: stats.gls,
        ast: stats.ast,
        gc: stats.gc,
        vi: stats.vi,
        rating: season.rating,
        headline: seasonHeadline,
        nt,
        ballonPodium,
        trophies,
      },
    ];

    // El crecimiento de OVR depende de la edad, el rendimiento y los premios
    const delta = calculateOvrDelta(player.age, season.rating) + boost.ovr;
    const newOvr = clamp(player.overall + delta, 40, 99);
    const newAge = player.age + 2;
    const salary = player.salary || estimateSalary(player);

    const updatedPlayer = {
      ...player,
      overall: newOvr,
      age: newAge,
      reputation: clamp(player.reputation + randInt(2, 8) + boost.rep, 0, 100),
      morale: clamp((player.morale || 70) + boost.morale, 0, 100),
      contractYears: player.contractYears - 1,
      pjPenalty: null,
      intCaps: (player.intCaps || 0) + (nt?.caps || 0),
      intGls: (player.intGls || 0) + (nt?.gls || 0),
      earnings: Math.round(((player.earnings || 0) + salary * 2) * 10) / 10,
      salary: estimateSalary({ ...player, overall: newOvr, age: newAge }),
    };

    const celebrate = topTrophy(trophies);

    if (shouldRetire(newAge, newOvr)) {
      const score = legendScore({ player: updatedPlayer, history: newHistory });
      addToHallOfFame({
        name: player.name,
        nationality: player.nationality,
        position: player.position,
        number: player.number,
        team: player.team,
        league: player.league,
        peakOvr: Math.max(...newHistory.map((h) => h.ovr), updatedPlayer.overall),
        pj: newHistory.reduce((s, h) => s + h.pj, 0),
        gls: newHistory.reduce((s, h) => s + h.gls, 0),
        ast: newHistory.reduce((s, h) => s + h.ast, 0),
        trophies: newHistory.flatMap((h) => h.trophies || []),
        earnings: updatedPlayer.earnings,
        score,
        title: legendTitle(score),
      });
      clearSave();
      update({
        player: updatedPlayer,
        history: newHistory,
        canStay: season.good,
        message: "",
        headline: seasonHeadline,
        celebration: celebrate,
        phase: PHASES.OVER,
      });
      return;
    }

    const base = {
      player: updatedPlayer,
      history: newHistory,
      canStay: season.good,
      message: firstCallUp
        ? `¡Primera convocatoria a la selección de ${player.nationality}!`
        : "",
      headline: seasonHeadline,
      celebration: celebrate,
      offerWin: window,
    };

    const cupName = nationalCupName(player.nationality);

    // Mundial: disponible desde los 18 hasta el retiro, con la regla de que
    // NUNCA puede haber menos de 4 años entre un Mundial y el siguiente.
    // - Sin Mundiales jugados: se ancla al calendario (18, 22, 26…).
    // - Con un Mundial jugado: el próximo es exactamente 4+ años después del
    //   último, aunque el estado venga de una partida vieja o desincronizada.
    const canPlayWC =
      hasNT &&
      player.age >= 18 &&
      (player.lastWC == null
        ? isWorldCupYear(player.age)
        : player.age - player.lastWC >= 4);

    if (canPlayWC) {
      update({
        ...base,
        player: { ...updatedPlayer, lastWC: player.age },
        event: {
          type: "worldcup",
          title: "Copa del Mundo",
          desc: `Tu selección disputa el Mundial. ${player.name} viaja como parte del plantel.`,
          choices: [
            {
              label: "Jugar el Mundial",
              visual: "flag",
              fx: [{ t: "Sumás partidos internacionales", g: true }],
              eff: "worldcup",
            },
          ],
        },
        phase: PHASES.EVENT,
      });
      return;
    }

    // Copa continental (Copa América, Eurocopa…): en la realidad el intervalo
    // varía (2, 3 o 4 años). Acá:
    // - Sin copas jugadas: se ancla a los años intermedios (20, 24, 28…).
    // - Con una jugada: la próxima llega según el intervalo sorteado (2 o 4
    //   años, ya que las temporadas avanzan de a 2), nunca antes.
    const canPlayCC =
      hasNT &&
      player.age >= 18 &&
      (player.lastCC == null
        ? isContinentalCupYear(player.age)
        : player.age - player.lastCC >= (player.ccGap ?? 4));

    if (canPlayCC) {
      const run = resolveTournamentRun(player, continentalCupType(region));
      const playerAfterCup = {
        ...updatedPlayer,
        lastCC: player.age,
        ccGap: Math.random() < 0.45 ? 2 : 4,
      };
      const rival = run.isFinal ? pickFinalRival(region, player.nationality) : null;
      const histWithCup = addCompetition(
        newHistory,
        playerAfterCup,
        cupName,
        run.matches,
        run.stage,
        rival ? { rival } : {}
      );

      if (run.isFinal) {
        resolveFinal(
          histWithCup,
          playerAfterCup,
          { t: "continental", n: cupName },
          base,
          { compName: cupName, rival }
        );
        return;
      }

      update({
        ...base,
        player: playerAfterCup,
        history: histWithCup,
        message: `${cupName}: tu selección quedó eliminada en ${run.stage.toLowerCase()}`,
        offers: getOffers(3, player.team, window),
        phase: PHASES.TRANSFER,
      });
      return;
    }

    const roll = Math.random();

    if (player.age >= 30 && firstClub && firstClub !== player.team && Math.random() < 0.25) {
      const leagueEntry = Object.entries(LEAGUES).find(([, l]) => l.teams.includes(firstClub));
      update({
        ...base,
        event: {
          title: "Regreso triunfal",
          desc: "Tu primer club te propone volver para cerrar tu carrera como titular.",
          choices: [
            {
              label: `Volver a\n${firstClub}`,
              sub: leagueEntry?.[1]?.c || "",
              fx: [{ t: "Cierre soñado en casa", g: true }],
              eff: { ret: true },
            },
            {
              label: `Quedarse en\n${player.team}`,
              sub: player.league,
              fx: [{ t: "Continuidad", g: true }],
              eff: {},
            },
          ],
        },
        phase: PHASES.EVENT,
      });
    } else if (roll < 0.55) {
      let ev;
      const r2 = Math.random();

      if (r2 < 0.15) {
        const offer = getOffers(1, player.team, window)[0];
        ev = {
          title: "Declaración polémica",
          desc: "Criticás públicamente al entrenador tras una derrota dura y el vestuario se puso tenso.",
          choices: [
            {
              label: "Pedir disculpas",
              fx: [{ t: "Disminuyen tus minutos", g: false }],
              eff: { pjPenalty: 0.7 },
            },
            { transfer: offer, eff: {} },
          ],
        };
      } else if (r2 < 0.3 && (player.intCaps || 0) > 0) {
        ev = {
          title: "Conflicto Club-Selección",
          desc: "Tu club se niega a permitirte jugar un amistoso preparatorio con tu selección.",
          choices: [
            {
              label: "Ir igual",
              visual: "flag",
              fx: [
                { t: `Convocado a ${cupName}`, g: true },
                { t: "Te cuelgan en tu club", g: false },
              ],
              eff: { intCaps: true, rep: 8, pjPenalty: 0.7 },
            },
            {
              label: "Acatar",
              visual: "club",
              fx: [
                { t: "Tu rol en el club no se modifica", g: true },
                { t: `No te convocan a ${cupName}`, g: false },
              ],
              eff: { morale: -3 },
            },
          ],
        };
      } else {
        ev = { ...pickWeighted(EVENTS) };
      }

      update({ ...base, event: ev, phase: PHASES.EVENT });
    } else {
      update({ ...base, offers: getOffers(3, player.team, window), phase: PHASES.TRANSFER });
    }
    // "phase" debe estar en las dependencias: el guard de arriba la usa, y sin
    // esto el botón quedaba muerto tras "Quedarse en tu club" (fase capturada vieja)
  }, [player, history, firstClub, phase]);

  const handleChoice = useCallback(
    (choice) => {
      if (!player) return;

      // Elección de fichaje dentro de un evento
      if (choice.transfer) {
        const o = choice.transfer;
        const rival = areRivals(player.team, o.team);
        update({
          player: {
            ...player,
            team: o.team,
            league: o.league,
            contractYears: randInt(2, 4),
            pjPenalty: null,
            morale: clamp(player.morale + (rival ? -15 : 0), 0, 100),
            salary: estimateSalary({ ...player, league: o.league }),
          },
          message: rival
            ? `Fichaste por ${o.team}, el clásico rival. Te espera un recibimiento hostil`
            : `¡Fichaste por ${o.team}!`,
          phase: PHASES.PLAYING,
        });
        return;
      }

      let changes = {};
      let msg = (choice.label || "").replace(/\n/g, " ");
      const eff = choice.eff;

      if (!eff || Object.keys(eff).length === 0) {
        update({ offers: getOffers(3, player.team, offerWin), phase: PHASES.TRANSFER });
        return;
      }

      /* ===== Mundial ===== */
      if (eff === "worldcup") {
        const run = resolveTournamentRun(player, "wc");
        const p = {
          ...player,
          intCaps: (player.intCaps || 0) + run.matches,
          reputation: clamp(player.reputation + 6, 0, 100),
        };
        const rival = run.isFinal ? pickFinalRival("wc", player.nationality) : null;
        const hist = addCompetition(
          history,
          p,
          "Copa del Mundo",
          run.matches,
          run.stage,
          rival ? { rival } : {}
        );

        if (run.isFinal) {
          resolveFinal(hist, p, { t: "mundial", n: "Copa del Mundo" }, {}, {
            compName: "Copa del Mundo",
            rival,
          });
          return;
        }

        update({
          player: p,
          history: hist,
          message: `Mundial: tu selección quedó eliminada en ${run.stage.toLowerCase()} (${run.matches} PJ)`,
          offers: getOffers(3, player.team, offerWin),
          phase: PHASES.TRANSFER,
        });
        return;
      }

      /* ===== Penal decisivo ===== */
      if (eff === "penalty") {
        const scored = Math.random() < 0.65;
        const trophy = event?.trophy;
        const finalInfo = event?.finalInfo;
        const rivalTxt = finalInfo?.rival ? ` ante ${finalInfo.rival}` : "";
        const histResolved = finalInfo
          ? setCompResult(history, finalInfo.compName, scored)
          : history;

        if (scored) {
          const p = {
            ...player,
            reputation: clamp(player.reputation + 15, 0, 100),
            morale: clamp(player.morale + 10, 0, 100),
            overall: clamp(player.overall + 1, 40, 99),
          };
          update({
            player: p,
            history: trophy ? awardTrophy(histResolved, trophy) : histResolved,
            celebration: trophy || null,
            message: trophy
              ? `¡GOL! Campeones de la ${trophy.n}${rivalTxt}`
              : "¡GOL! Definiste la final y sos leyenda nacional",
            offers: getOffers(3, player.team, offerWin),
            phase: PHASES.TRANSFER,
          });
        } else {
          update({
            player: {
              ...player,
              reputation: clamp(player.reputation - 8, 0, 100),
              morale: clamp(player.morale - 10, 0, 100),
            },
            history: histResolved,
            message: `El arquero adivinó… fallaste el penal decisivo${rivalTxt}`,
            offers: getOffers(3, player.team, offerWin),
            phase: PHASES.TRANSFER,
          });
        }
        return;
      }

      if (eff === "gamble") {
        const success = choice.resolved ?? Math.random() < 0.7;
        if (success) {
          changes = { overall: clamp(player.overall + 3, 40, 99) };
          msg = "+3 OVR ¡Éxito!";
        } else {
          changes = { overall: clamp(player.overall - 2, 40, 99) };
          msg = "-2 OVR. Lesión.";
        }
      } else {
        if (eff.ovr) changes.overall = clamp(player.overall + eff.ovr, 40, 99);
        if (eff.rep) changes.reputation = clamp(player.reputation + eff.rep, 0, 100);
        if (eff.morale) changes.morale = clamp(player.morale + eff.morale, 0, 100);
        if (eff.intCaps) changes.intCaps = (player.intCaps || 0) + randInt(3, 8);
        if (eff.pjPenalty) changes.pjPenalty = eff.pjPenalty;

        if (eff.ret && firstClub) {
          const lg =
            Object.entries(LEAGUES).find(([, l]) => l.teams.includes(firstClub))?.[0] ||
            player.league;
          changes = { team: firstClub, league: lg, contractYears: randInt(2, 3) };
          msg = `¡Volviste a ${firstClub}!`;
        }
      }

      const updatedPlayer = { ...player, ...changes };

      if (eff.ret) {
        update({ player: updatedPlayer, message: msg, phase: PHASES.PLAYING });
      } else {
        update({
          player: updatedPlayer,
          message: msg,
          offers: getOffers(3, player.team, offerWin),
          phase: PHASES.TRANSFER,
        });
      }
    },
    [player, history, firstClub, event]
  );

  const stay = useCallback(() => {
    update({
      offers: [],
      message: `Te quedás en ${player?.team}`,
      phase: PHASES.PLAYING,
    });
  }, [player]);

  const reset = useCallback(() => {
    clearSave();
    setState(initialState);
  }, []);

  const dismissCelebration = useCallback(() => update({ celebration: null }), []);

  return {
    player,
    history,
    offers,
    event,
    message,
    headline,
    canStay,
    celebration,
    phase,
    startGame,
    pickClub,
    simulate,
    handleChoice,
    stay,
    reset,
    dismissCelebration,
  };
}
