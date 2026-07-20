import { useState, useCallback } from "react";
import { LEAGUES, EVENTS, PHASES } from "../data";
import { randInt, clamp, pick } from "../utils/helpers";
import {
  generateStats,
  getOffers,
  getDebutOffers,
  generateTrophies,
  calculateOvrDelta,
  shouldRetire,
  evaluateSeason,
} from "../utils/gameLogic";

const initialState = {
  player: null,
  history: [],
  offers: [],
  event: null,
  message: "",
  firstClub: "",
  canStay: true,
  phase: PHASES.SETUP,
};

export default function useCareerGame() {
  const [state, setState] = useState(initialState);

  const { player, history, offers, event, message, firstClub, canStay, phase } = state;

  const update = (changes) => setState((prev) => ({ ...prev, ...changes }));

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
    };

    update({
      player: newPlayer,
      offers: getDebutOffers(setup.country, 3),
      firstClub: "",
      phase: PHASES.CANTERA,
    });
  }, []);

  const pickClub = useCallback(
    (offer) => {
      const updatedPlayer = {
        ...player,
        team: offer.team,
        league: offer.league,
        contractYears: randInt(2, 4),
      };

      update({
        player: updatedPlayer,
        firstClub: firstClub || offer.team,
        message: `¡Fichaste por ${offer.team}!`,
        offers: [],
        phase: PHASES.PLAYING,
      });
    },
    [player, firstClub]
  );

  const simulate = useCallback(() => {
    if (!player) return;

    const stats = generateStats(player.position, player.overall, player.age);
    const trophies = generateTrophies(player);
    // Rendimiento real de la temporada: decide si el club quiere renovar
    const season = evaluateSeason(player, stats);

    const newHistory = [
      ...history,
      {
        age: player.age,
        team: player.team,
        league: player.league,
        ovr: player.overall,
        pj: stats.pj,
        gls: stats.gls,
        ast: stats.ast,
        gc: stats.gc,
        vi: stats.vi,
        trophies,
      },
    ];

    const delta = calculateOvrDelta(player.age);
    const newOvr = clamp(player.overall + delta, 40, 99);
    const newAge = player.age + 2;
    
    const updatedPlayer = {
      ...player,
      overall: newOvr,
      age: newAge,
      reputation: clamp(player.reputation + randInt(2, 8), 0, 100),
      contractYears: player.contractYears - 1,
    };

    if (shouldRetire(newAge, newOvr)) {
      update({
        player: updatedPlayer,
        history: newHistory,
        canStay: season.good,
        message: "",
        phase: PHASES.OVER,
      });
      return;
    }

    // Determinar siguiente fase
    const roll = Math.random();

    if (
      player.age >= 30 &&
      firstClub &&
      firstClub !== player.team &&
      Math.random() < 0.25
    ) {
      const leagueEntry = Object.entries(LEAGUES).find(([, l]) =>
        l.teams.includes(firstClub)
      );
      update({
        player: updatedPlayer,
        history: newHistory,
        canStay: season.good,
        message: "",
        event: {
          title: "Regreso triunfal",
          desc: "Tu primer club te propone volver para cerrar tu carrera como titular.",
          choices: [
            {
              label: `Volver a\n${firstClub}`,
              sub: leagueEntry?.[1]?.c || "",
              eff: { ret: true },
            },
            {
              label: `Quedarse en\n${player.team}`,
              sub: player.league,
              eff: {},
            },
          ],
        },
        phase: PHASES.EVENT,
      });
    } else if (roll < 0.4) {
      update({
        player: updatedPlayer,
        history: newHistory,
        canStay: season.good,
        message: "",
        event: { ...pick(EVENTS) },
        phase: PHASES.EVENT,
      });
    } else {
      update({
        player: updatedPlayer,
        history: newHistory,
        canStay: season.good,
        message: "",
        offers: getOffers(3, player.team),
        phase: PHASES.TRANSFER,
      });
    }
  }, [player, history, firstClub]);

  const handleChoice = useCallback(
    (choice) => {
      if (!player) return;
      let changes = {};
      let msg = choice.label.replace(/\n/g, " ");
      const eff = choice.eff;

      if (!eff || Object.keys(eff).length === 0) {
        update({
          offers: getOffers(3, player.team),
          phase: PHASES.TRANSFER,
        });
        return;
      }

      if (eff === "gamble") {
        if (Math.random() < 0.7) {
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
    [player, firstClub]
  );

  const stay = useCallback(() => {
    update({
      offers: [],
      message: `Te quedás en ${player?.team}`,
      phase: PHASES.PLAYING,
    });
  }, [player]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    player,
    history,
    offers,
    event,
    message,
    canStay,
    phase,
    startGame,
    pickClub,
    simulate,
    handleChoice,
    stay,
    reset,
  };
}
