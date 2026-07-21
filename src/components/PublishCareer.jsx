import { useState } from "react";
import { legendColor } from "../utils/legend";
import { getAlias, submitCareer } from "../utils/leaderboard";

/**
 * Diálogo para publicar la carrera terminada en el ranking global.
 * El puntaje final lo calcula el servidor, así que puede ajustarse.
 */
export default function PublishCareer({ player, history, natData, score, title, onClose, onDone }) {
  const [alias, setAlias] = useState(getAlias());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const valid = alias.trim().length >= 2 && alias.trim().length <= 18;

  const handleSubmit = async () => {
    if (!valid || sending) return;
    setSending(true);
    setError("");

    const res = await submitCareer({ alias, player, history, natData });

    setSending(false);
    if (!res.ok) {
      setError(res.error || "No se pudo publicar la carrera");
      return;
    }
    onDone(res.career);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[380px] overflow-hidden rounded-2xl bg-[#0d0d10] ring-1 ring-zinc-800">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h3 className="text-base font-black">Publicar en el ranking</h3>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Tu carrera va a competir con las del resto del mundo
          </p>
        </div>

        <div className="px-5 py-4">
          {/* Resumen */}
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-black/40 p-3">
            <div
              className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
              style={{ background: `${legendColor(score)}22`, border: `1px solid ${legendColor(score)}55` }}
            >
              <div className="text-2xl font-black leading-none" style={{ color: legendColor(score) }}>
                {score}
              </div>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-extrabold">{player.name}</div>
              <div className="truncate text-[11px] text-zinc-400">{player.team}</div>
              <div className="text-[11px] font-bold" style={{ color: legendColor(score) }}>
                {title}
              </div>
            </div>
          </div>

          <div className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-zinc-500">
            TU ALIAS
          </div>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value.slice(0, 18))}
            placeholder="Cómo querés aparecer"
            maxLength={18}
            className="w-full rounded-lg bg-zinc-800/70 px-3 py-2.5 text-[13px] font-bold text-white outline-none ring-1 ring-transparent placeholder:text-zinc-600 focus:ring-zinc-500"
          />
          <div className="mt-1 text-right text-[9px] font-semibold text-zinc-600">
            {alias.trim().length}/18
          </div>

          {error && (
            <div className="mt-2 rounded-lg bg-red-950/60 px-3 py-2 text-[11px] font-semibold text-red-400">
              {error}
            </div>
          )}

          <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
            El servidor revisa los datos y recalcula tu puntaje, así que el valor final puede
            ajustarse.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-800/70 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-full px-4 py-2 text-[13px] font-bold text-zinc-400 hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || sending}
            className={`rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${
              valid && !sending
                ? "bg-white text-black hover:bg-zinc-200"
                : "cursor-not-allowed bg-zinc-700 text-zinc-400"
            }`}
          >
            {sending ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
