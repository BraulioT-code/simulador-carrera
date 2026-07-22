import Trophy from "./Trophy";

/** Color del box según tipo de trofeo */
function trophyBoxStyle(type) {
  if (type === "balon") {
    return {
      background: "rgba(255,215,0,.08)",
      border: "1px solid rgba(255,215,0,.18)",
    };
  }
  if (type === "champions" || type === "copa") {
    return {
      background: "rgba(156,39,176,.08)",
      border: "1px solid rgba(156,39,176,.18)",
    };
  }
  // liga / default: dorado
  return {
    background: "rgba(201,162,39,.08)",
    border: "1px solid rgba(201,162,39,.18)",
  };
}

/**
 * Vitrina: agrupa trofeos repetidos y muestra cada uno con su nombre — estilo 1b.
 */
export default function TrophyCabinet({ trophies }) {
  if (trophies.length === 0) {
    return (
      <div
        className="mb-2"
        style={{
          background: "rgba(255,255,255,.025)",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 10,
          padding: "10px 14px",
          textAlign: "center",
          opacity: 0.4,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Vitrina
        </div>
        <Trophy type="liga" size={18} />
        <div style={{ marginTop: 4, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.3)", letterSpacing: "0.12em" }}>
          VACÍA
        </div>
      </div>
    );
  }

  // Agrupar por nombre
  const grouped = [];
  for (const t of trophies) {
    const found = grouped.find((g) => g.n === t.n);
    if (found) found.count += 1;
    else grouped.push({ ...t, count: 1 });
  }

  return (
    <div
      className="mb-2"
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
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
        Vitrina · {trophies.length} {trophies.length === 1 ? "Trofeo" : "Trofeos"}
      </div>
      <div className="flex flex-wrap items-end gap-2.5">
        {grouped.map((g, i) => (
          <div key={i} className="flex flex-col items-center text-center" style={{ width: 52 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...trophyBoxStyle(g.t),
              }}
            >
              <Trophy type={g.t} name={g.n} size={24} />
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 8,
                fontWeight: 500,
                lineHeight: 1.3,
                color: "rgba(255,255,255,.35)",
                maxWidth: 52,
              }}
            >
              {g.n}
              {g.count > 1 && (
                <span style={{ marginLeft: 2, fontWeight: 800, color: "#fff" }}>×{g.count}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
