export { default as LEAGUES } from "./leagues";
export { default as ALL_COUNTRIES } from "./countries";
export { default as POS_MAP } from "./positions";
export { default as EVENTS } from "./events";
export { getTeamColor, teamTint } from "./teamColors";
export { getLogoUrl, LOGO_SEARCH_NAMES } from "./teamLogos";

export const AGES = Array.from({ length: 12 }, (_, i) => 16 + i * 2);

// Trofeos por id (se dibujan como SVG en components/Trophy.jsx)
export const TROPHY_NAMES = {
  liga: "Liga",
  copa: "Copa",
  ballon: "Balón de Oro",
  bota: "Bota de Oro",
  mundial: "Copa del Mundo",
};

export const PHASES = {
  SETUP: 0,
  CANTERA: 1,
  PLAYING: 2,
  EVENT: 3,
  TRANSFER: 4,
  OVER: 5,
};
