import { AGES, getTeamColor, teamTint } from "../data";
import OvrBadge from "./OvrBadge";
import Trophy from "./Trophy";
import ClubLogo from "./ClubLogo";
import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";

function StatCell({ icon, value, w = "w-12" }) {
  return (
    <span className={`${w} flex shrink-0 items-center justify-end gap-1 text-[12px] font-bold text-zinc-300`}>
      {icon}
      {value}
    </span>
  );
}

export default function Timeline({ history, currentAge, showCurrent = true, isGK = false }) {
  return (
    <div className="flex-1">
      {/* Encabezado: misma estructura y paddings que las filas para alinear columnas */}
      <div className="flex items-center gap-2 border border-transparent px-2 pb-2 text-[9px] font-bold tracking-wider text-zinc-500">
        <span className="w-8 shrink-0 text-center">EDAD</span>
        <span className="flex-1 pl-8">CLUB</span>
        <span className="w-9 shrink-0 text-right">OVR</span>
        <span className="w-12 shrink-0 text-right">PJ</span>
        <span className="w-12 shrink-0 text-right">{isGK ? "GC" : "GLS"}</span>
        <span className="w-12 shrink-0 text-right">{isGK ? "VI" : "AST"}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {AGES.map((age) => {
          const row = history.find((h) => h.age === age);
          const isCurrent = age === currentAge && !row && showCurrent;
          const isFuture = age > (currentAge || 0) && !row;
          const teamColor = row ? getTeamColor(row.team, row.league) : "#3f3f46";
          const tint = row ? teamTint(row.team, row.league, 0.18) : "transparent";

          return (
            <div
              key={age}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{
                background: row
                  ? `linear-gradient(90deg, ${tint}, rgba(19,19,22,.9) 85%)`
                  : isCurrent
                    ? "rgba(63,63,70,.25)"
                    : "transparent",
                border: row ? `1px solid ${teamTint(row.team, row.league, 0.3)}` : "1px solid transparent",
                opacity: isFuture ? 0.25 : 1,
              }}
            >
              {/* Edad */}
              <span
                className="flex h-7 w-8 shrink-0 items-center justify-center rounded-md text-[13px] font-black text-white"
                style={{
                  background: row ? teamColor : isCurrent ? "#3f3f46" : "#1c1c20",
                  textShadow: "0 1px 2px rgba(0,0,0,.5)",
                }}
              >
                {age}
              </span>

              {/* Club + trofeos */}
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {row ? (
                  <>
                    <ClubLogo team={row.team} league={row.league} size={24} />
                    <span className="truncate text-[13px] font-extrabold">{row.team}</span>
                    <span className="flex shrink-0 items-end gap-0.5">
                      {(row.trophies || []).map((t, i) => (
                        <Trophy key={i} type={t.t} name={t.n} size={13} />
                      ))}
                    </span>
                  </>
                ) : isCurrent ? (
                  <span className="text-[12px] italic text-zinc-500">Eligiendo club…</span>
                ) : null}
              </span>

              {/* OVR + stats */}
              {row && (
                <>
                  <span className="flex w-9 shrink-0 justify-end">
                    <OvrBadge ovr={row.ovr} size={26} />
                  </span>
                  <StatCell icon={<IconMatches size={11} />} value={row.pj} />
                  <StatCell
                    icon={isGK ? <IconGoalConceded size={11} /> : <IconBall size={11} />}
                    value={isGK ? row.gc : row.gls}
                  />
                  <StatCell
                    icon={isGK ? <IconCleanSheet size={11} /> : <IconAssist size={11} />}
                    value={isGK ? row.vi : row.ast}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
