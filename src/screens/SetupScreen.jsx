import { useState } from "react";
import { CountryPicker, PitchSelector } from "../components";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

export default function SetupScreen({ onConfirm }) {
  const [surname, setSurname] = useState("");
  const [number, setNumber] = useState(7);
  const [foot, setFoot] = useState("Derecha");
  const [country, setCountry] = useState("");
  const [position, setPosition] = useState("");

  const canConfirm = surname.trim() && country && position;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({ surname: surname.trim(), number, foot, country, position });
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
      <div style={{ background: "#111", borderRadius: 14, padding: 20, border: "1px solid #222" }}>
        <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 900 }}>Definí tu identidad</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Columna 1: Identidad */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#eab308", marginBottom: 10, textAlign: "center" }}>
              Identidad
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>APELLIDO</div>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>NÚMERO</div>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={number}
                onChange={handleNumberChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                }}
                style={{ ...inputStyle, MozAppearance: "textfield", appearance: "textfield" }}
              />
            </div>

            <div>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>PIERNA HÁBIL</div>
              <div style={{ display: "flex", gap: 4 }}>
                {["Izquierda", "Derecha"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFoot(f)}
                    style={{
                      flex: 1,
                      padding: "7px",
                      borderRadius: 6,
                      border: foot === f ? "2px solid #fff" : "1px solid #333",
                      background: foot === f ? "#fff" : "transparent",
                      color: foot === f ? "#000" : "#fff",
                      fontSize: 12,
                      fontWeight: foot === f ? 700 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 2: Nacionalidad */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, textAlign: "center" }}>
              Nacionalidad
            </div>
            <CountryPicker value={country} onChange={setCountry} />
          </div>

          {/* Columna 3: Posición */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, textAlign: "center" }}>
              Posición
            </div>
            <PitchSelector value={position} onChange={setPosition} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: "10px 28px",
              borderRadius: 20,
              border: "1px solid #fff",
              background: "transparent",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              opacity: canConfirm ? 1 : 0.3,
            }}
          >
            Confirmar identidad
          </button>
        </div>
      </div>
    </div>
  );
}
