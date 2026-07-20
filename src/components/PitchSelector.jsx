import { POS_MAP } from "../data";

export default function PitchSelector({ value, onChange }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        paddingBottom: "128%",
        background: "linear-gradient(180deg, #14532d 0%, #166534 45%, #15803d 100%)",
        boxShadow: "inset 0 0 40px rgba(0,0,0,.35)",
      }}
    >
      {/* franjas de césped */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 26px, transparent 26px 52px)",
        }}
      />

      {/* líneas de la cancha */}
      <svg
        viewBox="0 0 100 130"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="96" height="126" fill="none" stroke="#ffffff55" strokeWidth=".6" />
        <line x1="2" y1="65" x2="98" y2="65" stroke="#ffffff55" strokeWidth=".6" />
        <circle cx="50" cy="65" r="11" fill="none" stroke="#ffffff55" strokeWidth=".6" />
        <rect x="22" y="2" width="56" height="18" fill="none" stroke="#ffffff55" strokeWidth=".6" />
        <rect x="34" y="2" width="32" height="7" fill="none" stroke="#ffffff55" strokeWidth=".6" />
        <rect x="22" y="110" width="56" height="18" fill="none" stroke="#ffffff55" strokeWidth=".6" />
        <rect x="34" y="121" width="32" height="7" fill="none" stroke="#ffffff55" strokeWidth=".6" />
      </svg>

      {/* posiciones */}
      {POS_MAP.map((p) => {
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide transition-all ${
              selected
                ? "scale-110 bg-white text-emerald-950 shadow-[0_0_14px_rgba(255,255,255,0.55)]"
                : "bg-[#0b2416]/90 text-white hover:bg-[#123122] hover:shadow-[0_0_8px_rgba(255,255,255,0.25)]"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.s}
          </button>
        );
      })}
    </div>
  );
}
