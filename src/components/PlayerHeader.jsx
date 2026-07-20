import { ovrColor } from "../utils/helpers";

export default function PlayerHeader({ player, natData, posData, marketVal }) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: ovrColor(player.overall),
          borderRadius: 10,
          width: 60,
          height: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, color: "#fff", opacity: 0.8 }}>OVR</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
          {player.overall}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
          {natData && (
            <span
              style={{
                background: "#333",
                padding: "1px 6px",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {natData.f} {natData.n.substring(0, 3).toUpperCase()}
            </span>
          )}
          <span
            style={{
              background: "#eab308",
              color: "#000",
              padding: "1px 6px",
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            #{player.number} {posData?.s}
          </span>
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.team}
        </div>
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: "#666" }}>EDAD</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{player.age}</div>
        <div style={{ fontSize: 9, color: "#666" }}>VALOR</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#eab308" }}>
          {marketVal >= 1 ? `€${marketVal}M` : `€${Math.round(marketVal * 1000)}K`}
        </div>
      </div>
    </div>
  );
}
