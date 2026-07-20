import { useState } from "react";
import { ALL_COUNTRIES, POS_MAP } from "../data";
import { legendColor } from "../utils/legend";
import { getHallOfFame, clearHallOfFame } from "../utils/careerStore";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";
import Trophy from "./Trophy";

const TOP_TROPHIES = ["mundial", "continental", "ballon", "liga"];

export default function HallOfFame({ onClose }) {
  const [list, setList] = useState(() => getHallOfFame());

  const handleClear = () => {
    clearHallOfFame();
    setList([]);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-2xl bg-[#0d0d10] ring-1 ring-zinc-800 sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 px-5 py-4">
          <h2 className="text-lg font-black">Salón de la Fama</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="dark-scroll flex-1 overflow-y-auto px-4 py-3">
          {list.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-zinc-500">
              Todavía no hay carreras terminadas.
              <br />
              Jugá hasta el retiro y tu leyenda aparecerá acá.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {list.map((c, i) => {
                const nat = ALL_COUNTRIES.find((x) => x.n === c.nationality);
                const pos = POS_MAP.find((p) => p.id === c.position);
                const top = (c.trophies || [])
                  .filter((t) => TOP_TROPHIES.includes(t.t))
                  .slice(0, 6);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-[#131316] p-3 ring-1 ring-zinc-800/70"
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl"
                      style={{ background: `${legendColor(c.score)}22`, border: `1px solid ${legendColor(c.score)}66` }}
                    >
                      <div className="text-[8px] font-bold tracking-wider text-zinc-400">
                        LEYENDA
                      </div>
                      <div
                        className="text-xl font-black leading-none"
                        style={{ color: legendColor(c.score) }}
                      >
                        {c.score}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {nat && <Flag code={nat.c} className="w-4 h-[11px]" />}
                        <span className="truncate text-[14px] font-extrabold">{c.name}</span>
                        <span className="shrink-0 text-[10px] font-bold text-zinc-500">
                          #{c.number} {pos?.s}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ClubLogo team={c.team} league={c.league} size={14} />
                        <span className="truncate">{c.team}</span>
                        <span className="text-zinc-600">·</span>
                        <span style={{ color: legendColor(c.score) }} className="font-bold">
                          {c.title}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-zinc-500">
                        <span>
                          OVR máx <b className="text-zinc-300">{c.peakOvr}</b>
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
                        {c.earnings > 0 && (
                          <span>
                            <b className="text-amber-400">€{c.earnings}M</b>
                          </span>
                        )}
                      </div>
                      {top.length > 0 && (
                        <div className="mt-1 flex items-end gap-0.5">
                          {top.map((t, j) => (
                            <Trophy key={j} type={t.t} name={t.n} size={13} />
                          ))}
                          {(c.trophies || []).length > top.length && (
                            <span className="ml-1 text-[10px] font-bold text-zinc-500">
                              +{c.trophies.length - top.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {list.length > 0 && (
          <div className="shrink-0 border-t border-zinc-800/70 px-5 py-3 text-right">
            <button
              type="button"
              onClick={handleClear}
              className="text-[12px] font-semibold text-zinc-500 hover:text-red-400"
            >
              Borrar historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
