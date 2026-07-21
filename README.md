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

## Ranking global (opcional)

El juego funciona 100% offline. Si querés activar el **ranking global** de carreras:

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. Abrí el **SQL Editor** y ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql).
3. Copiá `.env.example` como `.env` y completá con tus credenciales (Project Settings → API):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

4. Reiniciá `pnpm dev`. Aparecen los botones **Ranking global** (pantalla inicial) y **Publicar en el ranking** (al retirarte).

Sin esas variables, los botones simplemente no se muestran y todo lo demás sigue igual.

### Cómo está armado el backend

- **Tabla `careers`** con la carrera publicada: alias, jugador, club final, puntaje, títulos y el detalle de temporadas.
- **Row Level Security**: lectura pública del ranking, y **ninguna política de insert** — nadie puede escribir directo en la tabla.
- **`submit_career(payload)`** (función `security definer`) es la única vía de escritura. Antes de insertar valida que la carrera sea coherente: entre 6 y 12 temporadas, edades entre 16 y 38 sin repetir, OVR entre 40 y 99, partidos ≤ 95 por temporada, goles y asistencias dentro de lo humanamente posible, máximo 8 trofeos por temporada y partidos internacionales razonables. Además limita a 10 publicaciones por alias por hora.
- **El puntaje se recalcula en el servidor** con `legend_score()`, que replica en PL/pgSQL la fórmula de `src/utils/legend.js`. El valor que manda el cliente se ignora, así que editar el JavaScript desde la consola no sirve para inflar el ranking.
- **Lectura**: el ranking se consulta directo sobre la tabla pidiendo solo las columnas necesarias (sin el detalle pesado de temporadas). Al tocar una carrera se trae el registro completo y se abre la **vista pública de esa carrera** — ficha, totales, vitrina, línea de tiempo temporada por temporada y puntaje de leyenda — igual que la imagen que se comparte.
- El cliente (`@supabase/supabase-js`) se carga **bajo demanda**: solo se descarga al abrir el ranking o publicar, para no engordar el arranque del juego.

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

### Ranking de clubes y mercado

**Los 372 clubes** tienen un ranking propio de 0 a 100 (`src/data/clubRatings.js`), agrupado por liga y ordenado de mayor a menor, inspirado en los rankings mundiales de clubes (coeficientes UEFA/Opta en Europa, ranking CONMEBOL en Sudamérica): Real Madrid 96, Barcelona 95, Man. City 94, Bayern 93, Palmeiras 85, Flamengo 84, River 82, Boca 81, Millonarios 72, Leeds 74, Cortuluá 37… Así cualquier oferta tiene un nivel definido y comparable entre torneos.

La ventana de clubes interesados (`offerWindow`) tiene en cuenta **todo el desempeño**, no solo la nota:

- **Tu club actual** como punto de partida, y **tu OVR**: si el nivel del club te queda chico, clubes de tu categoría real se fijan en vos.
- **La nota de la temporada** (±9 puntos de ranking).
- **Producción**: 30+ goles, 25+ asistencias o un promedio de 0.85 aportes por partido suman 6 puntos; 20+ goles suman 3.5; casi no aportar jugando seguido resta 4. Para arqueros cuenta el porcentaje de vallas invictas.
- **Minutos**: jugar el 90% suma 2; menos del 45% resta 6.
- **Escalones**: el salto máximo es de +20 de ranking por temporada — las carreras se construyen por pasos, nadie va de la segunda colombiana a la élite en un año.
- **Sin renovación**: el tope siempre queda al menos 3 puntos por debajo de tu club actual.

Ejemplos reales de la simulación: con 32 goles y OVR 78 en Millonarios (72) te buscan Man. City, Atlético y Aston Villa; con una temporada normal, Peñarol o Rosario Central; de suplente sin goles, Bastia o Modena. Y desde el Barcelona con un año perdido, aparecen Zürich o Alavés.

Cada tarjeta de oferta muestra un chip con el ranking del club y una flecha verde/roja según sea un paso adelante o atrás. Si ya estás en la élite (90+), los grandes siguen interesados aunque no haya nada por encima.

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

### Animación de la simulación

Al simular una temporada, la propia aparición de los números hace de animación, en una secuencia definida en `SEQ` (`src/components/CountUp.jsx`):

```
OVR principal (0ms) → Valor de mercado (300ms) → OVR de la fila (600ms)
   → PJ (900ms) → GLS (1200ms) → AST (1500ms) → celebración del trofeo (2450ms)
```

- El **OVR** y el **valor de mercado** cuentan desde los datos de la temporada anterior hasta los nuevos; junto al OVR aparece un badge verde o rojo con la diferencia (`+3`, `-2`) durante unos segundos.
- En la nueva fila de la línea de tiempo cada dato entra con un *pop* mientras cuenta, respetando el orden de arriba; las temporadas anteriores quedan quietas.
- Los **totales de carrera** animan desde el acumulado anterior con los mismos tiempos (clubes → selección → total).
- La **celebración del trofeo** entra 300ms después de que termina la animación de AST. Si el título viene de un evento (penal, Mundial), donde no hay secuencia de números, entra enseguida.

Todo respeta `prefers-reduced-motion`: con esa preferencia activa los valores aparecen directamente.

Al ganar cualquier título aparece una **celebración a pantalla completa**: el trofeo en grande con fuegos artificiales animados durante 2 segundos (`src/components/TrophyCelebration.jsx`).

### Mundial y selección

Aceptar la convocatoria a la selección desbloquea el circuito internacional:

- **Mundial** cada 4 años de carrera (18, 22, 26, 30, 34, 38). El resultado depende de tu OVR y reputación: campeón directo, final (que se define por penal), semis, cuartos o fase de grupos.
- **Finales**: si tu selección llega a la final, la mitad de las veces se define desde el punto del penal (evento jugable: elegís palo, 65% de convertir) y la otra mitad se simula directamente con un 50/50. En ambos casos, ganar suma el trofeo a tu vitrina y a la temporada correspondiente, con su celebración.

### Estadísticas con la selección

Desde que aceptás tu primera convocatoria, cada temporada (bloque de 2 años) genera **estadísticas internacionales** desglosadas por competencia, con la cantidad de partidos ajustada a los formatos reales:

| Competencia | Partidos por selección |
|-------------|------------------------|
| Copa del Mundo (48 equipos) | 3 (grupos) a 8 (final), pasando por dieciseisavos, octavos, cuartos y semis |
| Eurocopa / Copa Africana / Copa Asiática (24 equipos) | 3 a 7 |
| Copa América / Copa Oro (16 equipos) | 3 a 6 |
| Eliminatorias CONMEBOL | ~18 por ciclo (8-10 por bloque) |
| Eliminatorias UEFA | 6-8 por ciclo (3-4 por bloque) |
| Eliminatorias Concacaf / AFC / CAF | según ronda (3-8 por bloque) |
| Amistosos | 2-5 por bloque |

Los torneos alternan igual que en la realidad: **Mundial** a los 18, 22, 26, 30, 34 y 38, y la **copa continental** de tu confederación a los 20, 24, 28, 32 y 36. Hasta dónde llega tu selección depende de tu OVR y reputación; si llegás a la final, se define por el penal decisivo.

En la línea de tiempo, las temporadas con selección muestran un chip con tu bandera: al tocarlo se despliega una sub-fila con el desglose (`Copa América 6 · Cuartos`, `Eliminatorias 9`, `Amistosos 3`) y los goles/asistencias internacionales. La barra de estadísticas muestra tres filas: **clubes**, **selección** y **total**, y ese desglose también aparece en la imagen compartible.

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

Al finalizar la carrera, `src/utils/careerImage.js` dibuja en un canvas (a 2× de resolución) el resumen completo: ficha del jugador, totales, vitrina de trofeos con nombres y la línea de tiempo con colores y escudos de cada club, usando los mismos SVG de trofeos de la app.

Para que **todos los escudos** aparezcan (el canvas solo puede exportar imágenes servidas con CORS), cada escudo se intenta cargar en cascada: PNG directo del CDN → el mismo PNG a través de un proxy con CORS (`images.weserv.nl`) → descarga por `fetch` convertida a data URL → y como último recurso un escudo SVG generado con los colores del club. Así la exportación nunca queda con huecos ni falla. El botón **Copiar imagen** la deja en el portapapeles (`navigator.clipboard`); si el navegador no lo permite, se descarga como PNG.

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
supabase/
└── schema.sql                # Tabla, RLS, validación y ranking (backend)

src/
├── main.jsx                  # Punto de entrada
├── App.jsx                   # Enruta entre Setup y Game según la fase
├── styles/
│   └── global.css            # Tailwind + estilos base
├── screens/
│   ├── SetupScreen.jsx       # Creación del jugador (identidad, país, posición)
│   └── GameScreen.jsx        # Carrera: panel del jugador + línea de tiempo
├── components/
│   ├── CountUp.jsx           # Números animados + badge de diferencia
│   ├── TrophyCelebration.jsx # Celebración con fuegos artificiales (canvas)
│   ├── HallOfFame.jsx        # Listado de carreras terminadas (local)
│   ├── Leaderboard.jsx       # Ranking global online
│   ├── PublishCareer.jsx     # Diálogo para publicar tu carrera
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
│   ├── clubRatings.js        # Ranking mundial de clubes (0-100)
│   └── events.js             # Eventos de carrera (con pesos de sorteo)
└── utils/
    ├── gameLogic.js          # Stats, ofertas, trofeos, premios, Mundial, salarios
    ├── careerImage.js        # Imagen resumen de la carrera (canvas exportable)
    ├── careerStore.js        # Guardado en localStorage + Salón de la Fama
    ├── leaderboard.js        # API del ranking global (publicar / consultar)
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
