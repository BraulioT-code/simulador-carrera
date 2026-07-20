// Eventos entre temporadas.
// eff: { ovr, rep, morale, intCaps, pjPenalty } | "gamble" | {}
// fx: chips que se muestran en la tarjeta — { t: texto, g: true (verde) | false (rojo) }
// w: peso en el sorteo (default 1) — las lesiones son poco frecuentes
const EVENTS = [
  {
    title: "Lesión muscular",
    w: 0.4,
    desc: "Sufriste una lesión en entrenamiento.",
    choices: [
      {
        label: "Tratamiento conservador",
        fx: [
          { t: "Volvés rápido", g: true },
          { t: "-1 OVR", g: false },
        ],
        eff: { ovr: -1 },
      },
      {
        label: "Cirugía completa",
        fx: [
          { t: "+1 OVR a largo plazo", g: true },
          { t: "Te perdés partidos", g: false },
        ],
        eff: { ovr: 1, pjPenalty: 0.8 },
      },
    ],
  },
  {
    title: "Lesión de ligamentos",
    w: 0.25,
    desc: "Una entrada dura te dejó fuera varios meses. Cómo encares la recuperación marca tu futuro.",
    choices: [
      {
        label: "Rehabilitación exprés",
        fx: [
          { t: "Volvés antes", g: true },
          { t: "-3 OVR", g: false },
        ],
        eff: { ovr: -3 },
      },
      {
        label: "Recuperación completa",
        fx: [
          { t: "Base física sólida", g: true },
          { t: "-1 OVR", g: false },
        ],
        eff: { ovr: -1, pjPenalty: 0.7 },
      },
    ],
  },
  {
    title: "Entrenamiento extra",
    desc: "Rutina intensa de pretemporada: podés mejorar rápido, pero arriesgás una lesión.",
    choices: [
      {
        label: "Aceptar",
        fx: [
          { t: "70%: +3 OVR", g: true },
          { t: "30%: lesión, -2 OVR", g: false },
        ],
        eff: "gamble",
      },
      {
        label: "Priorizar el descanso",
        fx: [{ t: "Sin riesgos", g: true }],
        eff: {},
      },
    ],
  },
  {
    title: "Pretemporada en la altura",
    desc: "El club organiza una pretemporada exigente en la montaña.",
    choices: [
      {
        label: "Ir con todo",
        fx: [{ t: "+2 OVR", g: true }],
        eff: { ovr: 2 },
      },
      {
        label: "Trabajo regenerativo",
        fx: [{ t: "+Moral", g: true }],
        eff: { morale: 6 },
      },
    ],
  },
  {
    title: "Entrenador personal",
    desc: "Un preparador de élite ofrece trabajar con vos en el receso.",
    choices: [
      {
        label: "Contratarlo",
        fx: [{ t: "+2 OVR", g: true }],
        eff: { ovr: 2 },
      },
      {
        label: "Vacaciones en familia",
        fx: [
          { t: "+Moral", g: true },
          { t: "Sin mejora física", g: false },
        ],
        eff: { morale: 8 },
      },
    ],
  },
  {
    title: "Videoanálisis táctico",
    desc: "El cuerpo técnico te propone sesiones extra de video para pulir tu juego.",
    choices: [
      {
        label: "Sumarse",
        fx: [{ t: "+1 OVR", g: true }],
        eff: { ovr: 1 },
      },
      {
        label: "Confiar en el instinto",
        fx: [{ t: "Sin cambios", g: false }],
        eff: {},
      },
    ],
  },
  {
    title: "Crisis de confianza",
    desc: "Encadenaste malos partidos y los hinchas empiezan a silbar.",
    choices: [
      {
        label: "Encerrarte en tu juego",
        fx: [{ t: "-2 OVR", g: false }],
        eff: { ovr: -2 },
      },
      {
        label: "Trabajar con psicólogo",
        fx: [
          { t: "+1 OVR", g: true },
          { t: "+Moral", g: true },
        ],
        eff: { morale: 8, ovr: 1 },
      },
    ],
  },
  {
    title: "Vida nocturna",
    desc: "Te fotografiaron saliendo de fiesta en plena temporada.",
    choices: [
      {
        label: "Seguir el ritmo",
        fx: [
          { t: "-2 OVR", g: false },
          { t: "-Reputación", g: false },
        ],
        eff: { ovr: -2, rep: -5 },
      },
      {
        label: "Cortar por lo sano",
        fx: [{ t: "+1 OVR", g: true }],
        eff: { ovr: 1 },
      },
    ],
  },
  {
    title: "Nutricionista de élite",
    desc: "Un especialista en rendimiento deportivo quiere rediseñar tu dieta.",
    choices: [
      {
        label: "Cambiar la dieta",
        fx: [
          { t: "70%: +3 OVR", g: true },
          { t: "30%: -2 OVR", g: false },
        ],
        eff: "gamble",
      },
      {
        label: "Mantener la rutina",
        fx: [{ t: "Sin cambios", g: false }],
        eff: {},
      },
    ],
  },
  {
    title: "Selección Nacional",
    desc: "Recibiste una convocatoria a la selección.",
    choices: [
      {
        label: "Aceptar con orgullo",
        visual: "flag",
        fx: [
          { t: "Sumás partidos internacionales", g: true },
          { t: "+Reputación", g: true },
        ],
        eff: { intCaps: true, rep: 10 },
      },
      {
        label: "Declinar",
        fx: [
          { t: "Cuidás el físico", g: true },
          { t: "No sumás convocatorias", g: false },
        ],
        eff: { morale: 5 },
      },
    ],
  },
  {
    title: "Escándalo mediático",
    desc: "Un periodista publicó rumores sobre tu vida privada.",
    choices: [
      {
        label: "Ignorar",
        fx: [{ t: "Foco en el juego, +Moral", g: true }],
        eff: { morale: 3 },
      },
      {
        label: "Desmentir",
        fx: [{ t: "+Reputación", g: true }],
        eff: { rep: 5 },
      },
    ],
  },
  {
    title: "Conflicto en vestuario",
    desc: "Tuviste un cruce fuerte con un compañero.",
    choices: [
      {
        label: "Pedir disculpas",
        fx: [{ t: "Vestuario más unido", g: true }],
        eff: { morale: 8 },
      },
      {
        label: "Mantener postura",
        fx: [
          { t: "+Reputación", g: true },
          { t: "Tensión interna", g: false },
        ],
        eff: { rep: 3 },
      },
    ],
  },
  {
    title: "Evento benéfico",
    desc: "Te invitan a un evento solidario.",
    choices: [
      {
        label: "Asistir",
        fx: [{ t: "+Reputación", g: true }],
        eff: { rep: 8 },
      },
      {
        label: "Entrenar",
        fx: [{ t: "+1 OVR", g: true }],
        eff: { ovr: 1 },
      },
    ],
  },
  {
    title: "Oferta publicitaria",
    desc: "Una marca deportiva te ofrece una campaña millonaria que exige tiempo de rodaje.",
    choices: [
      {
        label: "Firmar la campaña",
        fx: [
          { t: "+Reputación", g: true },
          { t: "Menos foco deportivo", g: false },
        ],
        eff: { rep: 12 },
      },
      {
        label: "Rechazar y entrenar",
        fx: [{ t: "+2 OVR", g: true }],
        eff: { ovr: 2 },
      },
    ],
  },
  {
    title: "Renovación de contrato",
    desc: "El club te ofrece renovar con mejora salarial.",
    choices: [
      {
        label: "Renovar",
        fx: [{ t: "Estabilidad, +Moral", g: true }],
        eff: { morale: 10 },
      },
      {
        label: "Rechazar",
        fx: [{ t: "Te jugás al mercado", g: false }],
        eff: {},
      },
    ],
  },
];

export default EVENTS;
