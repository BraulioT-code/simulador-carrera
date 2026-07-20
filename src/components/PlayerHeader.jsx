import { ovrColor, ovrTextColor } from "../utils/helpers";
import { getTeamColor, teamTint } from "../data";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";
import { useEffect, useRef, useState } from "react";
import CountUp, { DeltaBadge, SEQ } from "./CountUp";

export default function PlayerHeader({ player, natData, posData, marketVal }) {
  // Diferencia de OVR respecto a la temporada anterior (se muestra unos segundos)
  const prevOvr = useRef(player.overall);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const d = player.overall - prevOvr.current;
    prevOvr.current = player.overall;
    if (!d) return undefined;
    setDelta(d);
    const t = setTimeout(() => setDelta(0), 3200);
    return () => clearTimeout(t);
  }, [player.overall]);

  const isFree = player.team === "Libre";
  const teamColor = isFree ? "#7c3aed" : getTeamColor(player.team, player.league);
  const tint = isFree ? "rgba(124,58,237,.14)" : teamTint(player.team, player.league, 0.22);
  const tintBorder = isFree ? "rgba(124,58,237,.3)" : teamTint(player.team, player.league, 0.35);
  const tintStrong = isFree ? "rgba(124,58,237,.4)" : teamTint(player.team, player.league, 0.55);

  return (
    <div className="mb-2 flex items-stretch gap-2">
      {/* OVR grande */}
      <div
        className="flex w-[64px] shrink-0 flex-col items-center justify-center rounded-xl lg:w-[86px]"
        style={{
          background: `linear-gradient(160deg, ${ovrColor(player.overall)}cc, #3f3f46)`,
        }}
      >
        <div className="text-[9px] font-bold tracking-wider text-white/70 lg:text-[10px]">OVR</div>
        <div
          className="text-2xl font-black leading-none text-white lg:text-4xl"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,.55)" }}
        >
          <CountUp
            value={player.overall}
            fromPrevious
            duration={900}
            delay={SEQ.ovrMain}
          />
        </div>
        <DeltaBadge delta={delta} className="mt-1" />
      </div>

      {/* Tarjeta de identidad, sombreada con el color del club */}
      <div
        className="flex flex-1 items-center justify-between rounded-xl px-3 py-2 lg:px-3.5 lg:py-2.5"
        style={{
          background: `linear-gradient(135deg, ${tint}, #131316 70%)`,
          border: `1px solid ${tintBorder}`,
        }}
      >
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5 lg:mb-1.5">
            {natData && (
              <span className="flex items-center gap-1 rounded bg-zinc-700/80 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide lg:text-[10px]">
                <Flag code={natData.c} className="w-4 h-[11px]" />
                {natData.n.substring(0, 3).toUpperCase()}
              </span>
            )}
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white lg:text-[10px]"
              style={{ background: teamColor, textShadow: "0 1px 2px rgba(0,0,0,.45)" }}
            >
              #{player.number} {posData?.s}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
            <ClubLogo team={player.team} league={player.league} size={20} />
            <span
              className={`truncate text-sm font-extrabold lg:text-base ${isFree ? "text-zinc-400" : ""}`}
            >
              {player.team}
            </span>
          </div>
        </div>

        <div className="ml-2 shrink-0 text-right">
          <div className="text-[8px] font-semibold text-zinc-400 lg:text-[9px]">
            EDAD <span className="ml-1 text-base font-black text-white lg:text-lg">{player.age}</span>
          </div>
          <div className="text-[8px] font-semibold text-zinc-400 lg:text-[9px]">
            VALOR{" "}
            <span className="ml-1 text-[13px] font-extrabold text-amber-400 lg:text-sm">
              {marketVal >= 1 ? (
                <>
                  €
                  <CountUp
                    value={marketVal}
                    fromPrevious
                    decimals={1}
                    duration={800}
                    delay={SEQ.value}
                  />
                  M
                </>
              ) : (
                <>
                  €
                  <CountUp
                    value={Math.round(marketVal * 1000)}
                    fromPrevious
                    duration={800}
                    delay={SEQ.value}
                  />
                  K
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
