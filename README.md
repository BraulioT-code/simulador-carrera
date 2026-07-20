# ⚽ Simulador de Carrera

Simulador de carrera futbolística: creá tu jugador, debutá en una liga de tu país y llevá tu carrera desde los 16 hasta el retiro, temporada a temporada, tomando decisiones de fichajes y de vida deportiva.

Construido con **React 18**, **Vite 6** y **Tailwind CSS 4**.

---

## Instalación y uso

Requisitos: Node.js 18+ y [pnpm](https://pnpm.io/).

```bash
pnpm install    # instala dependencias
pnpm dev        # servidor de desarrollo en http://localhost:3000
pnpm build      # build de producción en /dist
pnpm preview    # sirve el build de producción
```

---

## Cómo se juega

1. **Definí tu identidad**: apellido, dorsal, pierna hábil, nacionalidad (buscador con banderas) y posición sobre la cancha interactiva.
2. **Oferta de cantera**: tres clubes **de las ligas de tu país** te ofrecen debutar. Si tu país no tiene liga en el juego, recibís ofertas de ligas modestas del resto del mundo.
3. **Simulá temporadas** (bloques de 2 años). Cada temporada genera partidos, goles y asistencias (o goles en contra y vallas invictas si sos arquero) según tu posición, OVR y edad.
4. Entre temporadas pueden aparecer **eventos** (lesiones, selección nacional, escándalos, renovaciones…) y **ofertas de transferencia**.
5. A los 30+ tu primer club puede ofrecerte un **regreso triunfal**.
6. El retiro llega después de los 38, o antes si el nivel cae demasiado.

---

## Mecánicas del juego

### Progresión de OVR

El OVR inicial es aleatorio (45–55) y evoluciona por temporada según la edad:

| Edad  | Cambio de OVR |
|-------|---------------|
| <20   | +2 a +6       |
| 20–23 | +1 a +4       |
| 24–27 | 0 a +2        |
| 28–30 | −1 a +1       |
| 31–33 | −3 a 0        |
| 34+   | −5 a −1       |

### Evaluación de rendimiento (renovación)

Al final de cada temporada, `evaluateSeason()` (en `src/utils/gameLogic.js`) decide si tu club te ofrece quedarte. **No depende de la edad**, sino del rendimiento real:

- **Participación**: partidos jugados frente al máximo posible para tu edad. Jugar el 75% del máximo ya cuenta como titularidad plena; por debajo del 50% el club no renueva.
- **Producción**: goles + 0.6×asistencias por partido, comparado con la producción *promedio* esperada para tu posición y nivel (ratio 1.0 = temporada normal). Para arqueros cuentan los goles en contra por partido y las vallas invictas. Para defensores, cuyos números dicen poco, pesa más la titularidad.
- **Exigencia según el club**: si tu OVR sobra para el prestigio de la liga (+10) te renuevan con menos producción; si la liga te queda grande (−15) te exigen más.

Calibración simulada (3000 temporadas por caso): entre 60% y 77% de las temporadas terminan en renovación, tanto a los 24 como a los 36 años — solo las temporadas flojas de verdad (poca producción o suplencia) terminan sin oferta del club. Un delantero de OVR 63 con 22 goles en una liga modesta renueva siempre, sin importar la edad.

### Trofeos

Cada trofeo se guarda con su **nombre específico** y se dibuja como SVG (sin emojis). Pasá el mouse por encima para ver el nombre; la vitrina los agrupa con contador (×2, ×3…).

| Trofeo | Nombre que muestra | Condición |
|--------|--------------------|-----------|
| Liga | El nombre real de la liga: "Liga BetPlay", "Premier League", "Ligue 1"… | Salir campeón |
| Copa nacional | "FA Cup", "Copa del Rey", "DFB-Pokal", "Copa Colombia"… | Top 3 + 25% de probabilidad |
| Continental | "Champions League" (Europa), "Copa Libertadores" (Sudamérica), "Concachampions", etc. según la región de la liga | Pelear el título en primera división; probabilidad según OVR y prestigio |
| Balón de Oro | "Balón de Oro" | OVR ≥ 85, 8% |
| Bota de Oro | "Bota de Oro" | OVR ≥ 88, 12% |
| Mundial | "Copa del Mundo" | +20 partidos con la selección, 4% |

### Valor de mercado

Se calcula por rango de OVR con multiplicadores por edad: ×1.3 hasta los 21, ×0.7 desde los 30 y ×0.4 desde los 33.

---

## Datos e imágenes

- **Banderas**: [flagcdn.com](https://flagcdn.com) por código ISO (`src/data/countries.js`). Se usan imágenes porque los emojis de bandera no se renderizan en Windows.
- **Escudos de clubes**: ~150 clubes con ID directo del CDN de [api-sports](https://media.api-sports.io); el resto se resuelve por nombre en [TheSportsDB](https://www.thesportsdb.com) con caché en `localStorage`. Si un escudo no carga, se muestra un monograma con los colores del club (`src/components/ClubLogo.jsx`).
- **Colores de club**: `src/data/teamColors.js` define el color primario de cada equipo; se usa para sombrear la tarjeta del jugador, las filas de la línea de tiempo y las ofertas.
- **Trofeos e íconos**: SVG propios (`src/components/Trophy.jsx`, `src/components/Icons.jsx`).

### Ligas incluidas

41 ligas de 35 países (`src/data/leagues.js`), cada una con país, código de bandera, prestigio (42–95), región continental (`eu`, `sa`, `na`, `as`, `af`) y marca de segunda división cuando corresponde (Championship, 2. Bundesliga, Serie B, Ligue 2, Torneo BetPlay).

---

## Estructura del proyecto

```
src/
├── main.jsx                  # Punto de entrada
├── App.jsx                   # Enruta entre Setup y Game según la fase
├── styles/
│   └── global.css            # Tailwind + estilos base
├── screens/
│   ├── SetupScreen.jsx       # Creación del jugador (identidad, país, posición)
│   └── GameScreen.jsx        # Carrera: panel del jugador + línea de tiempo
├── components/
│   ├── JerseyPreview.jsx     # Camiseta SVG con apellido y dorsal en vivo
│   ├── CountryPicker.jsx     # Buscador de país con lista de 2 columnas
│   ├── PitchSelector.jsx     # Cancha con las 12 posiciones
│   ├── PlayerHeader.jsx      # OVR, edad, valor, club (sombreado con su color)
│   ├── StatsBar.jsx          # Totales de carrera (PJ/GLS/AST o GC/VI)
│   ├── TrophyCabinet.jsx     # Vitrina agrupada con nombres
│   ├── Timeline.jsx          # Historial por edad con escudos y colores de club
│   ├── Trophy.jsx            # SVGs de los 6 tipos de trofeo
│   ├── Icons.jsx             # Íconos de estadísticas
│   ├── Flag.jsx              # Bandera desde flagcdn
│   ├── ClubLogo.jsx          # Escudo real con fallback a monograma
│   └── OvrBadge.jsx          # Badge de OVR (dorado/plateado/bronce)
├── hooks/
│   └── useCareerGame.js      # Máquina de estados de la carrera
├── data/
│   ├── leagues.js            # 41 ligas con equipos, prestigio y región
│   ├── countries.js          # 140+ países con código ISO
│   ├── teamColors.js         # Color primario por club + tintes
│   ├── teamLogos.js          # IDs de escudos + nombres de búsqueda
│   ├── positions.js          # Coordenadas de posiciones en la cancha
│   └── events.js             # Eventos de carrera
└── utils/
    ├── gameLogic.js          # Stats, ofertas, trofeos, evaluación, retiro
    └── helpers.js            # randInt, clamp, colores de OVR, valor de mercado
```

### Fases del juego

`useCareerGame` maneja una máquina de estados simple (`PHASES` en `src/data/index.js`):

```
SETUP → CANTERA → PLAYING ⇄ (EVENT | TRANSFER) → … → OVER
```

- **SETUP**: creación del jugador.
- **CANTERA**: elección del club debut (ligas del país).
- **PLAYING**: listo para simular la temporada.
- **EVENT**: decisión con consecuencias (OVR, reputación, moral, selección).
- **TRANSFER**: ofertas de otros clubes, con opción de quedarte si rendiste.
- **OVER**: retiro y resumen final.
