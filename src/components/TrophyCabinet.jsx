import Trophy from "./Trophy";

export default function TrophyCabinet({ trophies }) {
  return (
    <div style={{ textAlign: "center", padding: "8px", marginBottom: 8, color: "#444" }}>
      {trophies.length > 0 ? (
        <div
          style={{
            fontSize: 24,
            display: "flex",
            gap: 4,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {trophies.map((t, i) => (
            <Trophy key={i} emoji={t} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 20 }}>🏆</div>
          <div style={{ fontSize: 10, marginTop: 2 }}>VITRINA VACÍA</div>
        </>
      )}
    </div>
  );
}
