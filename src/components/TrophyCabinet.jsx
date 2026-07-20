import Trophy from "./Trophy";

/**
 * Vitrina: agrupa trofeos repetidos y muestra cada uno con su nombre
 * (ej: "Liga BetPlay ×2", "Champions League", "Balón de Oro").
 */
export default function TrophyCabinet({ trophies }) {
  if (trophies.length === 0) {
    return (
      <div className="mb-2 px-1 py-2 text-center opacity-40">
        <Trophy type="liga" size={20} />
        <div className="mt-1 text-[10px] font-semibold tracking-widest text-zinc-500">
          VITRINA VACÍA
        </div>
      </div>
    );
  }

  // Agrupar por nombre
  const grouped = [];
  for (const t of trophies) {
    const found = grouped.find((g) => g.n === t.n);
    if (found) found.count += 1;
    else grouped.push({ ...t, count: 1 });
  }

  return (
    <div className="mb-2 flex flex-wrap items-end justify-start gap-x-3 gap-y-2 px-1 py-2">
      {grouped.map((g, i) => (
        <div key={i} className="flex w-14 flex-col items-center text-center">
          <Trophy type={g.t} name={g.n} size={26} />
          <div className="mt-1 text-[8px] font-semibold leading-tight text-zinc-400">
            {g.n}
            {g.count > 1 && <span className="ml-0.5 font-black text-white">×{g.count}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
