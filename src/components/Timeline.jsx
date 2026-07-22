import { useState, useEffect, useRef } from "react";
import { AGES as AGES_DEFAULT, ALL_COUNTRIES, getTeamColor, teamTint } from "../data";
import OvrBadge from "./OvrBadge";
import Trophy from "./Trophy";
import ClubLogo from "./ClubLogo";
import Flag from "./Flag";
import CountUp, { SEQ } from "./CountUp";
import { IconMatches, IconBall, IconAssist, IconGoalConceded, IconCleanSheet } from "./Icons";

function StatCell({ icon, value, w = 36, animate = false, delay = 0 }) {
  const content = !animate
    ? value
    : typeof value === "string" && value.includes("/")
    ? (
      <>
        <CountUp value={value.split("/")[0]} duration={650} delay={delay} />
        <span style={{ opacity: 0.5 }}>/</span>
        <CountUp value={value.split("/")[1]} duration={650} delay={delay} />
      </>
    )
    : <CountUp value={value} duration={650} delay={delay} />;

  return (
    <span
      className={animate ? "stat-reveal" : ""}
      style={{
        width: w,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 3,
        fontFamily: "'Barlow Condensed', system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 13,
        color: "rgba(255,255,255,.45)",
        animationDelay: animate ? `${delay}ms` : undefined,
      }}
    >
      {icon}
      {content}
    </span>
  );
}

const codeOf = (country) => ALL_COUNTRIES.find((c) => c.n === country)?.c;

/** Sección divisor dentro del panel expandido */
function ExpandDivider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,.06)", margin: "6px 0" }} />;
}

/**
 * Panel expandido de una temporada:
 * muestra trofeos ganados, estadísticas de selección y podio Balón de Oro.
 */
function ExpandedRow({ trophies, nt, ballonPodium, natCode, nationality, isGK }) {
  const hasTrophies = (trophies || []).length > 0;
  const hasNt = !!nt;
  const hasBallon = !!ballonPodium;

  return (
    <div
      style={{
        margin: "0 4px 3px",
        marginTop: -2,
        borderRadius: "0 0 8px 8px",
        border: "1px solid rgba(255,255,255,.07)",
        borderTop: "none",
        background: "rgba(255,255,255,.025)",
        padding: "8px 12px 10px 52px",
      }}
    >
      {/* ── Trofeos ── */}
      {hasTrophies && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.25)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Trofeos
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {trophies.map((t, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: "rgba(201,162,39,.1)",
                  border: "1px solid rgba(201,162,39,.2)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.7)",
                }}
              >
                <Trophy type={t.t} name={t.n} size={13} />
                {t.n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Selección nacional ── */}
      {hasNt && (
        <div style={hasTrophies ? { marginTop: 6 } : {}}>
          {hasTrophies && <ExpandDivider />}
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(66,165,245,.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Selección
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800, color: "#42A5F5", letterSpacing: "0.06em" }}>
              <Flag code={natCode} className="w-4 h-[11px]" />
              {nationality?.toUpperCase()}
            </span>
            {(nt.comps || []).map((c, i) => (
              <span
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "rgba(21,101,192,.3)", padding: "2px 7px",
                  borderRadius: 4, fontSize: 9, fontWeight: 700, color: "#90CAF9",
                }}
                title={c.stage || undefined}
              >
                {c.n} <span style={{ color: "#fff" }}>{c.pj}</span>
                {c.stage && <span style={{ color: "rgba(144,202,249,.6)" }}>· {c.stage}</span>}
                {c.rival && (
                  <>
                    <span style={{ color: "rgba(144,202,249,.6)" }}>vs</span>
                    <Flag code={codeOf(c.rival)} className="w-3.5 h-[10px]" />
                    <span style={{ color: "#fff" }}>{c.rival}</span>
                    {c.won === true && <span style={{ fontWeight: 900, color: "#66BB6A" }}>✓</span>}
                    {c.won === false && <span style={{ fontWeight: 900, color: "#EF5350" }}>✗</span>}
                  </>
                )}
              </span>
            ))}
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
              <IconMatches size={10} /> {nt.caps} PJ
            </span>
            {isGK ? (
              <>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
                  <IconGoalConceded size={10} /> {nt.gc}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
                  <IconCleanSheet size={10} /> {nt.vi}
                </span>
              </>
            ) : (
              <>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
                  <IconBall size={10} /> {nt.gls}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>
                  <IconAssist size={10} /> {nt.ast}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Balón de Oro ── */}
      {hasBallon && (
        <div style={(hasTrophies || hasNt) ? { marginTop: 6 } : {}}>
          {(hasTrophies || hasNt) && <ExpandDivider />}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px" }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: "#C9A227" }}>BALÓN DE ORO</span>
            {ballonPodium.map((p, i) => (
              <span
                key={i}
                style={{
                  padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                  background: p.you ? "rgba(201,162,39,.15)" : "rgba(255,255,255,.06)",
                  color: p.you ? "#C9A227" : "rgba(255,255,255,.4)",
                  outline: p.you ? "1px solid rgba(201,162,39,.3)" : "none",
                }}
              >
                {i + 1}º {p.name}<span style={{ opacity: 0.6 }}> · {p.club}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Timeline({
  history,
  currentAge,
  showCurrent = true,
  isGK = false,
  natCode,
  nationality,
  ages,
  fillHeight = false,
  showAll = false,
}) {
  const AGES = ages ?? AGES_DEFAULT;
  const [openAge, setOpenAge] = useState(null);
  const lastAge = history.length ? history[history.length - 1].age : null;

  // showAll: carrera terminada → todos los ages sin ventana.
  // Normal: ventana de 7 anclada al age actual.
  const WINDOW = 7;
  const curIdx = currentAge != null ? AGES.indexOf(currentAge) : -1;
  const anchorIdx = curIdx !== -1 ? curIdx : AGES.length - 1;
  const endIdx = Math.min(AGES.length, anchorIdx + 2);
  const startIdx = Math.max(0, endIdx - WINDOW);
  const visibleAges = showAll ? AGES : AGES.slice(startIdx, startIdx + WINDOW);
  const scrollRef = useRef(null);
  const anchorRef = useRef(null);

  // En mobile: scroll al final de las filas rellenas cada vez que cambia el historial
  useEffect(() => {
    const el = scrollRef.current;
    const anchor = anchorRef.current;
    if (!el) return;
    // Deja un pequeño delay para que el render de la nueva fila termine
    const t = setTimeout(() => {
      if (anchor) {
        anchor.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }, 80);
    return () => clearTimeout(t);
  }, [history.length, currentAge]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Encabezado de columnas */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px 8px",
          fontSize: 9,
          fontWeight: 600,
          color: "rgba(255,255,255,.2)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        <span style={{ width: 28, textAlign: "center", flexShrink: 0 }}>Edad</span>
        <span style={{ width: 20, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Club</span>
        <span style={{ width: 40, textAlign: "center", flexShrink: 0 }}>OVR</span>
        <span style={{ width: 56, textAlign: "right", flexShrink: 0 }}>PJ</span>
        <span style={{ width: 32, textAlign: "right", flexShrink: 0 }}>{isGK ? "GC" : "GLS"}</span>
        <span style={{ width: 32, textAlign: "right", flexShrink: 0 }}>{isGK ? "VI" : "AST"}</span>
      </div>

      {/* Mobile: showAll = libre (carrera terminada). fillHeight = flex-1. Normal: 220px. */}
      <div
        ref={scrollRef}
        className={`timeline-rows flex flex-col gap-[3px] overflow-y-auto dark-scroll lg:flex-1 ${fillHeight || showAll ? "flex-1" : ""}`}
        style={fillHeight || showAll ? undefined : { maxHeight: 220 }}
      >
        {visibleAges.map((age) => {
          const row = history.find((h) => h.age === age);
          const isCurrent = age === currentAge && !row && showCurrent;
          const isFuture = age > (currentAge || 0) && !row;
          const teamColor = row ? getTeamColor(row.team, row.league) : "#3f3f46";
          const tint = row ? teamTint(row.team, row.league, 0.15) : "transparent";
          const tintBorder = row ? teamTint(row.team, row.league, 0.28) : "transparent";

          const hasNt = !!row?.nt;
          const hasTrophies = (row?.trophies || []).length > 0;
          const expandable = hasNt || !!row?.ballonPodium || hasTrophies;
          const open = expandable && openAge === age;
          const isNew = !!row && age === lastAge;

          // Fade gradual para filas futuras
          const futureIndex = isFuture
            ? visibleAges.indexOf(age) - visibleAges.indexOf(currentAge || visibleAges[0])
            : 0;
          const futureOpacity = isFuture
            ? Math.max(0.05, 0.3 - futureIndex * 0.06)
            : 1;

          // Fila que queremos mantener visible al hacer scroll automático
          const isAnchor = isCurrent || (!!row && age === lastAge);

          return (
            <div key={age} ref={isAnchor ? anchorRef : null}>
              <div
                onClick={expandable ? () => setOpenAge(open ? null : age) : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: open ? "8px 8px 0 0" : 8,
                  background: row
                    ? `linear-gradient(90deg, ${tint}, rgba(15,20,32,.92) 85%)`
                    : isCurrent
                    ? "rgba(255,255,255,.025)"
                    : "transparent",
                  border: row
                    ? `1px solid ${tintBorder}`
                    : isCurrent
                    ? "1px solid rgba(255,255,255,.06)"
                    : "1px solid transparent",
                  borderLeft: row ? `3px solid ${teamColor}` : isCurrent ? "3px solid rgba(255,255,255,.15)" : "3px solid transparent",
                  opacity: isFuture ? futureOpacity : 1,
                  cursor: expandable ? "pointer" : "default",
                }}
              >
                {/* Edad en Barlow Condensed */}
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: isCurrent ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.45)",
                    width: 28,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {age}
                </span>

                {/* Logo del club */}
                <span style={{ width: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {row ? (
                    <ClubLogo team={row.team} league={row.league} size={18} />
                  ) : isCurrent ? (
                    <ClubLogo team="Libre" size={16} />
                  ) : null}
                </span>

                {/* Nombre del club + trofeos */}
                <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  {row ? (
                    <>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "rgba(255,255,255,.75)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.team}
                      </span>
                      <span style={{ display: "flex", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                        {(row.trophies || []).map((t, i) => (
                          <Trophy key={i} type={t.t} name={t.n} size={12} />
                        ))}
                      </span>
                      {expandable && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            padding: "1px 5px",
                            borderRadius: 4,
                            fontSize: 8,
                            fontWeight: 800,
                            flexShrink: 0,
                            background: hasNt
                              ? "rgba(21,101,192,.3)"
                              : hasTrophies
                              ? "rgba(201,162,39,.15)"
                              : "rgba(201,162,39,.15)",
                            color: hasNt ? "#42A5F5" : "#C9A227",
                          }}
                          title={
                            hasNt
                              ? "Ver estadísticas con la selección"
                              : hasTrophies
                              ? "Ver detalles de trofeos"
                              : "Ver podio del Balón de Oro"
                          }
                        >
                          {hasNt ? (
                            <Flag code={natCode} className="w-3 h-[8px]" />
                          ) : hasTrophies ? (
                            <span aria-hidden style={{ fontSize: 9 }}>🏆</span>
                          ) : (
                            <span aria-hidden>●</span>
                          )}
                          <svg
                            width="7"
                            height="7"
                            viewBox="0 0 10 10"
                            style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
                          >
                            <path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </span>
                      )}
                    </>
                  ) : isCurrent ? (
                    <span style={{ fontSize: 12, fontStyle: "italic", color: "rgba(255,255,255,.35)" }}>
                      Eligiendo club…
                    </span>
                  ) : null}
                </span>

                {/* OVR hex + stats */}
                {row && (
                  <>
                    <span
                      className={isNew ? "stat-reveal" : ""}
                      style={{
                        width: 40,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "center",
                        animationDelay: isNew ? `${SEQ.ovrRow}ms` : undefined,
                      }}
                    >
                      <OvrBadge ovr={row.ovr} size={28} animate={isNew} delay={SEQ.ovrRow} />
                    </span>
                    <StatCell
                      icon={<IconMatches size={10} />}
                      value={row.pjMax ? `${row.pj}/${row.pjMax}` : row.pj}
                      w={56}
                      animate={isNew}
                      delay={SEQ.pj}
                    />
                    <StatCell
                      icon={isGK ? <IconGoalConceded size={10} /> : <IconBall size={10} />}
                      value={isGK ? row.gc : row.gls}
                      w={32}
                      animate={isNew}
                      delay={SEQ.gls}
                    />
                    <StatCell
                      icon={isGK ? <IconCleanSheet size={10} /> : <IconAssist size={10} />}
                      value={isGK ? row.vi : row.ast}
                      w={32}
                      animate={isNew}
                      delay={SEQ.ast}
                    />
                  </>
                )}
              </div>

              {open && (
                <ExpandedRow
                  trophies={row.trophies}
                  nt={row.nt}
                  ballonPodium={row.ballonPodium}
                  natCode={natCode}
                  nationality={nationality}
                  isGK={isGK}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
