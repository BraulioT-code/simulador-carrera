import { ovrTier } from "../utils/helpers";
import CountUp from "./CountUp";

/**
 * Badge OVR con forma hexagonal, gradiente por tier y glow pulsante.
 * size controla la anchura del hex; la altura se ajusta a la proporción 8:9.
 */
export default function OvrBadge({ ovr, size = 32, animate = true, delay = 0 }) {
  const { gradient, textColor, glow } = ovrTier(ovr);
  const h = Math.round(size * 1.14);
  const inset = Math.max(2, Math.round(size * 0.07));
  const fontSize = Math.round(size * 0.48);

  return (
    <span
      className="glow-pulse inline-block shrink-0"
      style={{ width: size, height: h, "--glow": glow, position: "relative" }}
    >
      {/* Gradiente exterior del tier */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
          background: gradient,
          display: "block",
        }}
      />
      {/* Fondo oscuro interior con número */}
      <span
        style={{
          position: "absolute",
          inset: inset,
          clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
          background: "#0F1420",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            fontWeight: 800,
            fontSize,
            color: textColor,
            lineHeight: 1,
          }}
        >
          {animate ? <CountUp value={ovr} duration={700} delay={delay} /> : ovr}
        </span>
      </span>
    </span>
  );
}
