const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** true si el proyecto tiene credenciales configuradas en .env */
export const isBackendEnabled = Boolean(url && anonKey);

let clientPromise = null;

/**
 * Cliente de Supabase cargado bajo demanda: la librería solo se descarga
 * cuando el jugador abre el ranking o publica una carrera, así el juego
 * arranca liviano y funciona igual sin backend.
 */
export function getSupabase() {
  if (!isBackendEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(url, anonKey, { auth: { persistSession: false } })
      )
      .catch(() => null);
  }
  return clientPromise;
}
