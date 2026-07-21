import { useEffect, useState } from "react";
import { ALL_COUNTRIES, POS_MAP } from "../data";
import { legendColor } from "../utils/legend";
import { fetchTopCareers, isBackendEnabled } from "../utils/leaderboard";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";
import Trophy from "./Trophy";
import CareerDetail from "./CareerDetail";

const TOP_TROPHIES = ["mundial", "continental", "ballon", "liga"];
const MEDALS = ["#f0c243", "#c8c8cf", "#b07d1e"];

export default function Leaderboard({ onClose, highlightId = null }) {
  const [state, setState] = useState({ loading: true, careers: [], error: null });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchTopCareers(50).then((res) => {
      if (!alive) return;
      setState({ loading: false, careers: res.careers, error: res.ok ? null : res.error });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[88dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-t-2xl bg-[#0d0d10] ring-1 ring-zinc-800 sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 px-5 py-4">
          <div>
            <h2 className="text-lg font-black">Ranking global</h2>
            <p className="text-[11px] text-zinc-500">Las mejores carreras del mundo</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="dark-scroll flex-1 overflow-y-auto px-4 py-3">
          {!isBackendEnabled ? (
            <div className="py-12 text-center text-[13px] leading-relaxed text-zinc-500">
              El ranking global no está configurado.
              <br />
              Agregá <code className="text-zinc-400">VITE_SUPABASE_URL</code> y{" "}
              <code className="text-zinc-400">VITE_SUPABASE_ANON_KEY</code> en tu{" "}
              <code className="text-zinc-400">.env</code>.
            </div>
          ) : state.loading ? (
            <div className="py-12 text-center text-[13px] text-zinc-500">Cargando ranking…</div>
          ) : state.error ? (
            <div className="py-12 text-center text-[13px] text-red-400">
              No se pudo cargar el ranking
              <div className="mt-1 text-[11px] text-zinc-600">{state.error}</div>
            </div>
          ) : state.careers.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-zinc-500">
              Todavía no hay carreras publicadas.
              <br />
              ¡Sé el primero en dejar tu leyenda!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {state.careers.map((c, i) => {
                const nat = ALL_COUNTRIES.find((x) => x.n === c.nationality);
                const pos = POS_MAP.find((p) => p.id === c.position);
                const top = (c.trophies || []).filter((t) => TOP_TROPHIES.includes(t.t)).slice(0, 5);
                const isMine = highlightId && c.id === highlightId;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c)}
                    title="Ver la carrera completa"
                    className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left ring-1 transition-colors hover:ring-zinc-500 ${
                      isMine
                        ? "bg-emerald-950/40 ring-emerald-600/60"
                        : "bg-[#131316] ring-zinc-800/70"
                    }`}
                  >
                    {/* Posición en el ranking */}
                    <div
                      className="w-7 shrink-0 text-center text-[15px] font-black"
                      style={{ color: MEDALS[i] || "#52525b" }}
                    >
                      {i + 1}
                    </div>

                    {/* Puntaje */}
                    <div
                      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg"
                      style={{
                        background: `${legendColor(c.score)}22`,
                        border: `1px solid ${legendColor(c.score)}55`,
                      }}
                    >
                      <div
                        className="text-lg font-black leading-none"
                        style={{ color: legendColor(c.score) }}
                      >
                        {c.score}
                      </div>
                    </div>

                    {/* Datos */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {nat && <Flag code={nat.c} className="w-4 h-[11px]" />}
                        <span className="truncate text-[13px] font-extrabold">
                          {c.player_name}
                        </span>
                        <span className="shrink-0 text-[10px] font-bold text-zinc-500">
                          #{c.number} {pos?.s}
                        </span>
                        {isMine && (
                          <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 text-[9px] font-black text-emerald-400">
                            TU CARRERA
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ClubLogo team={c.club} league={c.league} size={13} />
                        <span className="truncate">{c.club}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="truncate font-bold text-zinc-300">@{c.alias}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[10px] text-zinc-500">
                        <span>
                          OVR <b className="text-zinc-300">{c.peak_ovr}</b>
                        </span>
                        <span>
                          PJ <b className="text-zinc-300">{c.pj}</b>
                        </span>
                        <span>
                          GLS <b className="text-zinc-300">{c.gls}</b>
                        </span>
                        <span>
                          AST <b className="text-zinc-300">{c.ast}</b>
                        </span>
                        {top.length > 0 && (
                          <span className="flex items-end gap-0.5">
                            {top.map((t, j) => (
                              <Trophy key={j} type={t.t} name={t.n} size={11} />
                            ))}
                          </span>
                        )}
                      </div>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0 text-zinc-600">
                      <path d="M6 3 L11 8 L6 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!state.loading && !state.error && state.careers.length > 0 && (
          <div className="shrink-0 border-t border-zinc-800/70 px-5 py-2.5 text-center text-[10px] text-zinc-600">
            Tocá cualquier carrera para verla completa
          </div>
        )}
      </div>

      {selected && (
        <CareerDetail
          careerId={selected.id}
          preview={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
