import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";

function Stat({ label, value, icon }) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-semibold tracking-wider text-zinc-500">{label}</div>
      <div className="flex items-center justify-center gap-1.5 text-base font-extrabold">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}

export default function StatsBar({ pj, pjMax, gls, ast, gc, vi, isGK }) {
  return (
    <div className="mb-2 flex justify-around rounded-lg border-y border-zinc-800/60 py-2">
      <Stat
        label="PJ"
        value={pjMax ? `${pj}/${pjMax}` : pj}
        icon={<IconMatches size={13} />}
      />
      {isGK ? (
        <>
          <Stat label="GC" value={gc} icon={<IconGoalConceded size={13} />} />
          <Stat label="VI" value={vi} icon={<IconCleanSheet size={13} />} />
        </>
      ) : (
        <>
          <Stat label="GLS" value={gls} icon={<IconBall size={13} />} />
          <Stat label="AST" value={ast} icon={<IconAssist size={13} />} />
        </>
      )}
    </div>
  );
}
