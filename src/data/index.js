export { default as LEAGUES } from "./leagues";
export { default as ALL_COUNTRIES } from "./countries";
export { default as POS_MAP } from "./positions";
export { default as EVENTS } from "./events";

export const AGES = Array.from({ length: 12 }, (_, i) => 16 + i * 2);

export const TROPHY_NAMES = {
  "🏆": "Liga",
  "🏅": "Copa",
  "⭐": "Balón de Oro",
  "👟": "Bota de Oro",
  "🌍": "Copa del Mundo",
};

export const PHASES = {
  SETUP: 0,
  CANTERA: 1,
  PLAYING: 2,
  EVENT: 3,
  TRANSFER: 4,
  OVER: 5,
};
