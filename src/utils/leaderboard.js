import { getSupabase, isBackendEnabled } from "../lib/supabase";

const ALIAS_KEY = "leaderboardAlias_v1";
const PUBLISHED_KEY = "publishedCareers_v1";

export { isBackendEnabled };

/* ------------------------------------------------------------------ */
/* Alias local                                                         */
/* ------------------------------------------------------------------ */

export function getAlias() {
  try {
    return localStorage.getItem(ALIAS_KEY) || "";
  } catch {
    return "";
  }
}

export function saveAlias(alias) {
  try {
    localStorage.setItem(ALIAS_KEY, alias);
  } catch {
    /* modo privado */
  }
}

/* ------------------------------------------------------------------ */
/* Marcas de carreras ya publicadas (para no duplicar)                 */
/* ------------------------------------------------------------------ */

/** Identificador local de una carrera: nombre + temporadas jugadas */
export function careerKey(player, history) {
  return `${player.name}-${player.nationality}-${history.length}-${history
    .map((h) => `${h.age}:${h.ovr}:${h.pj}`)
    .join(",")}`;
}

export function isPublished(key) {
  try {
    return JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "[]").includes(key);
  } catch {
    return false;
  }
}

function markPublished(key) {
  try {
    const list = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "[]");
    list.push(key);
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(list.slice(-50)));
  } catch {
    /* modo privado */
  }
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Publica la carrera en el ranking global.
 * El servidor revalida los datos y recalcula el puntaje, así que el valor
 * que devuelve es el oficial (puede diferir del local si algo no cuadra).
 */
export async function submitCareer({ alias, player, history, natData }) {
  if (!isBackendEnabled) {
    return { ok: false, error: "El ranking global no está configurado" };
  }

  const payload = {
    alias: alias.trim(),
    player_name: player.name,
    nationality: natData?.n || player.nationality,
    position: player.position,
    number: player.number,
    club: player.team,
    league: player.league,
    int_caps: player.intCaps || 0,
    earnings: player.earnings || 0,
    reputation: player.reputation ?? 20,
    morale: player.morale ?? 70,
    trophies: history.flatMap((h) => h.trophies || []),
    // Datos para revalidar el puntaje y para mostrar la carrera completa
    seasons: history.map((h) => ({
      age: h.age,
      ovr: h.ovr,
      pj: h.pj,
      pjMax: h.pjMax || null,
      gls: h.gls,
      ast: h.ast,
      gc: h.gc || 0,
      vi: h.vi || 0,
      team: h.team,
      league: h.league,
      nt: h.nt || null,
      ballonPodium: h.ballonPodium || null,
      trophies: h.trophies || [],
    })),
  };

  try {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc("submit_career", { payload });

    if (error) {
      console.error("[leaderboard] submit_career:", error);
      return { ok: false, error: error.message || "Error del servidor" };
    }

    markPublished(careerKey(player, history));
    saveAlias(alias.trim());
    return { ok: true, career: data };
  } catch (err) {
    console.error("[leaderboard] submit:", err);
    return { ok: false, error: err?.message || "No se pudo conectar con el servidor" };
  }
}

/** Carrera completa de una publicación del ranking (incluye temporadas) */
export async function fetchCareer(id) {
  if (!isBackendEnabled) return { ok: false, error: "no-config", career: null };

  try {
    const sb = await getSupabase();
    const { data, error } = await sb.from("careers").select("*").eq("id", id).single();
    if (error) return { ok: false, error: error.message, career: null };
    return { ok: true, career: data };
  } catch (err) {
    console.error("[leaderboard] detalle:", err);
    return { ok: false, error: err?.message || "sin conexión", career: null };
  }
}

/** Top del ranking global */
export async function fetchTopCareers(limit = 50) {
  if (!isBackendEnabled) return { ok: false, error: "no-config", careers: [] };

  try {
    const sb = await getSupabase();

    // Sin el detalle de temporadas: se pide solo al abrir una carrera
    const { data, error } = await sb
      .from("careers")
      .select(
        "id, alias, player_name, nationality, position, number, club, league, score, title, peak_ovr, pj, gls, ast, int_caps, earnings, trophies, created_at"
      )
      .order("score", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error) {
      console.error("[leaderboard] top:", error);
      return { ok: false, error: error.message, careers: [] };
    }
    return { ok: true, careers: data || [] };
  } catch (err) {
    console.error("[leaderboard] top:", err);
    return { ok: false, error: err?.message || "sin conexión", careers: [] };
  }
}
