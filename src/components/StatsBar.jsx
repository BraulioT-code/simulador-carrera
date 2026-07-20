import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";
import Flag from "./Flag";

/**
 * Totales de carrera con desglose club / selección.
 * Si el jugador nunca fue convocado, muestra solo la fila de totales.
 */
export default function StatsBar({
  pj,
  pjMax,
  gls,
  ast,
  gc,
  vi,
  isGK,
  ntCaps = 0,
  ntGls = 0,
  ntAst = 0,
  ntGc = 0,
  ntVi = 0,
  natCode,
}) {
  const hasNT = ntCaps > 0;

  const labels = ["PJ", isGK ? "GC" : "GLS", isGK ? "VI" : "AST"];
  const icons = [
    <IconMatches size={12} key="pj" />,
    isGK ? <IconGoalConceded size={12} key="a" /> : <IconBall size={12} key="a" />,
    isGK ? <IconCleanSheet size={12} key="b" /> : <IconAssist size={12} key="b" />,
  ];

  const club = [pjMax ? `${pj}/${pjMax}` : `${pj}`, isGK ? gc : gls, isGK ? vi : ast];
  const nat = [ntCaps, isGK ? ntGc : ntGls, isGK ? ntVi : ntAst];
  const total = [
    pjMax ? `${pj + ntCaps}/${pjMax + ntCaps}` : `${pj + ntCaps}`,
    (isGK ? gc : gls) + (isGK ? ntGc : ntGls),
    (isGK ? vi : ast) + (isGK ? ntVi : ntAst),
  ];

  const Cell = ({ children, strong }) => (
    <div
      className={`text-center ${
        strong ? "text-[15px] font-extrabold text-white" : "text-[12px] font-bold text-zinc-300"
      }`}
    >
      {children}
    </div>
  );

  return (
    <div className="mb-2 border-y border-zinc-800/60 py-2">
      {/* Encabezado de columnas */}
      <div className="grid grid-cols-[54px_1fr_1fr_1fr] items-center gap-1">
        <div />
        {labels.map((l, i) => (
          <div
            key={l}
            className="flex items-center justify-center gap-1 text-[9px] font-bold tracking-wider text-zinc-500"
          >
            {icons[i]}
            {l}
          </div>
        ))}
      </div>

      {hasNT ? (
        <>
          {/* Club */}
          <div className="mt-1 grid grid-cols-[54px_1fr_1fr_1fr] items-center gap-1">
            <div className="text-[9px] font-bold tracking-wide text-zinc-500">CLUBES</div>
            {club.map((v, i) => (
              <Cell key={i}>{v}</Cell>
            ))}
          </div>

          {/* Selección */}
          <div className="mt-0.5 grid grid-cols-[54px_1fr_1fr_1fr] items-center gap-1">
            <div className="flex items-center gap-1 text-[9px] font-bold tracking-wide text-sky-300">
              <Flag code={natCode} className="w-4 h-[11px]" />
              SEL.
            </div>
            {nat.map((v, i) => (
              <div key={i} className="text-center text-[12px] font-bold text-sky-300">
                {v}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-1 grid grid-cols-[54px_1fr_1fr_1fr] items-center gap-1 border-t border-zinc-800/60 pt-1">
            <div className="text-[9px] font-black tracking-wide text-zinc-400">TOTAL</div>
            {total.map((v, i) => (
              <Cell key={i} strong>
                {v}
              </Cell>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-1 grid grid-cols-[54px_1fr_1fr_1fr] items-center gap-1">
          <div className="text-[9px] font-black tracking-wide text-zinc-400">TOTAL</div>
          {club.map((v, i) => (
            <Cell key={i} strong>
              {v}
            </Cell>
          ))}
        </div>
      )}
    </div>
  );
}
