const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** true si el proyecto tiene credenciales configuradas en .env */
export const isBackendEnabled = Boolean(url && anonKey);

let clientPromise = null;

/**
 * Cliente de Supabase cargado bajo demanda: la librería solo se descarga
 * cuando el jugador abre el ranking o publica una carrera, así el juego
 * arranca liviano y funciona igual sin backend.
 *
 * Lanza el error original si algo falla, para poder mostrarlo en pantalla.
 */
export function getSupabase() {
  if (!isBackendEnabled) {
    return Promise.reject(
      new Error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY")
    );
  }

  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(url, anonKey, { auth: { persistSession: false } })
      )
      .catch((err) => {
        clientPromise = null; // permite reintentar
        throw err;
      });
  }
  return clientPromise;
}
