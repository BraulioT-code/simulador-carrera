// Eventos entre temporadas. eff puede ser:
//  { ovr, rep, morale, intCaps } — efectos directos
//  "gamble"  — apuesta: 70% +3 OVR / 30% -2 OVR
//  {} — sin efecto
// w: peso en el sorteo (default 1) — las lesiones son poco frecuentes
const EVENTS = [
  {
    title: "Lesión muscular",
    w: 0.4,
    desc: "Sufriste una lesión en entrenamiento.",
    choices: [
      { label: "Tratamiento conservador", sub: "Volvés rápido pero con riesgo (-1 OVR)", eff: { ovr: -1 } },
      { label: "Cirugía completa", sub: "Mejor recuperación a largo plazo (+1 OVR)", eff: { ovr: 1 } },
    ],
  },
  {
    title: "Lesión de ligamentos",
    w: 0.25,
    desc: "Una entrada dura te dejó fuera varios meses. Cómo encares la recuperación marca tu futuro.",
    choices: [
      { label: "Rehabilitación exprés", sub: "Volver ya, a medias (-3 OVR)", eff: { ovr: -3 } },
      { label: "Recuperación completa", sub: "Paciencia y trabajo (-1 OVR)", eff: { ovr: -1 } },
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
    title: "Pretemporada en la altura",
    desc: "El club organiza una pretemporada exigente en la montaña.",
    choices: [
      { label: "Ir con todo", sub: "Físico de élite (+2 OVR)", eff: { ovr: 2 } },
      { label: "Trabajo regenerativo", sub: "Cuidar el cuerpo (+moral)", eff: { morale: 6 } },
    ],
  },
  {
    title: "Entrenador personal",
    desc: "Un preparador de élite ofrece trabajar con vos en el receso.",
    choices: [
      { label: "Contratarlo", sub: "Mejora técnica (+2 OVR)", eff: { ovr: 2 } },
      { label: "Vacaciones en familia", sub: "Cabeza fresca (+moral)", eff: { morale: 8 } },
    ],
  },
  {
    title: "Videoanálisis táctico",
    desc: "El cuerpo técnico te propone sesiones extra de video para pulir tu juego.",
    choices: [
      { label: "Sumarse", sub: "Lectura de juego (+1 OVR)", eff: { ovr: 1 } },
      { label: "Confiar en el instinto", sub: "Sin cambios", eff: {} },
    ],
  },
  {
    title: "Crisis de confianza",
    desc: "Encadenaste malos partidos y los hinchas empiezan a silbar.",
    choices: [
      { label: "Encerrarte en tu juego", sub: "El bajón se nota (-2 OVR)", eff: { ovr: -2 } },
      { label: "Trabajar con psicólogo", sub: "Fortaleza mental (+moral)", eff: { morale: 8, ovr: 1 } },
    ],
  },
  {
    title: "Vida nocturna",
    desc: "Te fotografiaron saliendo de fiesta en plena temporada.",
    choices: [
      { label: "Seguir el ritmo", sub: "El físico lo paga (-2 OVR)", eff: { ovr: -2, rep: -5 } },
      { label: "Cortar por lo sano", sub: "Profesionalismo (+1 OVR)", eff: { ovr: 1 } },
    ],
  },
  {
    title: "Nutricionista de élite",
    desc: "Un especialista en rendimiento deportivo quiere rediseñar tu dieta.",
    choices: [
      { label: "Cambiar la dieta", sub: "+3 OVR (70%) / -2 OVR (30%)", eff: "gamble" },
      { label: "Mantener la rutina", sub: "Sin cambios", eff: {} },
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
    title: "Oferta publicitaria",
    desc: "Una marca deportiva te ofrece una campaña millonaria que exige tiempo de rodaje.",
    choices: [
      { label: "Firmar la campaña", sub: "Fama mundial (+rep)", eff: { rep: 12 } },
      { label: "Rechazar y entrenar", sub: "Foco total (+2 OVR)", eff: { ovr: 2 } },
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
