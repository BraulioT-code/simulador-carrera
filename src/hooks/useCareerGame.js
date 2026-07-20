import { useState, useCallback, useEffect, useRef } from "react";
import { LEAGUES, EVENTS, PHASES, areRivals } from "../data";
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
  getDebutOffers,
  generateTrophies,
  generateAwards,
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

  /** Suma los partidos de un torneo de selección a la última temporada */
  const addCompetition = (hist, p, name, pj, stage) => {
    if (!hist.length) return hist;
    const copy = [...hist];
    const last = { ...copy[copy.length - 1] };
    last.nt = addNationalCompetition(last.nt, p, name, pj, stage);
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
    if (!player) return;

    const stats = generateStats(player.position, player.overall, player.age);
    // Minutos reducidos por decisiones de eventos (ej: conflicto con el DT)
    if (player.pjPenalty) {
      stats.pj = Math.max(5, Math.round(stats.pj * player.pjPenalty));
    }
    const season = evaluateSeason(player, stats);
    const trophies = [
      ...generateTrophies(player),
      ...generateAwards(player, stats, season.rating),
    ];

    // Ciclo con la selección: eliminatorias + amistosos (los torneos se suman al resolverse)
    const region = regionOf(player.nationality);
    const hasNT = (player.intCaps || 0) > 0;
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
        trophies,
      },
    ];

    // El crecimiento de OVR depende de la edad y del rendimiento de la temporada
    const delta = calculateOvrDelta(player.age, season.rating);
    const newOvr = clamp(player.overall + delta, 40, 99);
    const newAge = player.age + 2;
    const salary = player.salary || estimateSalary(player);

    const updatedPlayer = {
      ...player,
      overall: newOvr,
      age: newAge,
      reputation: clamp(player.reputation + randInt(2, 8), 0, 100),
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
      message: "",
      headline: seasonHeadline,
      celebration: celebrate,
    };

    const cupName = nationalCupName(player.nationality);

    // Mundial cada 4 años (18, 22, 26…) si tenés partidos con la selección
    if (isWorldCupYear(player.age) && hasNT) {
      update({
        ...base,
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

    // Copa continental en los años intermedios (20, 24, 28…)
    if (isContinentalCupYear(player.age) && hasNT) {
      const run = resolveTournamentRun(player, continentalCupType(region));
      const histWithCup = addCompetition(newHistory, updatedPlayer, cupName, run.matches, run.stage);

      if (run.isFinal) {
        update({
          ...base,
          history: histWithCup,
          event: {
            type: "penal",
            title: "Penal decisivo",
            desc: `Te toca definir la final de la ${cupName}.`,
            trophy: { t: "continental", n: cupName },
            choices: [
              { label: "Izquierda", eff: "penalty" },
              { label: "Derecha", eff: "penalty" },
            ],
          },
          phase: PHASES.EVENT,
        });
        return;
      }

      update({
        ...base,
        history: histWithCup,
        message: `${cupName}: tu selección quedó eliminada en ${run.stage.toLowerCase()}`,
        offers: getOffers(3, player.team),
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
        const offer = getOffers(1, player.team)[0];
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
      update({ ...base, offers: getOffers(3, player.team), phase: PHASES.TRANSFER });
    }
  }, [player, history, firstClub]);

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
        update({ offers: getOffers(3, player.team), phase: PHASES.TRANSFER });
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
        const hist = addCompetition(history, p, "Copa del Mundo", run.matches, run.stage);

        if (run.isFinal) {
          update({
            player: p,
            history: hist,
            message: "",
            event: {
              type: "penal",
              title: "Penal decisivo",
              desc: "Te toca definir la final de la Copa del Mundo.",
              trophy: { t: "mundial", n: "Copa del Mundo" },
              choices: [
                { label: "Izquierda", eff: "penalty" },
                { label: "Derecha", eff: "penalty" },
              ],
            },
            phase: PHASES.EVENT,
          });
          return;
        }

        update({
          player: p,
          history: hist,
          message: `Mundial: tu selección quedó eliminada en ${run.stage.toLowerCase()} (${run.matches} PJ)`,
          offers: getOffers(3, player.team),
          phase: PHASES.TRANSFER,
        });
        return;
      }

      /* ===== Penal decisivo ===== */
      if (eff === "penalty") {
        const scored = Math.random() < 0.65;
        const trophy = event?.trophy;

        if (scored) {
          const p = {
            ...player,
            reputation: clamp(player.reputation + 15, 0, 100),
            morale: clamp(player.morale + 10, 0, 100),
            overall: clamp(player.overall + 1, 40, 99),
          };
          update({
            player: p,
            history: trophy ? awardTrophy(history, trophy) : history,
            celebration: trophy || null,
            message: trophy
              ? `¡GOL! Campeones de la ${trophy.n}`
              : "¡GOL! Definiste la final y sos leyenda nacional",
            offers: getOffers(3, player.team),
            phase: PHASES.TRANSFER,
          });
        } else {
          update({
            player: {
              ...player,
              reputation: clamp(player.reputation - 8, 0, 100),
              morale: clamp(player.morale - 10, 0, 100),
            },
            message: "El arquero adivinó… fallaste el penal decisivo",
            offers: getOffers(3, player.team),
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
          offers: getOffers(3, player.team),
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
