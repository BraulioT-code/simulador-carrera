export default function StatsBar({ pj, gls, ast, gc, vi, isGK }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        background: "#111",
        borderRadius: 8,
        padding: "8px",
        marginBottom: 8,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "#666" }}>PJ</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>🏟️ {pj}</div>
      </div>

      {isGK ? (
        <>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#666" }}>GC</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>🥅 {gc}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#666" }}>VI</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>🧤 {vi}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#666" }}>GLS</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>⚽ {gls}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#666" }}>AST</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>🅰️ {ast}</div>
          </div>
        </>
      )}
    </div>
  );
}
