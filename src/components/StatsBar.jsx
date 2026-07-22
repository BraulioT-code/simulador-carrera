import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";
import Flag from "./Flag";
import CountUp, { SEQ } from "./CountUp";

function StatValue({ value, delay = 0, big = false }) {
  const style = big
    ? {
        fontFamily: "'Barlow Condensed', system-ui, sans-serif",
        fontWeight: 800,
        fontSize: 26,
        color: "#fff",
        lineHeight: 1,
      }
    : {
        fontFamily: "'Barlow Condensed', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 13,
        color: "rgba(255,255,255,.6)",
      };

  const content =
    typeof value === "string" && value.includes("/") ? (
      (() => {
        const [a, b] = value.split("/");
        return (
          <>
            <CountUp value={a} fromPrevious duration={700} delay={delay} />
            <span style={{ opacity: 0.4 }}>/</span>
            <CountUp value={b} fromPrevious duration={700} delay={delay} />
          </>
        );
      })()
    ) : (
      <CountUp value={value} fromPrevious duration={700} delay={delay} />
    );

  return <span style={style}>{content}</span>;
}

/**
 * Totales de carrera — estilo 1b: números grandes centrados con divisores verticales.
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
    <IconMatches size={11} key="pj" />,
    isGK ? <IconGoalConceded size={11} key="a" /> : <IconBall size={11} key="a" />,
    isGK ? <IconCleanSheet size={11} key="b" /> : <IconAssist size={11} key="b" />,
  ];

  const clubVals = [pjMax ? `${pj}/${pjMax}` : `${pj}`, isGK ? gc : gls, isGK ? vi : ast];
  const natVals = [ntCaps, isGK ? ntGc : ntGls, isGK ? ntVi : ntAst];
  const totalVals = [
    pjMax ? `${pj + ntCaps}/${pjMax + ntCaps}` : `${pj + ntCaps}`,
    (isGK ? gc : gls) + (isGK ? ntGc : ntGls),
    (isGK ? vi : ast) + (isGK ? ntVi : ntAst),
  ];

  const delays = [SEQ.pj, SEQ.gls, SEQ.ast];

  return (
    <div
      className="mb-2"
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: "rgba(255,255,255,.3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
        }}
      >
        Total de Carrera
      </div>

      {/* Stats principales con divisores */}
      <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
        {labels.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "stretch" }}>
            {i > 0 && (
              <div style={{ width: 1, background: "rgba(255,255,255,.06)", marginRight: 16 }} />
            )}
            <div style={{ paddingLeft: i > 0 ? 0 : 0 }}>
              <div style={{ marginBottom: 2 }}>
                <StatValue value={totalVals[i]} delay={delays[i] + (hasNT ? 240 : 0)} big />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  fontSize: 9,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: 2,
                }}
              >
                {icons[i]}
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desglose club / selección (si hay caps de selección) */}
      {hasNT && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(255,255,255,.05)",
            display: "grid",
            gridTemplateColumns: "52px 1fr 1fr 1fr",
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* Club */}
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Clubes
          </div>
          {clubVals.map((v, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <StatValue value={v} delay={delays[i]} />
            </div>
          ))}

          {/* Selección */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 600, color: "#42A5F5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            <Flag code={natCode} className="w-4 h-[11px]" />
            Sel.
          </div>
          {natVals.map((v, i) => (
            <div key={i} style={{ textAlign: "center", color: "#42A5F5" }}>
              <StatValue value={v} delay={delays[i] + 120} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
