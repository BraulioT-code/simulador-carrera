import { useEffect, useState } from "react";
import { getLogoUrl, LOGO_SEARCH_NAMES, getTeamColor } from "../data";

// Caché en memoria + localStorage para búsquedas en TheSportsDB
const memCache = new Map();
const LS_KEY = "clubLogoCache_v1";
let lsCache = {};
try {
  lsCache = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
} catch {
  lsCache = {};
}

async function lookupLogo(team) {
  if (memCache.has(team)) return memCache.get(team);
  if (team in lsCache) {
    memCache.set(team, lsCache[team]);
    return lsCache[team];
  }
  const q = LOGO_SEARCH_NAMES[team] || team;
  let url = null;
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`
    );
    if (res.ok) {
      const data = await res.json();
      url = data?.teams?.[0]?.strBadge || null;
    }
  } catch {
    url = null;
  }
  memCache.set(team, url);
  lsCache[team] = url;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(lsCache));
  } catch {
    /* sin espacio */
  }
  return url;
}

function Monogram({ team, league, size }) {
  const color = getTeamColor(team, league);
  const initials = team
    .replace(/[.'']/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-black text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.38,
        textShadow: "0 1px 2px rgba(0,0,0,.5)",
        border: "1px solid rgba(255,255,255,.25)",
      }}
    >
      {initials}
    </span>
  );
}

/** Escudo real del club, con monograma de respaldo si no se consigue */
export default function ClubLogo({ team, league, size = 22, className = "" }) {
  const direct = getLogoUrl(team);
  const [url, setUrl] = useState(direct);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    if (direct) {
      setUrl(direct);
    } else {
      setUrl(null);
      lookupLogo(team).then((u) => {
        if (alive) setUrl(u);
      });
    }
    return () => {
      alive = false;
    };
  }, [team, direct]);

  if (!url || failed) return <Monogram team={team} league={league} size={size} />;

  return (
    <img
      src={url}
      alt={team}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
