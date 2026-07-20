const EVENTS = [
  {
    title: "Lesión muscular",
    desc: "Sufriste una lesión en entrenamiento.",
    choices: [
      { label: "Tratamiento conservador", sub: "Volvés rápido pero con riesgo", eff: { ovr: -1 } },
      { label: "Cirugía completa", sub: "Mejor recuperación a largo plazo", eff: { ovr: 1 } },
    ],
  },
  {
    title: "Entrenamiento extra",
    desc: "Rutina intensa de pretemporada: podés mejorar rápido, pero arriesgás una lesión.",
    choices: [
      { label: "Aceptar", sub: "+3 OVR (70%) / -2 OVR (30%)", eff: "gamble" },
      { label: "Priorizar el descanso", sub: "Sin cambios", eff: {} },
    ],
  },
  {
    title: "Selección Nacional",
    desc: "Recibiste una convocatoria a la selección.",
    choices: [
      { label: "Aceptar con orgullo", sub: "+Caps internacionales", eff: { intCaps: true, rep: 10 } },
      { label: "Declinar", sub: "Cuidar el físico", eff: { morale: 5 } },
    ],
  },
  {
    title: "Escándalo mediático",
    desc: "Un periodista publicó rumores sobre tu vida privada.",
    choices: [
      { label: "Ignorar", sub: "Enfocarte en jugar", eff: { morale: 3 } },
      { label: "Desmentir", sub: "Ganar credibilidad", eff: { rep: 5 } },
    ],
  },
  {
    title: "Conflicto en vestuario",
    desc: "Tuviste un cruce fuerte con un compañero.",
    choices: [
      { label: "Pedir disculpas", sub: "Vestuario más unido", eff: { morale: 8 } },
      { label: "Mantener postura", sub: "Carácter fuerte", eff: { rep: 3 } },
    ],
  },
  {
    title: "Evento benéfico",
    desc: "Te invitan a un evento solidario.",
    choices: [
      { label: "Asistir", sub: "Mejor imagen pública", eff: { rep: 8 } },
      { label: "Entrenar", sub: "Mejor forma física", eff: { ovr: 1 } },
    ],
  },
  {
    title: "Renovación de contrato",
    desc: "El club te ofrece renovar con mejora salarial.",
    choices: [
      { label: "Renovar", sub: "Estabilidad", eff: { morale: 10 } },
      { label: "Rechazar", sub: "Buscar nuevos horizontes", eff: {} },
    ],
  },
];

export default EVENTS;
