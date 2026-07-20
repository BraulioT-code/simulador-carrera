import { ovrColor, ovrTextColor } from "../utils/helpers";
import { getTeamColor, teamTint } from "../data";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";

export default function PlayerHeader({ player, natData, posData, marketVal }) {
  const teamColor = getTeamColor(player.team, player.league);
  const tint = teamTint(player.team, player.league, 0.22);

  return (
    <div className="mb-2 flex items-stretch gap-2">
      {/* OVR grande */}
      <div
        className="flex w-[86px] shrink-0 flex-col items-center justify-center rounded-xl"
        style={{
          background: `linear-gradient(160deg, ${teamTint(player.team, player.league, 0.55)}, #3f3f46)`,
        }}
      >
        <div className="text-[10px] font-bold tracking-wider text-white/70">OVR</div>
        <div
          className="text-4xl font-black leading-none"
          style={{ color: ovrColor(player.overall) === "#64748b" ? "#e4e4e7" : ovrColor(player.overall), textShadow: "0 1px 3px rgba(0,0,0,.5)" }}
        >
          {player.overall}
        </div>
      </div>

      {/* Tarjeta de identidad, sombreada con el color del club */}
      <div
        className="flex flex-1 items-center justify-between rounded-xl px-3.5 py-2.5"
        style={{ background: `linear-gradient(135deg, ${tint}, #131316 70%)`, border: `1px solid ${teamTint(player.team, player.league, 0.35)}` }}
      >
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {natData && (
              <span className="flex items-center gap-1 rounded bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide">
                <Flag code={natData.c} className="w-4 h-[11px]" />
                {natData.n.substring(0, 3).toUpperCase()}
              </span>
            )}
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white"
              style={{ background: teamColor, textShadow: "0 1px 2px rgba(0,0,0,.45)" }}
            >
              #{player.number} {posData?.s}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <ClubLogo team={player.team} league={player.league} size={22} />
            <span className="truncate text-base font-extrabold">{player.team}</span>
          </div>
        </div>

        <div className="ml-2 shrink-0 text-right">
          <div className="text-[9px] font-semibold text-zinc-400">
            EDAD <span className="ml-1 text-lg font-black text-white">{player.age}</span>
          </div>
          <div className="text-[9px] font-semibold text-zinc-400">
            VALOR{" "}
            <span className="ml-1 text-sm font-extrabold text-amber-400">
              {marketVal >= 1 ? `€${marketVal}M` : `€${Math.round(marketVal * 1000)}K`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
