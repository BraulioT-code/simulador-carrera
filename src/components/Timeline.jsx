import { useState } from "react";
import { AGES, getTeamColor, teamTint } from "../data";
import OvrBadge from "./OvrBadge";
import Trophy from "./Trophy";
import ClubLogo from "./ClubLogo";
import Flag from "./Flag";
import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";

function StatCell({ icon, value, w = "w-9 lg:w-12" }) {
  return (
    <span
      className={`${w} flex shrink-0 items-center justify-end gap-1 text-[11px] font-bold text-zinc-300 lg:text-[12px]`}
    >
      {icon}
      {value}
    </span>
  );
}

/** Fila desplegable con las estadísticas de la selección de esa temporada */
function NationalRow({ nt, natCode, nationality, isGK }) {
  return (
    <div className="mx-2 -mt-0.5 mb-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-b-lg border border-t-0 border-sky-900/40 bg-sky-950/25 px-2.5 py-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-black tracking-wide text-sky-300">
        <Flag code={natCode} className="w-4 h-[11px]" />
        {nationality?.toUpperCase()}
      </span>
      {(nt.comps || []).map((c, i) => (
        <span
          key={i}
          className="rounded bg-sky-900/50 px-1.5 py-0.5 text-[9px] font-bold text-sky-200"
          title={c.stage || undefined}
        >
          {c.n} <span className="text-white">{c.pj}</span>
          {c.stage && <span className="ml-1 text-sky-300/70">· {c.stage}</span>}
        </span>
      ))}
      <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
        <IconMatches size={10} />
        {nt.caps} PJ
      </span>
      {isGK ? (
        <>
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
            <IconGoalConceded size={10} />
            {nt.gc}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
            <IconCleanSheet size={10} />
            {nt.vi}
          </span>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
            <IconBall size={10} />
            {nt.gls}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
            <IconAssist size={10} />
            {nt.ast}
          </span>
        </>
      )}
    </div>
  );
}

export default function Timeline({
  history,
  currentAge,
  showCurrent = true,
  isGK = false,
  natCode,
  nationality,
}) {
  const [openAge, setOpenAge] = useState(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Encabezado: misma estructura y paddings que las filas para alinear columnas */}
      <div className="flex items-center gap-1.5 border border-transparent px-1.5 pb-1.5 text-[8px] font-bold tracking-wider text-zinc-500 lg:gap-2 lg:px-2 lg:pb-2 lg:text-[9px]">
        <span className="w-7 shrink-0 text-center lg:w-8">EDAD</span>
        <span className="flex-1 pl-7 lg:pl-8">CLUB</span>
        <span className="w-8 shrink-0 text-right lg:w-9">OVR</span>
        <span className="w-14 shrink-0 text-right lg:w-16">PJ</span>
        <span className="w-9 shrink-0 text-right lg:w-12">{isGK ? "GC" : "GLS"}</span>
        <span className="w-9 shrink-0 text-right lg:w-12">{isGK ? "VI" : "AST"}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start gap-1 lg:gap-1.5">
        {AGES.map((age) => {
          const row = history.find((h) => h.age === age);
          const isCurrent = age === currentAge && !row && showCurrent;
          const isFuture = age > (currentAge || 0) && !row;
          const teamColor = row ? getTeamColor(row.team, row.league) : "#3f3f46";
          const tint = row ? teamTint(row.team, row.league, 0.18) : "transparent";

          const hasNt = !!row?.nt;
          const open = hasNt && openAge === age;

          return (
            <div key={age}>
            <div
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-[3px] lg:gap-2 lg:rounded-lg lg:px-2 lg:py-1.5 ${
                hasNt ? "cursor-pointer" : ""
              } ${open ? "rounded-b-none lg:rounded-b-none" : ""}`}
              onClick={hasNt ? () => setOpenAge(open ? null : age) : undefined}
              style={{
                background: row
                  ? `linear-gradient(90deg, ${tint}, rgba(19,19,22,.9) 85%)`
                  : isCurrent
                    ? "rgba(63,63,70,.25)"
                    : "transparent",
                border: row
                  ? `1px solid ${teamTint(row.team, row.league, 0.3)}`
                  : "1px solid transparent",
                opacity: isFuture ? 0.25 : 1,
              }}
            >
              {/* Edad */}
              <span
                className="flex h-6 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-black text-white lg:h-7 lg:w-8 lg:text-[13px]"
                style={{
                  background: row ? teamColor : isCurrent ? "#3f3f46" : "#1c1c20",
                  textShadow: "0 1px 2px rgba(0,0,0,.5)",
                }}
              >
                {age}
              </span>

              {/* Club + trofeos */}
              <span className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-2">
                {row ? (
                  <>
                    <ClubLogo team={row.team} league={row.league} size={20} />
                    <span className="truncate text-[11px] font-extrabold lg:text-[13px]">
                      {row.team}
                    </span>
                    <span className="flex shrink-0 items-end gap-0.5">
                      {(row.trophies || []).map((t, i) => (
                        <Trophy key={i} type={t.t} name={t.n} size={12} />
                      ))}
                    </span>
                    {hasNt && (
                      <span
                        className="flex shrink-0 items-center gap-1 rounded bg-sky-950/60 px-1 py-0.5 text-[8px] font-black text-sky-300"
                        title="Ver estadísticas con la selección"
                      >
                        <Flag code={natCode} className="w-3 h-[8px]" />
                        <svg
                          width="7"
                          height="7"
                          viewBox="0 0 10 10"
                          className={`transition-transform ${open ? "rotate-180" : ""}`}
                        >
                          <path
                            d="M2 3.5 L5 6.5 L8 3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    )}
                  </>
                ) : isCurrent ? (
                  <span className="flex items-center gap-1.5 text-[11px] italic text-zinc-500 lg:text-[12px]">
                    <ClubLogo team="Libre" size={18} />
                    Eligiendo club…
                  </span>
                ) : null}
              </span>

              {/* OVR + stats */}
              {row && (
                <>
                  <span className="flex w-8 shrink-0 justify-end lg:w-9">
                    <OvrBadge ovr={row.ovr} size={24} />
                  </span>
                  <StatCell
                    icon={<IconMatches size={11} />}
                    value={row.pjMax ? `${row.pj}/${row.pjMax}` : row.pj}
                    w="w-14 lg:w-16"
                  />
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

            {open && (
              <NationalRow
                nt={row.nt}
                natCode={natCode}
                nationality={nationality}
                isGK={isGK}
              />
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
