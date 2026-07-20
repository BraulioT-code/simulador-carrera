import { useMemo, useRef, useState } from "react";
import {
  PlayerHeader,
  StatsBar,
  TrophyCabinet,
  Timeline,
  Flag,
  ClubLogo,
  TrophyCelebration,
  HallOfFame,
} from "../components";
import { ALL_COUNTRIES, POS_MAP, PHASES, teamTint } from "../data";
import { marketValue } from "../utils/helpers";
import { generateCareerImage } from "../utils/careerImage";
import { legendScore, legendTitle, legendColor } from "../utils/legend";

function FxChip({ t, g, active = false, dim = false, landed = false }) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-left text-[10px] font-bold leading-tight transition-all duration-100 ${
        g ? "bg-emerald-950/70 text-emerald-400" : "bg-red-950/60 text-red-400"
      } ${active ? "scale-[1.06] ring-2 ring-white/80" : dim ? "opacity-35" : ""} ${
        landed ? "animate-pulse" : ""
      }`}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" className="shrink-0">
        {g ? (
          <path
            d="M1.5 9 L5 5.5 L7 7.5 L10.5 3.5 M10.5 3.5 h-3 M10.5 3.5 v3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M1.5 3 L5 6.5 L7 4.5 L10.5 8.5 M10.5 8.5 h-3 M10.5 8.5 v-3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {t}
    </span>
  );
}

function PenaltyScene() {
  return (
    <svg viewBox="0 0 360 150" className="h-auto w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="crowd" width="7" height="6" patternUnits="userSpaceOnUse">
          <rect width="7" height="6" fill="#26262a" />
          <circle cx="2" cy="2" r="1.1" fill="#3d3d42" />
          <circle cx="5.5" cy="4.5" r="1.1" fill="#333338" />
        </pattern>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#166534" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {/* tribuna en blanco y negro */}
      <rect x="0" y="0" width="360" height="70" fill="url(#crowd)" />
      {/* carteles publicitarios */}
      <rect x="0" y="62" width="360" height="12" fill="#111114" />
      {[20, 80, 140, 200, 260, 320].map((x) => (
        <text key={x} x={x} y="71" fontSize="6" fill="#52525b" fontWeight="700">
          copero
        </text>
      ))}

      {/* césped con franjas */}
      <rect x="0" y="74" width="360" height="76" fill="url(#grass)" />
      {[0, 2, 4].map((i) => (
        <rect key={i} x="0" y={74 + i * 19} width="360" height="10" fill="#ffffff" opacity=".03" />
      ))}

      {/* arco con red */}
      <g transform="translate(118, 30)">
        <rect x="0" y="0" width="124" height="46" fill="none" stroke="#f4f4f5" strokeWidth="3.5" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={6 + i * 11} y1="2" x2={6 + i * 11} y2="45" stroke="#e4e4e7" strokeWidth=".5" opacity=".5" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="2" y1={8 + i * 9} x2="122" y2={8 + i * 9} stroke="#e4e4e7" strokeWidth=".5" opacity=".5" />
        ))}
        {/* arquero */}
        <g transform="translate(54, 22)">
          <circle cx="8" cy="4" r="4" fill="#eab308" />
          <rect x="3" y="8" width="10" height="13" rx="3" fill="#eab308" />
          <line x1="-3" y1="12" x2="3" y2="10" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
          <line x1="19" y1="12" x2="13" y2="10" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* área y punto penal */}
      <path d="M100 150 L130 96 h100 L260 150" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity=".5" />
      {/* jugador de espaldas */}
      <g transform="translate(64, 100)">
        <circle cx="8" cy="4" r="4.5" fill="#e4e4e7" />
        <rect x="2.5" y="9" width="11" height="15" rx="3.5" fill="#f4f4f5" />
        <rect x="3.5" y="24" width="4" height="12" fill="#e4e4e7" />
        <rect x="8.5" y="24" width="4" height="12" fill="#e4e4e7" />
      </g>
      {/* pelota */}
      <circle cx="118" cy="126" r="5.5" fill="#fafafa" />
      <path d="M115.5 124 l2.5 -1.6 2.5 1.6 -1 3 h-3 z" fill="#27272a" />
    </svg>
  );
}

function BootsIllustration() {
  return (
    <svg viewBox="0 0 120 90" className="mx-auto h-20 w-auto opacity-80 lg:h-24">
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
  headline,
  canStay,
  celebration,
  onPickClub,
  onSimulate,
  onHandleChoice,
  onStay,
  onReset,
  onDismissCelebration,
}) {
  const natData = ALL_COUNTRIES.find((c) => c.n === player.nationality);
  const posData = POS_MAP.find((p) => p.id === player.position);
  const isGK = player.position === "GK";
  // Estable por edad/OVR: si no, cambia en cada render y la imagen no coincide con la pantalla
  const mv = useMemo(
    () => marketValue(player.overall, player.age),
    [player.overall, player.age]
  );

  const tPJ = history.reduce((s, h) => s + h.pj, 0);
  const tPJMax = history.reduce((s, h) => s + (h.pjMax || 0), 0);
  const tGLS = history.reduce((s, h) => s + h.gls, 0);
  const tAST = history.reduce((s, h) => s + h.ast, 0);
  const tGC = history.reduce((s, h) => s + (h.gc || 0), 0);
  const tVI = history.reduce((s, h) => s + (h.vi || 0), 0);
  const tNTCaps = history.reduce((s, h) => s + (h.nt?.caps || 0), 0);
  const tNTGls = history.reduce((s, h) => s + (h.nt?.gls || 0), 0);
  const tNTAst = history.reduce((s, h) => s + (h.nt?.ast || 0), 0);
  const tNTGc = history.reduce((s, h) => s + (h.nt?.gc || 0), 0);
  const tNTVi = history.reduce((s, h) => s + (h.nt?.vi || 0), 0);
  const allTrophies = history.flatMap((h) => h.trophies || []);

  const [shareMsg, setShareMsg] = useState("");
  const [sharing, setSharing] = useState(false);
  const [showHof, setShowHof] = useState(false);

  const score = useMemo(
    () => (phase === PHASES.OVER ? legendScore({ player, history }) : 0),
    [phase, player, history]
  );

  // Ruleta de chips para elecciones con azar (eff: "gamble")
  const [spin, setSpin] = useState(null); // { idx, chip, landed }
  const spinningRef = useRef(false);

  const handleEventChoice = (c, i) => {
    if (spinningRef.current) return;
    const isGamble = c.eff === "gamble" && (c.fx?.length || 0) >= 2;
    if (!isGamble) {
      onHandleChoice(c);
      return;
    }

    spinningRef.current = true;
    const success = Math.random() < 0.7;
    const target = Math.max(0, c.fx.findIndex((f) => f.g === success));
    let chip = 0;
    let delay = 90;
    setSpin({ idx: i, chip, landed: false });

    const tick = () => {
      delay *= 1.22;
      if (delay > 480) {
        setSpin({ idx: i, chip: target, landed: true });
        setTimeout(() => {
          spinningRef.current = false;
          setSpin(null);
          onHandleChoice({ ...c, resolved: success });
        }, 1000);
        return;
      }
      chip = 1 - chip;
      setSpin({ idx: i, chip, landed: false });
      setTimeout(tick, delay);
    };
    setTimeout(tick, delay);
  };

  const shareCareer = async (copy) => {
    if (sharing) return;
    setSharing(true);
    setShareMsg("");
    try {
      const canvas = await generateCareerImage({
        player,
        history,
        natData,
        posData,
        marketVal: mv,
        legend: { score, title: legendTitle(score), color: legendColor(score) },
      });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (copy && navigator.clipboard?.write && window.ClipboardItem) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setShareMsg("Imagen copiada al portapapeles");
          return;
        } catch {
          /* sigue a descarga */
        }
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `carrera-${(player.name || "jugador").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      setShareMsg(copy ? "No se pudo copiar: se descargó la imagen" : "Imagen descargada");
    } catch {
      setShareMsg("No se pudo generar la imagen");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <TrophyCelebration trophy={celebration} onDone={onDismissCelebration} />
      {showHof && <HallOfFame onClose={() => setShowHof(false)} />}

      <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col p-3 lg:grid lg:grid-cols-[46%_1fr] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-4 lg:p-4">
        {/* Bloque A: jugador */}
        <div className="shrink-0 lg:col-start-1 lg:row-start-1">
          <PlayerHeader player={player} natData={natData} posData={posData} marketVal={mv} />
          {history.length > 0 && (
            <StatsBar
              pj={tPJ}
              pjMax={tPJMax}
              gls={tGLS}
              ast={tAST}
              gc={tGC}
              vi={tVI}
              isGK={isGK}
              ntCaps={tNTCaps}
              ntGls={tNTGls}
              ntAst={tNTAst}
              ntGc={tNTGc}
              ntVi={tNTVi}
              natCode={natData?.c}
            />
          )}
          {(allTrophies.length > 0 || history.length > 0) && (
            <div className={allTrophies.length === 0 ? "hidden lg:block" : ""}>
              <TrophyCabinet trophies={allTrophies} />
            </div>
          )}
        </div>

        {/* Bloque B: línea de tiempo (crece y la página scrollea si hace falta) */}
        <div className="flex flex-1 flex-col lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <Timeline
            history={history}
            currentAge={player.age}
            showCurrent={phase !== PHASES.OVER}
            isGK={isGK}
            natCode={natData?.c}
            nationality={player.nationality}
          />
        </div>

        {/* Bloque C: acciones (hoja inferior en mobile) */}
        <div className="-mx-3 mt-2 shrink-0 rounded-t-2xl bg-[#131316] px-4 pb-4 pt-3 ring-1 ring-zinc-800/70 lg:col-start-1 lg:row-start-2 lg:m-0 lg:rounded-none lg:bg-transparent lg:p-0 lg:ring-0">
          {headline && phase !== PHASES.OVER && (
            <div className="mb-2 flex items-start gap-2 rounded-lg bg-zinc-800/40 px-3 py-2">
              <span className="mt-[1px] shrink-0 rounded bg-zinc-700 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-zinc-300">
                PRENSA
              </span>
              <span className="text-[12px] font-semibold italic leading-snug text-zinc-300">
                “{headline}”
              </span>
            </div>
          )}

          {message && (
            <div className="mb-2 rounded-lg border border-emerald-900/60 bg-emerald-950/50 px-3 py-2 text-[12px] font-semibold text-emerald-400">
              {message}
            </div>
          )}

          {/* Cantera / Transferencia */}
          {(phase === PHASES.CANTERA || phase === PHASES.TRANSFER) && (
            <div>
              <h3 className="mb-1 text-[15px] font-extrabold">
                {phase === PHASES.CANTERA
                  ? "Oferta de cantera"
                  : canStay
                    ? "Ofertas de clubes"
                    : "Fin de ciclo"}
              </h3>
              <p className="mb-2.5 text-[12px] text-zinc-500">
                {phase === PHASES.CANTERA
                  ? `Clubes de ${player.nationality} quieren sumarte a su proyecto juvenil. Elegí dónde empieza tu carrera.`
                  : canStay
                    ? "Elegí tu próximo destino o quedate en tu club."
                    : "Tu club decidió no renovarte. Elegí una nueva institución para continuar."}
              </p>

              <div className="flex gap-2">
                {offers.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onPickClub(o)}
                    className="flex min-w-0 flex-1 flex-col items-center justify-between rounded-xl border border-zinc-700/70 p-2.5 text-center transition-colors hover:border-zinc-400 lg:p-3"
                    style={{
                      background: `linear-gradient(160deg, ${teamTint(o.team, o.league, 0.2)}, #17171b 75%)`,
                    }}
                  >
                    <div className="text-[9px] text-zinc-500 lg:text-[10px]">Fichar por</div>
                    <div className="mb-1.5 w-full truncate text-[12px] font-extrabold leading-tight lg:text-[13px]">
                      {o.team}
                    </div>
                    <ClubLogo team={o.team} league={o.league} size={38} />
                    <div className="mt-1.5 flex w-full items-center justify-center gap-1 text-[9px] text-zinc-400 lg:text-[10px]">
                      <Flag code={o.code} className="w-3.5 h-[10px]" />
                      <span className="truncate">{o.league}</span>
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
            </div>
          )}

          {/* Simular */}
          {phase === PHASES.PLAYING && (
            <button
              type="button"
              onClick={onSimulate}
              className="w-full rounded-lg bg-amber-500 py-3 text-sm font-extrabold text-black transition-colors hover:bg-amber-400"
            >
              Simular Temporada ({player.age} años)
            </button>
          )}

          {/* Evento: penal decisivo */}
          {phase === PHASES.EVENT && event && event.type === "penal" && (
            <div className="overflow-hidden rounded-xl ring-1 ring-zinc-800/80">
              <div className="bg-[#0d0d10] px-4 pb-2 pt-3 text-center">
                <h3 className="text-base font-extrabold">{event.title}</h3>
                <p className="text-[12px] text-zinc-500">{event.desc}</p>
              </div>
              <div className="relative">
                <PenaltyScene />
                <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-between px-4">
                  {(event.choices || []).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onHandleChoice(c)}
                      className="flex items-center gap-2 rounded-full bg-emerald-950/80 px-5 py-2 text-[13px] font-bold text-emerald-100 ring-1 ring-emerald-400/40 backdrop-blur transition-colors hover:bg-emerald-900"
                    >
                      {i === 0 && <span aria-hidden>←</span>}
                      {c.label}
                      {i === 1 && <span aria-hidden>→</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Evento normal */}
          {phase === PHASES.EVENT && event && event.type !== "penal" && (
            <div>
              <h3 className="mb-1 text-base font-extrabold">{event.title}</h3>
              <p className="mb-3 text-[12px] leading-relaxed text-zinc-500">{event.desc}</p>
              <div className="flex items-stretch gap-2">
                {(event.choices || []).map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleEventChoice(c, i)}
                    disabled={!!spin}
                    className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-900 p-3 text-center transition-colors hover:border-zinc-400 disabled:cursor-default"
                    style={
                      c.transfer
                        ? {
                            background: `linear-gradient(160deg, ${teamTint(c.transfer.team, c.transfer.league, 0.2)}, #17171b 75%)`,
                          }
                        : undefined
                    }
                  >
                    {c.transfer ? (
                      <>
                        <div className="text-[10px] text-zinc-500">Fichar por</div>
                        <div className="text-[13px] font-extrabold leading-tight">
                          {c.transfer.team}
                        </div>
                        <div className="flex flex-1 items-center">
                          <ClubLogo team={c.transfer.team} league={c.transfer.league} size={42} />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <Flag code={c.transfer.code} className="w-3.5 h-[10px]" />
                          {c.transfer.league}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="whitespace-pre-line text-[13px] font-extrabold">
                          {c.label}
                        </div>
                        {c.visual === "flag" && natData && (
                          <div className="flex flex-1 items-center">
                            <Flag code={natData.c} className="h-12 w-[72px] rounded-md" />
                          </div>
                        )}
                        {c.visual === "club" && (
                          <div className="flex flex-1 items-center">
                            <ClubLogo team={player.team} league={player.league} size={48} />
                          </div>
                        )}
                        {c.fx?.length ? (
                          <div className="mt-auto flex w-full flex-col items-stretch gap-1.5">
                            {c.fx.map((f, j) => {
                              const here = spin && spin.idx === i;
                              return (
                                <FxChip
                                  key={j}
                                  t={f.t}
                                  g={f.g}
                                  active={here && spin.chip === j}
                                  dim={here && spin.chip !== j}
                                  landed={here && spin.landed && spin.chip === j}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          c.sub && <div className="text-[10px] text-zinc-500">{c.sub}</div>
                        )}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fin de carrera */}
          {phase === PHASES.OVER && (
            <div
              className="rounded-xl p-5 text-center ring-1 ring-zinc-800/80 lg:p-7"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #17120e 0 46px, #1c1611 46px 92px), linear-gradient(180deg, #1a1410, #0e0b08)",
                backgroundBlendMode: "overlay",
              }}
            >
              <BootsIllustration />
              <div className="mb-3 mt-3 text-lg font-extrabold lg:text-xl">
                Tu carrera llegó a su fin
              </div>

              {/* Puntaje de leyenda */}
              <div className="mx-auto mb-4 flex max-w-[280px] flex-col items-center rounded-xl bg-black/40 px-4 py-3">
                <div className="text-[9px] font-black tracking-[0.2em] text-zinc-500">
                  PUNTAJE DE LEYENDA
                </div>
                <div
                  className="text-4xl font-black leading-tight"
                  style={{ color: legendColor(score) }}
                >
                  {score}
                  <span className="text-lg text-zinc-600">/100</span>
                </div>
                <div
                  className="text-[13px] font-extrabold"
                  style={{ color: legendColor(score) }}
                >
                  {legendTitle(score)}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, background: legendColor(score) }}
                  />
                </div>
                {player.earnings > 0 && (
                  <div className="mt-2 text-[11px] font-semibold text-zinc-400">
                    Ganancias de carrera:{" "}
                    <span className="font-black text-amber-400">€{player.earnings}M</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => shareCareer(true)}
                  disabled={sharing}
                  className="rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-colors hover:bg-zinc-200 disabled:opacity-60"
                >
                  {sharing ? "Generando…" : "Copiar imagen"}
                </button>
                <button
                  type="button"
                  onClick={() => shareCareer(false)}
                  disabled={sharing}
                  className="rounded-full border border-zinc-500 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
                >
                  Descargar
                </button>
                <button
                  type="button"
                  onClick={() => setShowHof(true)}
                  className="rounded-full border border-zinc-500 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-zinc-800"
                >
                  Salón de la Fama
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="rounded-full border border-zinc-500 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-zinc-800"
                >
                  Volver a jugar
                </button>
              </div>
              {shareMsg && (
                <div className="mt-3 text-[12px] font-semibold text-emerald-400">{shareMsg}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
