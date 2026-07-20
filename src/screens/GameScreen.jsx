import { PlayerHeader, StatsBar, TrophyCabinet, Timeline, Flag, ClubLogo } from "../components";
import { ALL_COUNTRIES, POS_MAP, PHASES, teamTint } from "../data";
import { marketValue } from "../utils/helpers";

function BootsIllustration() {
  // Botines colgados
  return (
    <svg viewBox="0 0 120 90" className="mx-auto h-24 w-auto opacity-80">
      <path d="M52 0 v26 M68 0 v22" stroke="#d4d4d8" strokeWidth="2" fill="none" />
      <circle cx="52" cy="27" r="2.5" fill="#d4d4d8" />
      <circle cx="68" cy="23" r="2.5" fill="#d4d4d8" />
      <path
        d="M52 28 c-2 10 -4 16 -10 20 l-16 7 c-3.5 1.5 -5.5 3.5 -5.5 6.5 h30 c3 0 5 -2 5 -5 v-28 z"
        fill="#27272a"
        stroke="#52525b"
        strokeWidth="1.5"
      />
      <path
        d="M68 24 c2 10 4 16 10 20 l16 7 c3.5 1.5 5.5 3.5 5.5 6.5 h-30 c-3 0 -5 -2 -5 -5 v-28 z"
        fill="#27272a"
        stroke="#52525b"
        strokeWidth="1.5"
      />
      <path d="M44 40 l5 3 M41 45 l5 3 M76 40 l-5 3 M79 45 l-5 3" stroke="#52525b" strokeWidth="1.2" />
    </svg>
  );
}

export default function GameScreen({
  player,
  history,
  phase,
  offers,
  event,
  message,
  canStay,
  onPickClub,
  onSimulate,
  onHandleChoice,
  onStay,
  onReset,
}) {
  const natData = ALL_COUNTRIES.find((c) => c.n === player.nationality);
  const posData = POS_MAP.find((p) => p.id === player.position);
  const isGK = player.position === "GK";
  const mv = marketValue(player.overall, player.age);

  const tPJ = history.reduce((s, h) => s + h.pj, 0);
  const tGLS = history.reduce((s, h) => s + h.gls, 0);
  const tAST = history.reduce((s, h) => s + h.ast, 0);
  const tGC = history.reduce((s, h) => s + (h.gc || 0), 0);
  const tVI = history.reduce((s, h) => s + (h.vi || 0), 0);
  const allTrophies = history.flatMap((h) => h.trophies || []);

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col items-start gap-4 p-4 lg:flex-row">
      {/* Panel izquierdo */}
      <div className="w-full shrink-0 lg:w-[46%]">
        <PlayerHeader player={player} natData={natData} posData={posData} marketVal={mv} />
        <StatsBar pj={tPJ} gls={tGLS} ast={tAST} gc={tGC} vi={tVI} isGK={isGK} />
        <TrophyCabinet trophies={allTrophies} />

        {message && (
          <div className="mb-2 rounded-lg border border-emerald-900/60 bg-emerald-950/50 px-3 py-2 text-[12px] font-semibold text-emerald-400">
            {message}
          </div>
        )}

        {/* Cantera / Transferencia */}
        {(phase === PHASES.CANTERA || phase === PHASES.TRANSFER) && (
          <div className="mb-2">
            <h3 className="mb-1 text-[15px] font-extrabold">
              {phase === PHASES.CANTERA ? "Oferta de cantera" : "Ofertas de clubes"}
            </h3>
            <p className="mb-2.5 text-[12px] text-zinc-500">
              {phase === PHASES.CANTERA
                ? `Clubes de ${player.nationality} quieren sumarte a su proyecto juvenil. Elegí dónde empieza tu carrera.`
                : "Elegí tu próximo destino o quedate en tu club."}
            </p>

            <div className="flex flex-wrap gap-2">
              {offers.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPickClub(o)}
                  className="min-w-[110px] flex-1 basis-[30%] rounded-xl border border-zinc-700/70 p-3 text-center transition-colors hover:border-zinc-400"
                  style={{
                    background: `linear-gradient(160deg, ${teamTint(o.team, o.league, 0.2)}, #131316 75%)`,
                  }}
                >
                  <div className="mb-1.5 flex justify-center">
                    <ClubLogo team={o.team} league={o.league} size={34} />
                  </div>
                  <div className="mb-1 text-[13px] font-extrabold leading-tight">{o.team}</div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                    <Flag code={o.code} className="w-4 h-[11px]" />
                    {o.league}
                  </div>
                </button>
              ))}
            </div>

            {phase === PHASES.TRANSFER && canStay && (
              <button
                type="button"
                onClick={onStay}
                className="mt-2 w-full rounded-lg border border-zinc-700 py-2.5 text-[13px] font-semibold transition-colors hover:bg-zinc-800/70"
              >
                Quedarse en {player.team}
              </button>
            )}
            {phase === PHASES.TRANSFER && !canStay && (
              <div className="mt-2 rounded-lg bg-red-950/60 py-2 text-center text-[12px] font-semibold text-red-400">
                Bajo rendimiento: tu club no te renueva
              </div>
            )}
          </div>
        )}

        {/* Simular */}
        {phase === PHASES.PLAYING && (
          <button
            type="button"
            onClick={onSimulate}
            className="mb-2 w-full rounded-lg bg-amber-500 py-3 text-sm font-extrabold text-black transition-colors hover:bg-amber-400"
          >
            Simular Temporada ({player.age} años)
          </button>
        )}

        {/* Evento */}
        {phase === PHASES.EVENT && event && (
          <div className="mb-2 rounded-xl bg-[#131316] p-3.5 ring-1 ring-zinc-800/70">
            <h3 className="mb-1 text-base font-extrabold">{event.title}</h3>
            <p className="mb-3 text-[12px] leading-relaxed text-zinc-500">{event.desc}</p>
            <div className="flex gap-2">
              {(event.choices || []).map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onHandleChoice(c)}
                  className="flex-1 rounded-xl border border-zinc-700/70 bg-zinc-900 p-3 text-center transition-colors hover:border-zinc-400"
                >
                  <div className="mb-1 whitespace-pre-line text-[13px] font-extrabold">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-zinc-500">{c.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fin de carrera */}
        {phase === PHASES.OVER && (
          <div
            className="mb-2 rounded-xl p-7 text-center ring-1 ring-zinc-800/80"
            style={{
              background:
                "repeating-linear-gradient(90deg, #17120e 0 46px, #1c1611 46px 92px), linear-gradient(180deg, #1a1410, #0e0b08)",
              backgroundBlendMode: "overlay",
            }}
          >
            <BootsIllustration />
            <div className="mb-5 mt-4 text-xl font-extrabold">Tu carrera llegó a su fin</div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="rounded-full bg-white px-7 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-zinc-200"
              >
                Volver a jugar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel derecho: línea de tiempo */}
      <div className="w-full flex-1">
        <Timeline
          history={history}
          currentAge={player.age}
          showCurrent={phase !== PHASES.OVER}
          isGK={isGK}
        />
      </div>
    </div>
  );
}
