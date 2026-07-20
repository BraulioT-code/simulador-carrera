import { useState } from "react";
import { CountryPicker, PitchSelector, JerseyPreview } from "../components";

export default function SetupScreen({ onConfirm }) {
  const [surname, setSurname] = useState("");
  const [number, setNumber] = useState(10);
  const [foot, setFoot] = useState("Derecha");
  const [country, setCountry] = useState("");
  const [position, setPosition] = useState("");

  const canConfirm = surname.trim() && country && position;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({ surname: surname.trim(), number: number || 10, foot, country, position });
  };

  const handleBack = () => {
    setSurname("");
    setNumber(10);
    setFoot("Derecha");
    setCountry("");
    setPosition("");
  };

  const handleNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v === "") {
      setNumber("");
    } else {
      setNumber(Math.min(99, Math.max(1, parseInt(v))));
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-4">
      <div className="overflow-hidden rounded-2xl bg-[#0d0d10] shadow-2xl ring-1 ring-zinc-800/60">
        {/* Encabezado */}
        <div className="border-b border-zinc-800/70 px-7 py-5">
          <h1 className="text-2xl font-black tracking-tight">Definí tu identidad</h1>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 gap-8 px-7 py-6 md:grid-cols-[1fr_1.3fr_1fr]">
          {/* Columna 1: Identidad */}
          <div>
            <div className="mb-4 text-center text-base font-extrabold">Identidad</div>

            <JerseyPreview surname={surname} number={number} />

            <div className="mt-5 flex gap-3">
              <div className="flex-1">
                <div className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-zinc-500">
                  APELLIDO
                </div>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value.toUpperCase())}
                  placeholder="APELLIDO"
                  className="w-full rounded-lg bg-zinc-800/70 px-3 py-2.5 text-[13px] font-bold text-white outline-none ring-1 ring-transparent placeholder:text-zinc-600 focus:ring-zinc-500"
                />
              </div>
              <div className="w-20">
                <div className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-zinc-500">
                  NÚMERO
                </div>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={number}
                  onChange={handleNumberChange}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                  className="w-full rounded-lg bg-zinc-800/70 px-3 py-2.5 text-center text-[13px] font-bold text-white outline-none ring-1 ring-transparent focus:ring-zinc-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-zinc-500">
                PIERNA HÁBIL
              </div>
              <div className="flex rounded-xl bg-zinc-800/70 p-1">
                {["Izquierda", "Derecha"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFoot(f)}
                    className={`flex-1 rounded-lg py-2 text-[13px] transition-colors ${
                      foot === f
                        ? "bg-white font-extrabold text-black"
                        : "font-semibold text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Nacionalidad */}
          <div>
            <div className="mb-4 text-center text-base font-extrabold">Nacionalidad</div>
            <CountryPicker value={country} onChange={setCountry} />
          </div>

          {/* Columna 3: Posición */}
          <div>
            <div className="mb-4 text-center text-base font-extrabold">Posición</div>
            <PitchSelector value={position} onChange={setPosition} />
          </div>
        </div>

        {/* Pie */}
        <div className="flex items-center justify-between border-t border-zinc-800/70 px-7 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-zinc-500 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`rounded-full px-7 py-2.5 text-sm font-bold transition-colors ${
              canConfirm
                ? "bg-white text-black hover:bg-zinc-200"
                : "cursor-not-allowed bg-zinc-600/60 text-zinc-300"
            }`}
          >
            Confirmar identidad
          </button>
        </div>
      </div>
    </div>
  );
}
