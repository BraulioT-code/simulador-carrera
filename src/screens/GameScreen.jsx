import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PlayerHeader,
  StatsBar,
  TrophyCabinet,
  Timeline,
  Flag,
  ClubLogo,
  TrophyCelebration,
  HallOfFame,
  Leaderboard,
  PublishCareer,
} from "../components";
import { SEQ } from "../components/CountUp";
import { careerKey, isPublished, isBackendEnabled } from "../utils/leaderboard";
import { ALL_COUNTRIES, POS_MAP, PHASES, teamTint, getClubRating } from "../data";
import { marketValue } from "../utils/helpers";
import { generateCareerImage } from "../utils/careerImage";
import { legendScore, legendTitle, legendColor } from "../utils/legend";
import { getCareerAges } from "../utils/gameLogic";

/** Sección colapsable — solo colapsa en mobile, siempre visible en desktop */
function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      {/* Header — solo visible en mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between lg:hidden"
        style={{
          padding: "8px 0 6px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          marginBottom: open ? 8 : 0,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none"
          style={{ opacity: 0.4, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M4 6l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Contenido: en mobile respeta collapsed, en desktop siempre visible */}
      <div className={open ? "block" : "hidden lg:block"}>
        {children}
      </div>
    </div>
  );
}

/** Columna izquierda con secciones colapsables en mobile */
function ColA({ player, natData, posData, marketVal, tPJ, tPJMax, tGLS, tAST, tGC, tVI, isGK, tNTCaps, tNTGls, tNTAst, tNTGc, tNTVi, allTrophies, history }) {
  return (
    <div className="shrink-0 lg:flex lg:flex-col lg:overflow-y-auto lg:pb-2 dark-scroll">
      <PlayerHeader player={player} natData={natData} posData={posData} marketVal={marketVal} />
      {history.length > 0 && (
        <CollapsibleSection title="Total de carrera" defaultOpen={false}>
          <StatsBar
            pj={tPJ} pjMax={tPJMax} gls={tGLS} ast={tAST} gc={tGC} vi={tVI}
            isGK={isGK}
            ntCaps={tNTCaps} ntGls={tNTGls} ntAst={tNTAst} ntGc={tNTGc} ntVi={tNTVi}
            natCode={natData?.c}
          />
        </CollapsibleSection>
      )}
      {(allTrophies.length > 0 || history.length > 0) && (
        <div className={allTrophies.length === 0 ? "hidden lg:block" : ""}>
          <CollapsibleSection title={`Vitrina · ${allTrophies.length} trofeo${allTrophies.length !== 1 ? "s" : ""}`} defaultOpen={false}>
            <TrophyCabinet trophies={allTrophies} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

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

/** Chip con el ranking del club — estilo 1b */
function RankChip({ rating, current }) {
  const diff = rating - current;
  const better = diff >= 3;
  const worse = diff <= -3;
  return (
    <div
      style={{
        marginTop: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        padding: "2px 8px",
        borderRadius: 4,
        fontFamily: "'Barlow Condensed', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 11,
        background: better
          ? "rgba(46,125,50,.15)"
          : worse
          ? "rgba(211,47,47,.12)"
          : "rgba(255,255,255,.05)",
        color: better ? "#66BB6A" : worse ? "#EF5350" : "rgba(255,255,255,.4)",
      }}
      title={`Ranking del club: ${rating}`}
    >
      {better ? "▲" : worse ? "▼" : "="} RANK {rating}
    </div>
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
  realisticMode,
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
  const currentRating = getClubRating(player.team, player.league);
  const tNTCaps = history.reduce((s, h) => s + (h.nt?.caps || 0), 0);
  const tNTGls = history.reduce((s, h) => s + (h.nt?.gls || 0), 0);
  const tNTAst = history.reduce((s, h) => s + (h.nt?.ast || 0), 0);
  const tNTGc = history.reduce((s, h) => s + (h.nt?.gc || 0), 0);
  const tNTVi = history.reduce((s, h) => s + (h.nt?.vi || 0), 0);
  const allTrophies = history.flatMap((h) => h.trophies || []);

  const [shareMsg, setShareMsg] = useState("");
  const [sharing, setSharing] = useState(false);
  const [showHof, setShowHof] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [publishedId, setPublishedId] = useState(null);

  const alreadyPublished =
    publishedId !== null ||
    (phase === PHASES.OVER && isPublished(careerKey(player, history)));

  // La celebración espera a que termine la secuencia de números de la temporada
  // (OVR → Valor → OVR de la fila → PJ → GLS → AST) y entra 1s después.
  const [showCelebration, setShowCelebration] = useState(false);
  const prevSeasons = useRef(history.length);

  useEffect(() => {
    const isNewSeason = history.length > prevSeasons.current;
    prevSeasons.current = history.length;

    if (!celebration) {
      setShowCelebration(false);
      return undefined;
    }
    // Tras un evento (penal, Mundial) no hay secuencia de números: entra enseguida
    const wait = isNewSeason ? SEQ.celebration : 350;
    const t = setTimeout(() => setShowCelebration(true), wait);
    return () => clearTimeout(t);
  }, [celebration, history.length]);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    onDismissCelebration();
  }, [onDismissCelebration]);

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
    <div className="flex min-h-[100dvh] flex-col lg:h-[100dvh] lg:overflow-hidden">
      <TrophyCelebration trophy={showCelebration ? celebration : null} onDone={dismissCelebration} />
      {showHof && <HallOfFame onClose={() => setShowHof(false)} />}
      {showRanking && (
        <Leaderboard onClose={() => setShowRanking(false)} highlightId={publishedId} />
      )}
      {showPublish && (
        <PublishCareer
          player={player}
          history={history}
          natData={natData}
          score={score}
          title={legendTitle(score)}
          onClose={() => setShowPublish(false)}
          onDone={(career) => {
            setPublishedId(career?.id ?? null);
            setShowPublish(false);
            setShowRanking(true);
          }}
        />
      )}

      {/*
        ── Layout de 3 columnas en desktop, stacked en mobile ──
        Col 1 (360px): identidad del jugador
        Col 2 (1fr):   línea de tiempo
        Col 3 (340px): panel de acción actual
        Cada columna scrollea de forma independiente para evitar scroll global.
      */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col p-3 lg:grid lg:grid-cols-[360px_1fr_340px] lg:gap-x-4 lg:overflow-hidden lg:p-5"
        style={{ minHeight: 0 }}>

        {/* Bloque A: jugador — Col 1 */}
        <ColA
          player={player}
          natData={natData}
          posData={posData}
          marketVal={mv}
          tPJ={tPJ} tPJMax={tPJMax} tGLS={tGLS} tAST={tAST} tGC={tGC} tVI={tVI}
          isGK={isGK}
          tNTCaps={tNTCaps} tNTGls={tNTGls} tNTAst={tNTAst} tNTGc={tNTGc} tNTVi={tNTVi}
          allTrophies={allTrophies}
          history={history}
        />

        {/* Bloque B: línea de tiempo — Col 2 */}
        <div className="flex flex-1 flex-col lg:overflow-y-auto lg:pb-2 dark-scroll" style={{ minHeight: 0 }}>
          <Timeline
            history={history}
            currentAge={player.age}
            showCurrent={phase !== PHASES.OVER}
            isGK={isGK}
            natCode={natData?.c}
            nationality={player.nationality}
            ages={getCareerAges(realisticMode)}
          />
        </div>

        {/* Bloque C: acción actual — Col 3 */}
        <div className="mt-3 shrink-0 pb-6 lg:col-start-3 lg:mt-0 lg:overflow-y-auto lg:pb-2 dark-scroll">
          {headline && phase !== PHASES.OVER && (
            <div
              className="mb-2 flex items-start gap-2"
              style={{
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  padding: "3px 8px",
                  background: "rgba(255,255,255,.08)",
                  borderRadius: 4,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: 1,
                }}
              >
                Prensa
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontStyle: "italic", lineHeight: 1.5 }}>
                "{headline}"
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
                {offers.map((o, i) => {
                  const oTeamColor = teamTint(o.team, o.league, 0.6);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onPickClub(o)}
                      className="flex min-w-0 flex-1 flex-col items-center justify-between p-2.5 text-center transition-all lg:p-3"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: "1px solid rgba(255,255,255,.06)",
                        borderTop: `2px solid ${oTeamColor}`,
                        borderRadius: 8,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
                    >
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>Fichar por</div>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#fff",
                          margin: "2px 0 6px",
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.team}
                      </div>
                      <ClubLogo team={o.team} league={o.league} size={36} />
                      <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,.4)" }}>
                        <Flag code={o.code} className="w-3.5 h-[10px]" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.league}</span>
                      </div>
                      <RankChip
                        rating={o.rating ?? getClubRating(o.team, o.league)}
                        current={currentRating}
                      />
                    </button>
                  );
                })}
              </div>

              {phase === PHASES.TRANSFER && canStay && (
                <button
                  type="button"
                  onClick={onStay}
                  className="mt-2 w-full py-2.5 text-[13px] font-semibold transition-colors"
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 8,
                    color: "rgba(255,255,255,.5)",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
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
              className="w-full py-3 text-sm font-extrabold transition-colors"
              style={{
                background: "linear-gradient(135deg,#92750B,#C9A227)",
                borderRadius: 8,
                color: "#080C14",
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                fontSize: 16,
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              Simular Temporada · {player.age} años
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
                {isBackendEnabled && (
                  <button
                    type="button"
                    onClick={() => (alreadyPublished ? setShowRanking(true) : setShowPublish(true))}
                    className={`rounded-full px-6 py-2.5 text-[13px] font-bold transition-colors ${
                      alreadyPublished
                        ? "border border-zinc-500 text-white hover:bg-zinc-800"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                    }`}
                  >
                    {alreadyPublished ? "Ver ranking global" : "Publicar en el ranking"}
                  </button>
                )}
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
