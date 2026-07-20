import { AGES } from "../data";
import { ovrColor } from "../utils/helpers";
import OvrBadge from "./OvrBadge";
import Trophy from "./Trophy";

export default function Timeline({ history, currentAge, showCurrent = true, isGK = false }) {
  return (
    <div
      style={{
        background: "#0a0a0a",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid #1a1a1a",
        flex: 1,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ color: "#444", fontSize: 9, textTransform: "uppercase" }}>
            <th style={{ padding: "6px 5px", textAlign: "left", width: 36 }}>Edad</th>
            <th style={{ padding: "6px 5px", textAlign: "left" }}>Club</th>
            <th style={{ padding: "6px 5px", textAlign: "center", width: 38 }}>OVR</th>
            <th style={{ padding: "6px 5px", textAlign: "center", width: 34 }}>PJ</th>
            <th style={{ padding: "6px 5px", textAlign: "center", width: 34 }}>
              {isGK ? "GC" : "GLS"}
            </th>
            <th style={{ padding: "6px 5px", textAlign: "center", width: 34 }}>
              {isGK ? "VI" : "AST"}
            </th>
          </tr>
        </thead>
        <tbody>
          {AGES.map((age) => {
            const row = history.find((h) => h.age === age);
            const isCurrent = age === currentAge && !row && showCurrent;
            const isFuture = age > (currentAge || 0) && !row;

            return (
              <tr
                key={age}
                style={{
                  borderTop: "1px solid #1a1a1a",
                  background: row ? "#111" : "transparent",
                  opacity: isFuture ? 0.25 : 1,
                }}
              >
                <td style={{ padding: "6px 5px" }}>
                  <span
                    style={{
                      background: row
                        ? ovrColor(row.ovr)
                        : isCurrent
                          ? "#333"
                          : "#1a1a1a",
                      color: "#fff",
                      padding: "2px 7px",
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {age}
                  </span>
                </td>
                <td
                  style={{
                    padding: "6px 5px",
                    maxWidth: 110,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 12,
                  }}
                >
                  {row ? (
                    <>
                      {(row.trophies || []).map((t, i) => (
                        <Trophy key={i} emoji={t} />
                      ))}{" "}
                      {row.team}
                    </>
                  ) : isCurrent ? (
                    <span style={{ color: "#666" }}>❓ Eligiendo club...</span>
                  ) : null}
                </td>
                <td style={{ padding: "6px 5px", textAlign: "center" }}>
                  {row && <OvrBadge ovr={row.ovr} size={24} />}
                </td>
                <td style={{ padding: "6px 5px", textAlign: "center", color: "#aaa", fontSize: 11 }}>
                  {row ? `🏟️ ${row.pj}` : ""}
                </td>
                <td style={{ padding: "6px 5px", textAlign: "center", color: "#aaa", fontSize: 11 }}>
                  {row ? (isGK ? `🥅 ${row.gc}` : `⚽ ${row.gls}`) : ""}
                </td>
                <td style={{ padding: "6px 5px", textAlign: "center", color: "#aaa", fontSize: 11 }}>
                  {row ? (isGK ? `🧤 ${row.vi}` : `🅰️ ${row.ast}`) : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
