/** Camiseta blanca con apellido y número, como vista previa de identidad */
export default function JerseyPreview({ surname, number }) {
  const name = (surname || "APELLIDO").toUpperCase();
  const fontSize = name.length > 10 ? 13 : name.length > 7 ? 16 : 18;

  return (
    <svg viewBox="0 0 220 200" className="mx-auto w-full max-w-[240px] drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]">
      <defs>
        <linearGradient id="jersey-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e8e8ec" />
        </linearGradient>
      </defs>

      {/* cuerpo y mangas */}
      <path
        d="M70 26 L92 14 C97 27 123 27 128 14 L150 26 L188 52 L166 82 L152 70 L152 182 L68 182 L68 70 L54 82 L32 52 Z"
        fill="url(#jersey-body)"
        stroke="#141417"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* cuello */}
      <path
        d="M92 14 C97 27 123 27 128 14"
        fill="none"
        stroke="#141417"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* puños */}
      <path d="M32 52 L54 82" stroke="#141417" strokeWidth="3" opacity=".25" />
      <path d="M188 52 L166 82" stroke="#141417" strokeWidth="3" opacity=".25" />

      {/* apellido */}
      <text
        x="110"
        y="72"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="1.5"
        fill="#141417"
      >
        {name}
      </text>

      {/* número */}
      <text
        x="110"
        y="150"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="900"
        fontSize="68"
        fill="#141417"
      >
        {number || "10"}
      </text>
    </svg>
  );
}
