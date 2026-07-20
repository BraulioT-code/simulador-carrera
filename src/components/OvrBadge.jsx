import { ovrColor } from "../utils/helpers";

export default function OvrBadge({ ovr, size = 32 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: size,
        height: size * 0.78,
        borderRadius: 5,
        background: ovrColor(ovr),
        color: "#fff",
        fontWeight: 900,
        fontSize: size * 0.44,
        padding: "0 3px",
      }}
    >
      {ovr}
    </span>
  );
}
