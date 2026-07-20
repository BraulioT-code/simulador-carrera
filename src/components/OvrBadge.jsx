import { ovrColor, ovrTextColor } from "../utils/helpers";

export default function OvrBadge({ ovr, size = 32 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-black"
      style={{
        minWidth: size,
        height: size * 0.78,
        background: ovrColor(ovr),
        color: ovrTextColor(ovr),
        fontSize: size * 0.44,
        padding: "0 3px",
      }}
    >
      {ovr}
    </span>
  );
}
