/** Persistencia de la partida en curso y del salón de la fama */

const SAVE_KEY = "careerSave_v1";
const HOF_KEY = "hallOfFame_v1";

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* sin espacio o modo privado */
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.player ? s : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* noop */
  }
}

export function getHallOfFame() {
  try {
    return JSON.parse(localStorage.getItem(HOF_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Guarda una carrera terminada (máx. 20, más reciente primero) */
export function addToHallOfFame(entry) {
  try {
    const list = getHallOfFame();
    list.unshift({ ...entry, date: Date.now() });
    localStorage.setItem(HOF_KEY, JSON.stringify(list.slice(0, 20)));
    return list;
  } catch {
    return [];
  }
}

export function clearHallOfFame() {
  try {
    localStorage.removeItem(HOF_KEY);
  } catch {
    /* noop */
  }
}
