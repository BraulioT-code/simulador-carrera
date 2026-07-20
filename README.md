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

1. **Definí tu identidad**: apellido, dorsal, pierna hábil, nacionalidad (buscador con banderas) y posición sobre la cancha interactiva. En mobile es un asistente de 3 pasos (Nacionalidad → Identidad → Posición) con barra de progreso; la camiseta de la vista previa usa los colores de la selección del país elegido (`src/data/kits.js`).
2. **Oferta de cantera**: tres clubes **de las ligas de tu país** te ofrecen debutar. Si tu país no tiene liga en el juego, recibís ofertas de ligas modestas del resto del mundo.
3. **Simulá temporadas** (bloques de 2 años). Cada temporada genera partidos, goles y asistencias (o goles en contra y vallas invictas si sos arquero) según tu posición, OVR y edad.
4. Entre temporadas pueden aparecer **eventos** (lesiones, selección nacional, escándalos, renovaciones…) y **ofertas de transferencia**.
5. Si ya jugaste con tu selección, puede tocarte un **penal decisivo** en la final del torneo de tu confederación (Copa América, Eurocopa, Copa Oro…): elegís palo y te jugás la gloria (65% de convertir: +reputación, +moral y +1 OVR; si el arquero adivina, lo pagás).
6. A los 30+ tu primer club puede ofrecerte un **regreso triunfal**.
7. El retiro llega después de los 38, o antes si el nivel cae demasiado.
8. Cada 4 años de carrera (18, 22, 26, 30, 34, 38) se juega el **Mundial** si ya fuiste convocado alguna vez a tu selección.
9. Al retirarte obtenés tu **puntaje de leyenda**, la carrera se guarda en el **Salón de la Fama** y podés **copiar o descargar una imagen** con el resumen completo.

La partida se **guarda automáticamente**: si cerrás el navegador, al volver seguís donde estabas.

En mobile la pantalla de juego arranca sin scroll (ficha compacta, línea de tiempo y panel de acciones como hoja inferior) y la página crece de forma natural a medida que la carrera se llena.

---

## Mecánicas del juego

### Progresión de OVR

El OVR inicial es aleatorio (45–55) y evoluciona por temporada según la edad, **más un bonus por rendimiento**: una gran temporada (nota ≥ 8) suma +2 extra, una buena (≥ 6.5) suma +1, y una muy mala (< 3) resta 1.

| Edad  | Cambio base de OVR |
|-------|--------------------|
| <20   | +3 a +7            |
| 20–23 | +2 a +5            |
| 24–27 | 0 a +3             |
| 28–30 | −1 a +1            |
| 31–33 | −3 a 0             |
| 34+   | −5 a −1            |

Además, el 55% de los intervalos entre temporadas trae un **evento** (15 posibles), y varios de ellos permiten ganar o perder OVR directamente: entrenador personal (+2), pretemporada en altura (+2), videoanálisis (+1), rechazar publicidad para entrenar (+2), apuestas de entrenamiento/nutrición (+3/−2), vida nocturna (−2), lesión de ligamentos (−3/−1), crisis de confianza, etc. Con buen rendimiento y buenas decisiones, llegar a OVR 85+ es totalmente alcanzable.

El sorteo de eventos es **ponderado** (campo `w` en `src/data/events.js`): las lesiones pesan 0.4 y 0.25 frente a 1 del resto, así que aparecen solo de forma ocasional (~5% de los eventos).

Cada elección muestra sus consecuencias como **chips de colores** (verde = beneficio, rojo = costo, campo `fx`). En las elecciones con azar (las 70/30), al hacer clic una **ruleta** salta entre el chip verde y el rojo desacelerando hasta caer en el resultado, y recién entonces se aplica el efecto, y algunas elecciones incluyen visuales (bandera de tu selección, escudo de tu club) o directamente un **fichaje por otro club**. Hay dos eventos dinámicos especiales: *Declaración polémica* (disculparte y perder minutos, o irte a un club interesado) y *Conflicto Club-Selección* (ir con tu selección y quedar colgado en el club, o acatar y perderte la convocatoria). Algunas decisiones aplican `pjPenalty`, que reduce tus minutos de la temporada siguiente y por lo tanto tu evaluación. Cuando el club no te renueva por bajo rendimiento, la fase de ofertas aparece como **"Fin de ciclo"**, sin opción de quedarte.

Los partidos jugados se muestran como `jugados/posibles` (ej. `72/85`), tanto por temporada como en el total de carrera.

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
| Mundial | "Copa del Mundo" | Ganar el Mundial (ver abajo) |
| MVP / Guante de Oro | "MVP de la Premier League" | Nota ≥ 8.5 y nivel acorde a la liga |
| Equipo del Año | "Equipo del Año · La Liga" | Nota ≥ 7.5 |
| Goleador | "Goleador de la Serie A" | 25+ goles en la temporada |

Al ganar cualquier título aparece una **celebración a pantalla completa**: el trofeo en grande con fuegos artificiales animados durante 2 segundos (`src/components/TrophyCelebration.jsx`).

### Mundial y selección

Aceptar la convocatoria a la selección desbloquea el circuito internacional:

- **Mundial** cada 4 años de carrera (18, 22, 26, 30, 34, 38). El resultado depende de tu OVR y reputación: campeón directo, final (que se define por penal), semis, cuartos o fase de grupos.
- **Penal decisivo** (25% por temporada) por la copa de tu confederación — Copa América, Eurocopa, Copa Oro, Copa Asiática o Copa Africana. Si convertís, el trofeo se suma a tu vitrina y a la temporada correspondiente.

### Puntaje de leyenda

Al retirarte se calcula una nota de 0 a 100 (`src/utils/legend.js`) que pondera trofeos (42 pts máx., con la Copa del Mundo y el Balón de Oro pesando más), OVR pico (24), producción por partido (16), longevidad (10) y partidos internacionales (8). El puntaje da un título: *Leyenda mundial*, *Ídolo global*, *Estrella consagrada*, *Gran profesional*, *Sólido de primera*, *Ídolo de barrio* o *Carrera humilde*. Aparece en pantalla y en la imagen compartible.

### Finanzas, prensa y rivalidades

- **Salario** por temporada según OVR, edad y prestigio de la liga; las ganancias se acumulan y se muestran al retirarte.
- **Titular de prensa** generado cada temporada a partir de tus números (`src/utils/headlines.js`): goleador del torneo, muralla bajo los tres palos, pérdida de terreno en el club, etc.
- **Clásicos**: fichar por el rival directo de tu club anterior (Boca↔River, Millonarios↔Santa Fe, United↔City y ~55 pares más) cuesta moral y reputación, con recibimiento hostil.

### Guardado y Salón de la Fama

La partida en curso se guarda en `localStorage` tras cada acción y se restaura al abrir la app. Al retirarte, la carrera se archiva en el Salón de la Fama (hasta 20 carreras) con puntaje, título, OVR pico, totales, ganancias y trofeos; se accede desde la pantalla inicial o desde el final de carrera.

### Valor de mercado

Se calcula por rango de OVR con multiplicadores por edad: ×1.3 hasta los 21, ×0.7 desde los 30 y ×0.4 desde los 33. Es estable dentro de cada temporada (memoizado por edad y OVR).

### Imagen compartible de carrera

Al finalizar la carrera, `src/utils/careerImage.js` dibuja en un canvas (a 2× de resolución) el resumen completo: ficha del jugador, totales, vitrina de trofeos con nombres y la línea de tiempo con colores y escudos de cada club. Usa los mismos SVG de trofeos de la app y los escudos ya cacheados durante la partida, con monogramas de respaldo, para que la exportación nunca falle por imágenes bloqueadas (CORS). El botón **Copiar imagen** la deja en el portapapeles (`navigator.clipboard`); si el navegador no lo permite, se descarga como PNG.

---

## Datos e imágenes

- **Banderas**: [flagcdn.com](https://flagcdn.com) por código ISO (`src/data/countries.js`). Se usan imágenes porque los emojis de bandera no se renderizan en Windows.
- **Escudos de clubes**: ~150 clubes con ID directo del CDN de [api-sports](https://media.api-sports.io); el resto se resuelve por nombre en [TheSportsDB](https://www.thesportsdb.com) probando varios candidatos (con y sin tildes, nombres alternativos) y con caché en `localStorage` de los aciertos. Si un escudo no carga, se muestra un monograma con los colores del club (`src/components/ClubLogo.jsx`).
- **Identidad**: `public/logo.svg` (logo completo), `public/favicon.svg` (ícono de pestaña), `public/icon-512.png` (ícono de app) y `public/og-image.png` (imagen 1200×630 para compartir en redes, con metadatos Open Graph y Twitter Card en `index.html`).

### PWA

La app es instalable en el celular y funciona offline: `public/manifest.webmanifest` define nombre, colores e iconos, y `public/sw.js` cachea el shell (red primero para navegación, cache primero para assets). El service worker se registra solo en producción, así que en `pnpm dev` no interfiere con la recarga en caliente.
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
│   ├── TrophyCelebration.jsx # Celebración con fuegos artificiales (canvas)
│   ├── HallOfFame.jsx        # Listado de carreras terminadas
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
│   ├── kits.js               # Colores de camiseta por selección nacional
│   ├── rivals.js             # Pares de clásicos rivales
│   └── events.js             # Eventos de carrera (con pesos de sorteo)
└── utils/
    ├── gameLogic.js          # Stats, ofertas, trofeos, premios, Mundial, salarios
    ├── careerImage.js        # Imagen resumen de la carrera (canvas exportable)
    ├── careerStore.js        # Guardado en localStorage + Salón de la Fama
    ├── legend.js             # Puntaje y título de leyenda
    ├── headlines.js          # Titulares de prensa por temporada
    └── helpers.js            # randInt, clamp, pickWeighted, colores de OVR, valor de mercado
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
