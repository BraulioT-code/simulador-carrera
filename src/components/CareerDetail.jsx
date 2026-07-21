import { useEffect, useState } from "react";
import { ALL_COUNTRIES, POS_MAP, teamTint, getTeamColor } from "../data";
import { legendColor } from "../utils/legend";
import { fetchCareer } from "../utils/leaderboard";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";
import StatsBar from "./StatsBar";
import TrophyCabinet from "./TrophyCabinet";
import Timeline from "./Timeline";

function moraleColor(v) {
  if (v >= 75) return "#22c55e";
  if (v >= 55) return "#84cc16";
  if (v >= 40) return "#eab308";
  if (v >= 25) return "#f97316";
  return "#ef4444";
}

function MiniBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 shrink-0 text-[7px] font-black tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="h-1 w-20 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-5 shrink-0 text-right text-[8px] font-bold text-zinc-400">{value}</span>
    </div>
  );
}

/**
 * Vista pública de una carrera del ranking: ficha, totales, vitrina,
 * línea de tiempo completa y puntaje de leyenda.
 */
export default function CareerDetail({ careerId, preview = null, onClose }) {
  const [career, setCareer] = useState(preview);
  const [loading, setLoading] = useState(!preview?.seasons);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    if (preview?.seasons) return undefined;

    setLoading(true);
    fetchCareer(careerId).then((res) => {
      if (!alive) return;
      setLoading(false);
      if (res.ok) setCareer(res.career);
      else setError(res.error);
    });
    return () => {
      alive = false;
    };
  }, [careerId, preview]);

  const seasons = career?.seasons || [];
  const isGK = career?.position === "GK";
  const nat = ALL_COUNTRIES.find((c) => c.n === career?.nationality);
  const pos = POS_MAP.find((p) => p.id === career?.position);
  const lastAge = seasons.length ? seasons[seasons.length - 1].age + 2 : 40;

  const tPJ = seasons.reduce((s, h) => s + (h.pj || 0), 0);
  const tPJMax = seasons.reduce((s, h) => s + (h.pjMax || 0), 0);
  const tA = seasons.reduce((s, h) => s + (isGK ? h.gc || 0 : h.gls || 0), 0);
  const tB = seasons.reduce((s, h) => s + (isGK ? h.vi || 0 : h.ast || 0), 0);
  const ntCaps = seasons.reduce((s, h) => s + (h.nt?.caps || 0), 0);
  const ntGls = seasons.reduce((s, h) => s + (h.nt?.gls || 0), 0);
  const ntAst = seasons.reduce((s, h) => s + (h.nt?.ast || 0), 0);
  const ntGc = seasons.reduce((s, h) => s + (h.nt?.gc || 0), 0);
  const ntVi = seasons.reduce((s, h) => s + (h.nt?.vi || 0), 0);
  const allTrophies = seasons.flatMap((h) => h.trophies || []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-t-2xl bg-[#0d0d10] ring-1 ring-zinc-800 sm:rounded-2xl">
        {/* Encabezado */}
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-black">
              {career ? `${career.player_name} · ${career.club}` : "Carrera"}
            </h2>
            {career && (
              <p className="text-[11px] text-zinc-500">
                Publicada por <span className="font-bold text-zinc-400">@{career.alias}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-3 py-1 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="dark-scroll flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="py-16 text-center text-[13px] text-zinc-500">Cargando carrera…</div>
          ) : error || !career ? (
            <div className="py-16 text-center text-[13px] text-red-400">
              No se pudo cargar la carrera
            </div>
          ) : (
            <>
              {/* Ficha */}
              <div className="mb-2 flex items-stretch gap-2">
                <div
                  className="flex w-[74px] shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{
                    background: `linear-gradient(160deg, ${legendColor(career.score)}55, #3f3f46)`,
                  }}
                >
                  <div className="text-[9px] font-bold tracking-wider text-white/70">OVR MÁX</div>
                  <div className="text-3xl font-black leading-none text-white">
                    {career.peak_ovr}
                  </div>
                </div>

                <div
                  className="flex flex-1 items-center justify-between rounded-xl px-3 py-2.5"
                  style={{
                    background: `linear-gradient(135deg, ${teamTint(career.club, career.league, 0.22)}, #131316 70%)`,
                    border: `1px solid ${teamTint(career.club, career.league, 0.35)}`,
                  }}
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {nat && (
                        <span className="flex items-center gap-1 rounded bg-zinc-700/80 px-1.5 py-0.5 text-[9px] font-extrabold">
                          <Flag code={nat.c} className="w-4 h-[11px]" />
                          {career.nationality.substring(0, 3).toUpperCase()}
                        </span>
                      )}
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white"
                        style={{ background: getTeamColor(career.club, career.league) }}
                      >
                        #{career.number} {pos?.s}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <ClubLogo team={career.club} league={career.league} size={20} />
                      <span className="truncate text-sm font-extrabold">{career.club}</span>
                    </div>

                    {/* Reputación y moral (si la carrera las trae) */}
                    {(career.reputation != null || career.morale != null) && (
                      <div className="mt-1.5 flex flex-col gap-1">
                        <MiniBar label="REP" value={career.reputation ?? 20} color="#a78bfa" />
                        <MiniBar
                          label="MOR"
                          value={career.morale ?? 70}
                          color={moraleColor(career.morale ?? 70)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    <div className="text-[8px] font-semibold text-zinc-400">
                      RETIRO{" "}
                      <span className="ml-1 text-base font-black text-white">{lastAge}</span>
                    </div>
                    {career.earnings > 0 && (
                      <div className="text-[8px] font-semibold text-zinc-400">
                        GANANCIAS{" "}
                        <span className="ml-1 text-[13px] font-extrabold text-amber-400">
                          €{career.earnings}M
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <StatsBar
                pj={tPJ}
                pjMax={tPJMax}
                gls={tA}
                ast={tB}
                gc={tA}
                vi={tB}
                isGK={isGK}
                ntCaps={ntCaps}
                ntGls={ntGls}
                ntAst={ntAst}
                ntGc={ntGc}
                ntVi={ntVi}
                natCode={nat?.c}
              />

              {allTrophies.length > 0 && <TrophyCabinet trophies={allTrophies} />}

              <Timeline
                history={seasons}
                currentAge={lastAge}
                showCurrent={false}
                isGK={isGK}
                natCode={nat?.c}
                nationality={career.nationality}
              />

              {/* Puntaje de leyenda */}
              <div
                className="mt-3 flex items-center gap-3 rounded-xl bg-black/40 px-4 py-3"
                style={{ border: `1px solid ${legendColor(career.score)}55` }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-black tracking-[0.2em] text-zinc-500">
                    PUNTAJE DE LEYENDA
                  </div>
                  <div
                    className="text-lg font-black leading-tight"
                    style={{ color: legendColor(career.score) }}
                  >
                    {career.title}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${career.score}%`,
                        background: legendColor(career.score),
                      }}
                    />
                  </div>
                </div>
                <div
                  className="shrink-0 text-3xl font-black"
                  style={{ color: legendColor(career.score) }}
                >
                  {career.score}
                  <span className="text-base text-zinc-600">/100</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
