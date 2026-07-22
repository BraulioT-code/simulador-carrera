import { ovrTier } from "../utils/helpers";
import { getTeamColor, teamTint } from "../data";
import Flag from "./Flag";
import ClubLogo from "./ClubLogo";
import { useEffect, useRef, useState } from "react";
import CountUp, { DeltaBadge, SEQ } from "./CountUp";

/** Color de la moral: rojo (bajo) → ámbar → verde (alto) */
function moraleColor(v) {
  if (v >= 75) return "#66BB6A";
  if (v >= 55) return "#84cc16";
  if (v >= 40) return "#eab308";
  if (v >= 25) return "#f97316";
  return "#EF5350";
}

/** Barra fina de estadística — estilo 1b */
function StatBar({ label, value, barColor }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          width: 24,
          fontSize: 9,
          fontWeight: 600,
          color: "rgba(255,255,255,.3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 3,
          background: "rgba(255,255,255,.06)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: barColor,
            borderRadius: 2,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'Barlow Condensed', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          color: "rgba(255,255,255,.5)",
          width: 20,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PlayerHeader({ player, natData, posData, marketVal }) {
  const prevOvr = useRef(player.overall);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const d = player.overall - prevOvr.current;
    prevOvr.current = player.overall;
    if (!d) return undefined;
    setDelta(d);
    const t = setTimeout(() => setDelta(0), 3200);
    return () => clearTimeout(t);
  }, [player.overall]);

  const isFree = player.team === "Libre";
  const teamColor = isFree ? "#7c3aed" : getTeamColor(player.team, player.league);
  const tintBorder = isFree ? "rgba(124,58,237,.3)" : teamTint(player.team, player.league, 0.35);
  const tintBg = isFree ? "rgba(124,58,237,.08)" : teamTint(player.team, player.league, 0.1);

  const { gradient, textColor, glow } = ovrTier(player.overall);
  const hexW = 72;
  const hexH = Math.round(hexW * 1.14);
  const hexInset = Math.max(2, Math.round(hexW * 0.07));

  return (
    <div
      className="mb-2 flex items-stretch gap-3"
      style={{
        background: `linear-gradient(135deg, ${tintBg}, rgba(15,20,32,.95) 70%)`,
        border: `1px solid ${tintBorder}`,
        borderRadius: 12,
        padding: "16px 16px 14px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay radial del color del club */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 180,
          height: 180,
          background: `radial-gradient(circle at top right, ${tintBg.replace("0.1", "0.12")}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* OVR hexagonal con glow pulsante + DeltaBadge debajo */}
      <div
        className="shrink-0 flex flex-col items-center gap-1"
        style={{ width: hexW }}
      >
        <div
          className="glow-pulse"
          style={{ width: hexW, height: hexH, position: "relative", "--glow": glow }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              background: gradient,
              display: "block",
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: hexInset,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
              background: "linear-gradient(160deg,#0F1420,#151D2E)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: textColor,
                lineHeight: 1,
              }}
            >
              <CountUp value={player.overall} fromPrevious duration={900} delay={SEQ.ovrMain} />
            </span>
            <span
              style={{
                fontFamily: "'Outfit', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 7,
                color: `${textColor}80`,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginTop: -2,
              }}
            >
              OVR
            </span>
          </span>
        </div>
        <DeltaBadge delta={delta} />
      </div>

      {/* Identidad del jugador */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between">
        {/* Chips */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {natData && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,.7)",
              }}
            >
              <Flag code={natData.c} className="w-4 h-[11px]" />
              {natData.n.substring(0, 3).toUpperCase()}
            </span>
          )}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              background: `${teamColor}26`,
              border: `1px solid ${teamColor}44`,
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 600,
              color: teamColor,
            }}
          >
            #{player.number} {posData?.s}
          </span>
        </div>

        {/* Club */}
        <div className="mb-2 flex min-w-0 items-center gap-1.5">
          <ClubLogo team={player.team} league={player.league} size={18} />
          <span
            className="truncate text-sm font-extrabold"
            style={{ color: isFree ? "rgba(255,255,255,.4)" : "#fff" }}
          >
            {player.team}
          </span>
        </div>

        {/* Barras REP / MOR */}
        <div className="flex flex-col gap-1">
          <StatBar
            label="REP"
            value={player.reputation ?? 20}
            barColor="linear-gradient(90deg,#1565C0,#42A5F5)"
          />
          <StatBar
            label="MOR"
            value={player.morale ?? 70}
            barColor={`linear-gradient(90deg,${moraleColor((player.morale ?? 70) - 10)},${moraleColor(player.morale ?? 70)})`}
          />
        </div>
      </div>

      {/* Edad + Valor */}
      <div className="relative flex shrink-0 flex-col justify-between text-right">
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.35)" }}>EDAD</div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            {player.age}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.35)" }}>VALOR</div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#66BB6A",
              lineHeight: 1.1,
            }}
          >
            {marketVal >= 1 ? (
              <>
                €<CountUp value={marketVal} fromPrevious decimals={1} duration={800} delay={SEQ.value} />M
              </>
            ) : (
              <>
                €<CountUp value={Math.round(marketVal * 1000)} fromPrevious duration={800} delay={SEQ.value} />K
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
