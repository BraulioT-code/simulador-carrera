/**
 * Camiseta premium con los colores de la selección del país elegido.
 * kit: { body, trim, text } — ver src/data/kits.js
 */
export default function JerseyPreview({ surname, number, kit }) {
  const name = (surname || "APELLIDO").toUpperCase();
  const fontSize = name.length > 11 ? 15 : name.length > 8 ? 18 : 21;
  const { body, trim, text } = kit || { body: "#f4f4f5", trim: "#18181b", text: "#18181b" };

  return (
    <svg
      viewBox="0 0 240 225"
      className="mx-auto w-full max-w-[260px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.6)]"
    >
      <defs>
        <linearGradient id="jp-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".22" />
          <stop offset=".35" stopColor="#ffffff" stopOpacity=".05" />
          <stop offset="1" stopColor="#000000" stopOpacity=".18" />
        </linearGradient>
      </defs>

      {/* cuerpo */}
      <path
        d="M92 26
           C 78 30 64 36 56 44
           C 42 58 32 76 28 94
           C 27 99 29 104 34 106
           L 66 118
           C 71 120 76 117 78 112
           L 84 98
           L 84 196
           C 84 203 89 208 96 208
           L 144 208
           C 151 208 156 203 156 196
           L 156 98
           L 162 112
           C 164 117 169 120 174 118
           L 206 106
           C 211 104 213 99 212 94
           C 208 76 198 58 184 44
           C 176 36 162 30 148 26
           C 141 38 99 38 92 26 Z"
        fill={body}
      />

      {/* sheen / volumen */}
      <path
        d="M92 26
           C 78 30 64 36 56 44
           C 42 58 32 76 28 94
           C 27 99 29 104 34 106
           L 66 118
           C 71 120 76 117 78 112
           L 84 98
           L 84 196
           C 84 203 89 208 96 208
           L 144 208
           C 151 208 156 203 156 196
           L 156 98
           L 162 112
           C 164 117 169 120 174 118
           L 206 106
           C 211 104 213 99 212 94
           C 208 76 198 58 184 44
           C 176 36 162 30 148 26
           C 141 38 99 38 92 26 Z"
        fill="url(#jp-sheen)"
      />

      {/* sombras de axilas para dar profundidad */}
      <path d="M84 98 L78 112 C80 104 82 100 84 96 Z" fill="#000" opacity=".18" />
      <path d="M156 98 L162 112 C160 104 158 100 156 96 Z" fill="#000" opacity=".18" />

      {/* cuello redondo */}
      <path
        d="M92 26 C 99 38 141 38 148 26 C 141 32 99 32 92 26 Z"
        fill={trim}
      />
      <path
        d="M92 26 C 99 38 141 38 148 26"
        fill="none"
        stroke={trim}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* sombra interna del cuello */}
      <path
        d="M96 30 C 103 39 137 39 144 30"
        fill="none"
        stroke="#000"
        strokeOpacity=".28"
        strokeWidth="3"
      />

      {/* puños */}
      <path
        d="M34 106 L 66 118 L 63 126 L 31 114 Z"
        fill={trim}
        transform="translate(0,-4)"
      />
      <path
        d="M206 106 L 174 118 L 177 126 L 209 114 Z"
        fill={trim}
        transform="translate(0,-4)"
      />

      {/* apellido */}
      <text
        x="120"
        y="86"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="2"
        fill={text}
      >
        {name}
      </text>

      {/* número */}
      <text
        x="120"
        y="164"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="900"
        fontSize="72"
        fill={text}
      >
        {number || "10"}
      </text>
    </svg>
  );
}
