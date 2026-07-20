import { PlayerHeader, StatsBar, TrophyCabinet, Timeline } from "../components";
import { ALL_COUNTRIES, POS_MAP, PHASES } from "../data";
import { marketValue } from "../utils/helpers";

export default function GameScreen({
  player,
  history,
  phase,
  offers,
  event,
  message,
  canStay,
  onPickClub,
  onSimulate,
  onHandleChoice,
  onStay,
  onReset,
}) {
  const natData = ALL_COUNTRIES.find((c) => c.n === player.nationality);
  const posData = POS_MAP.find((p) => p.id === player.position);
  const isGK = player.position === "GK";
  const mv = marketValue(player.overall, player.age);

  const tPJ = history.reduce((s, h) => s + h.pj, 0);
  const tGLS = history.reduce((s, h) => s + h.gls, 0);
  const tAST = history.reduce((s, h) => s + h.ast, 0);
  const tGC = history.reduce((s, h) => s + (h.gc || 0), 0);
  const tVI = history.reduce((s, h) => s + (h.vi || 0), 0);
  const allTrophies = history.flatMap((h) => h.trophies || []);

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "12px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      {/* Panel izquierdo */}
      <div style={{ width: "45%", flexShrink: 0 }}>
        <PlayerHeader player={player} natData={natData} posData={posData} marketVal={mv} />
        <StatsBar pj={tPJ} gls={tGLS} ast={tAST} gc={tGC} vi={tVI} isGK={isGK} />
        <TrophyCabinet trophies={allTrophies} />

        {message && (
          <div
            style={{
              background: "#1a2a1a",
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
              fontSize: 12,
              color: "#22c55e",
            }}
          >
            {message}
          </div>
        )}

        {/* Cantera / Transferencia */}
        {(phase === PHASES.CANTERA || phase === PHASES.TRANSFER) && (
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800 }}>
              {phase === PHASES.CANTERA ? "Oferta de cantera" : "Ofertas de clubes"}
            </h3>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#666" }}>
              {phase === PHASES.CANTERA
                ? "Tres clubes quieren sumarte a su proyecto juvenil. Elegí dónde empieza tu carrera."
                : "Elegí tu próximo destino o quedate en tu club."}
            </p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {offers.map((o, i) => (
                <div
                  key={i}
                  onClick={() => onPickClub(o)}
                  style={{
                    flex: "1 1 30%",
                    minWidth: 100,
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 10,
                    padding: 12,
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#888")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
                >
                  <div style={{ fontSize: 10, color: "#666", marginBottom: 2 }}>Fichar por</div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{o.team}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {o.flag} {o.league}
                  </div>
                </div>
              ))}
            </div>

            {phase === PHASES.TRANSFER && canStay && (
              <button
                onClick={onStay}
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #333",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Quedarse en {player.team}
              </button>
            )}
            {phase === PHASES.TRANSFER && !canStay && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px",
                  borderRadius: 8,
                  background: "#1a0a0a",
                  fontSize: 12,
                  color: "#ef4444",
                  textAlign: "center",
                }}
              >
                Bajo rendimiento: tu club no te renueva
              </div>
            )}
          </div>
        )}

        {/* Simular */}
        {phase === PHASES.PLAYING && (
          <button
            onClick={onSimulate}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "#eab308",
              color: "#000",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            Simular Temporada ({player.age} años)
          </button>
        )}

        {/* Evento */}
        {phase === PHASES.EVENT && event && (
          <div style={{ background: "#111", borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>{event.title}</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666", lineHeight: 1.4 }}>
              {event.desc}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {(event.choices || []).map((c, i) => (
                <div
                  key={i}
                  onClick={() => onHandleChoice(c)}
                  style={{
                    flex: 1,
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: 10,
                    padding: 12,
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#888")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3, whiteSpace: "pre-line" }}>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 10, color: "#666" }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Over */}
        {phase === PHASES.OVER && (
          <div
            style={{
              background: "linear-gradient(180deg, #111, #0a0a0a)",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>
              Tu carrera llegó a su fin
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={onReset}
                style={{
                  padding: "10px 24px",
                  borderRadius: 20,
                  border: "1px solid #555",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Volver a jugar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel derecho: Timeline */}
      <div style={{ flex: 1 }}>
        <Timeline
          history={history}
          currentAge={player.age}
          showCurrent={phase !== PHASES.OVER}
          isGK={isGK}
        />
      </div>
    </div>
  );
}
