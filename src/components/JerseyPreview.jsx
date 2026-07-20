/**
 * Camiseta premium con los colores de la selección del país elegido.
 * kit: { body, trim, text } — ver src/data/kits.js
 */
export default function JerseyPreview({ surname, number, kit }) {
  const name = (surname || "APELLIDO").toUpperCase().slice(0, 14);
  // Tamaño y espaciado adaptados para que el apellido nunca desborde la camiseta
  const fontSize = name.length > 12 ? 11 : name.length > 10 ? 13 : name.length > 8 ? 16 : 20;
  const tracking = name.length > 10 ? 0.4 : name.length > 8 ? 1 : 1.8;
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
           C 79 30 67 36 59 44
           C 51 56 45 73 42 89
           C 41 94 43 99 48 101
           L 67 109
           C 71 111 75 108 76 104
           L 72 95
           L 72 196
           C 72 203 77 208 84 208
           L 156 208
           C 163 208 168 203 168 196
           L 168 95
           L 164 104
           C 165 108 169 111 173 109
           L 192 101
           C 197 99 199 94 198 89
           C 195 73 189 56 181 44
           C 173 36 161 30 148 26
           C 141 38 99 38 92 26 Z"
        fill={body}
      />

      {/* sheen / volumen */}
      <path
        d="M92 26
           C 79 30 67 36 59 44
           C 51 56 45 73 42 89
           C 41 94 43 99 48 101
           L 67 109
           C 71 111 75 108 76 104
           L 72 95
           L 72 196
           C 72 203 77 208 84 208
           L 156 208
           C 163 208 168 203 168 196
           L 168 95
           L 164 104
           C 165 108 169 111 173 109
           L 192 101
           C 197 99 199 94 198 89
           C 195 73 189 56 181 44
           C 173 36 161 30 148 26
           C 141 38 99 38 92 26 Z"
        fill="url(#jp-sheen)"
      />

      {/* sombras de axilas para dar profundidad */}
      <path d="M72 95 L76 104 C74 99 73 98 72 93 Z" fill="#000" opacity=".18" />
      <path d="M168 95 L164 104 C166 99 167 98 168 93 Z" fill="#000" opacity=".18" />

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
      <path d="M47 100 L 67 109 L 64 116 L 44 107 Z" fill={trim} />
      <path d="M193 100 L 173 109 L 176 116 L 196 107 Z" fill={trim} />

      {/* apellido */}
      <text
        x="120"
        y="86"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing={tracking}
        textLength={name.length > 11 ? 88 : undefined}
        lengthAdjust="spacingAndGlyphs"
        fill={text}
      >
        {name}
      </text>

      {/* número */}
      <text
        x="120"
        y="158"
        textAnchor="middle"
        fontFamily="inherit"
        fontWeight="900"
        fontSize="58"
        fill={text}
      >
        {number || "10"}
      </text>
    </svg>
  );
}
