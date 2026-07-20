import { POS_MAP } from "../data";

export default function PitchSelector({ value, onChange }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: "130%",
        background: "linear-gradient(180deg, #1a472a, #1a5c30)",
        borderRadius: 8,
        overflow: "hidden",
        border: "2px solid #2d6b3f",
      }}
    >
      <svg
        viewBox="0 0 100 130"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="1" width="98" height="128" fill="none" stroke="#fff3" strokeWidth=".5" />
        <line x1="1" y1="65" x2="99" y2="65" stroke="#fff3" strokeWidth=".5" />
        <circle cx="50" cy="65" r="12" fill="none" stroke="#fff3" strokeWidth=".5" />
        <rect x="20" y="1" width="60" height="20" fill="none" stroke="#fff3" strokeWidth=".5" />
        <rect x="30" y="1" width="40" height="8" fill="none" stroke="#fff3" strokeWidth=".5" />
        <rect x="20" y="109" width="60" height="20" fill="none" stroke="#fff3" strokeWidth=".5" />
        <rect x="30" y="121" width="40" height="8" fill="none" stroke="#fff3" strokeWidth=".5" />
      </svg>

      {POS_MAP.map((p) => (
        <div
          key={p.id}
          onClick={() => onChange(p.id)}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: value === p.id ? "#fff" : "#1a472acc",
            border: value === p.id ? "2px solid #fff" : "2px solid #fff6",
            color: value === p.id ? "#1a472a" : "#fff",
            fontSize: 9,
            fontWeight: 800,
            cursor: "pointer",
            transition: "all .15s",
            boxShadow: value === p.id ? "0 0 10px #fff8" : "none",
          }}
        >
          {p.s}
        </div>
      ))}
    </div>
  );
}
