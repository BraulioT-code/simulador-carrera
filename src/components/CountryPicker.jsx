import { useState, useMemo } from "react";
import { ALL_COUNTRIES } from "../data";
import Flag from "./Flag";

export default function CountryPicker({ value, onChange, listClass = "max-h-[420px]" }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COUNTRIES;
    const normalized = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    return ALL_COUNTRIES.filter((c) =>
      c.n
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .includes(normalized)
    );
  }, [query]);

  return (
    <div>
      {/* Buscador */}
      <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-zinc-800/70 px-3.5 py-2.5">
        <svg width="15" height="15" viewBox="0 0 16 16" className="shrink-0 text-zinc-500">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <line x1="10.7" y1="10.7" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar país"
          className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-500"
        />
      </div>

      {/* Lista visible en 2 columnas */}
      <div
        className={`dark-scroll grid ${listClass} grid-cols-2 content-start gap-x-2 overflow-y-auto rounded-xl bg-zinc-900/80 p-2`}
      >
        {filtered.map((c) => {
          const selected = value === c.n;
          return (
            <button
              key={c.n}
              type="button"
              onClick={() => onChange(c.n)}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[13px] font-bold transition-colors ${
                selected ? "bg-white text-black" : "text-white hover:bg-zinc-800"
              }`}
            >
              <Flag code={c.c} className="w-6 h-[17px]" />
              <span className="truncate">{c.n}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-6 text-center text-[12px] text-zinc-500">
            Sin resultados
          </div>
        )}
      </div>
    </div>
  );
}
