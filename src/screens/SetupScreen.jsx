import { useState } from "react";
import { CountryPicker, PitchSelector, JerseyPreview } from "../components";
import { getKit } from "../data";

const STEPS = ["Nacionalidad", "Identidad", "Posición"];
const MAX_SURNAME = 14;

export default function SetupScreen({ onConfirm, onOpenHallOfFame }) {
  const [step, setStep] = useState(0);
  const [surname, setSurname] = useState("");
  const [number, setNumber] = useState(10);
  const [foot, setFoot] = useState("Derecha");
  const [country, setCountry] = useState("");
  const [position, setPosition] = useState("");

  const kit = getKit(country);
  const canConfirm = surname.trim() && country && position;
  const stepReady = [!!country, !!surname.trim(), !!position][step];

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({ surname: surname.trim(), number: number || 10, foot, country, position });
  };

  const resetAll = () => {
    setSurname("");
    setNumber(10);
    setFoot("Derecha");
    setCountry("");
    setPosition("");
    setStep(0);
  };

  const handleNumberChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    if (v === "") {
      setNumber("");
    } else {
      setNumber(Math.min(99, Math.max(1, parseInt(v))));
    }
  };

  const identityFields = (
    <>
      <div className="mt-5 flex gap-3">
        <div className="flex-1">
          <div className="mb-1.5 text-[9px] font-bold tracking-[0.14em] text-zinc-500">
            APELLIDO
          </div>
          <input
            value={surname}
            onChange={(e) => setSurname(e.target.value.toUpperCase().slice(0, MAX_SURNAME))}
            maxLength={MAX_SURNAME}
            placeholder="APELLIDO"
            className="w-full rounded-lg bg-zinc-800/70 px-3 py-2.5 text-[13px] font-bold text-white outline-none ring-1 ring-transparent placeholder:text-zinc-600 focus:ring-zinc-500"
          />
          <div className="mt-1 text-right text-[9px] font-semibold text-zinc-600">
            {surname.length}/{MAX_SURNAME}
          </div>
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
    </>
  );

  return (
    <>
      {/* ===== MOBILE: wizard de 3 pasos ===== */}
      <div className="flex h-[100dvh] flex-col overflow-hidden md:hidden">
        <div className="shrink-0 px-5 pt-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight">{STEPS[step]}</h1>
            <button
              type="button"
              onClick={onOpenHallOfFame}
              className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] font-bold text-zinc-400 transition-colors hover:text-white"
            >
              Salón de la Fama
            </button>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-teal-400 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
          {step === 0 && (
            <CountryPicker value={country} onChange={setCountry} listClass="max-h-none flex-1" />
          )}
          {step === 1 && (
            <div className="flex flex-1 flex-col justify-center">
              <JerseyPreview surname={surname} number={number} kit={kit} />
              {identityFields}
            </div>
          )}
          {step === 2 && (
            <div className="mx-auto w-full max-w-[360px]">
              <PitchSelector value={position} onChange={setPosition} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-zinc-800/70 px-4 py-3">
          <button
            type="button"
            onClick={() => (step === 0 ? resetAll() : setStep(step - 1))}
            className="rounded-full border border-zinc-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
          >
            Volver
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => stepReady && setStep(step + 1)}
              disabled={!stepReady}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
                stepReady
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "cursor-not-allowed bg-zinc-600/60 text-zinc-300"
              }`}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
                canConfirm
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "cursor-not-allowed bg-zinc-600/60 text-zinc-300"
              }`}
            >
              Confirmar identidad
            </button>
          )}
        </div>
      </div>

      {/* ===== DESKTOP: 3 columnas ===== */}
      <div className="mx-auto hidden max-w-[1200px] p-4 md:block">
        <div className="overflow-hidden rounded-2xl bg-[#0d0d10] shadow-2xl ring-1 ring-zinc-800/60">
          <div className="flex items-center justify-between border-b border-zinc-800/70 px-7 py-5">
            <h1 className="text-2xl font-black tracking-tight">Definí tu identidad</h1>
            <button
              type="button"
              onClick={onOpenHallOfFame}
              className="rounded-full border border-zinc-700 px-4 py-1.5 text-[12px] font-bold text-zinc-400 transition-colors hover:text-white"
            >
              Salón de la Fama
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 px-7 py-6 md:grid-cols-[1fr_1.3fr_1fr]">
            <div>
              <div className="mb-4 text-center text-base font-extrabold">Identidad</div>
              <JerseyPreview surname={surname} number={number} kit={kit} />
              {identityFields}
            </div>

            <div>
              <div className="mb-4 text-center text-base font-extrabold">Nacionalidad</div>
              <CountryPicker value={country} onChange={setCountry} />
            </div>

            <div>
              <div className="mb-4 text-center text-base font-extrabold">Posición</div>
              <PitchSelector value={position} onChange={setPosition} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/70 px-7 py-4">
            <button
              type="button"
              onClick={resetAll}
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
    </>
  );
}
