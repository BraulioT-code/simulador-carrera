import { TROPHY_NAMES } from "../data";

export default function Trophy({ emoji }) {
  return (
    <span title={TROPHY_NAMES[emoji] || ""} style={{ cursor: "default" }}>
      {emoji}
    </span>
  );
}
