import { useState, useMemo, useRef, useEffect } from "react";
import { ALL_COUNTRIES } from "../data";

export default function CountryPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = value ? ALL_COUNTRIES.find((c) => c.n === value) : null;

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

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (country) => {
    onChange(country.n);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#1a1a1a",
          borderRadius: 8,
          padding: "8px 10px",
          border: "1px solid #333",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ opacity: 0.5, fontSize: 13 }}>🔍</span>
        {open ? (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar país"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 13,
              outline: "none",
              flex: 1,
              width: "100%",
            }}
          />
        ) : selected ? (
          <span style={{ fontSize: 13 }}>
            {selected.f} {selected.n}
          </span>
        ) : (
          <span style={{ color: "#555", fontSize: 13 }}>Buscar país</span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 240,
            overflowY: "auto",
            background: "#111",
            border: "1px solid #333",
            borderRadius: "0 0 8px 8px",
            zIndex: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {filtered.slice(0, 80).map((c) => (
            <div
              key={c.n}
              onClick={() => handleSelect(c)}
              style={{
                padding: "7px 10px",
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
                borderBottom: "1px solid #1a1a1a",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>{c.f}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.n}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
