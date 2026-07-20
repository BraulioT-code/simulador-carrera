import LEAGUES from "./leagues";

/**
 * Ranking de TODOS los clubes del juego (0-100), inspirado en los rankings
 * mundiales de clubes: coeficientes UEFA/Opta en Europa y ranking CONMEBOL
 * en Sudamérica.
 *
 * Los 372 clubes tienen valor propio, agrupados por liga y ordenados de mayor
 * a menor, para que cualquier oferta tenga siempre un nivel definido y las
 * transferencias se puedan comparar entre torneos.
 */
const CLUB_RATINGS = {
  // Premier League — Inglaterra
  "Man. City": 94, Liverpool: 93, Arsenal: 92, Chelsea: 88,
  "Man. United": 86, Tottenham: 86, "Aston Villa": 85, Newcastle: 85,
  Brighton: 82, "Nottingham Forest": 82, "Crystal Palace": 81, "West Ham": 81,
  Bournemouth: 80, Fulham: 80, Brentford: 79, Everton: 79,
  "Ipswich Town": 78, Wolves: 78, Southampton: 77, Leicester: 75,

  // La Liga — España
  "Real Madrid": 96, Barcelona: 95, "Atlético Madrid": 89, "Athletic Club": 84,
  Villarreal: 84, Betis: 83, "Real Sociedad": 83, Girona: 81,
  Sevilla: 80, Valencia: 79, Celta: 78, Osasuna: 78,
  Getafe: 77, Mallorca: 77, "Rayo Vallecano": 77, Espanyol: 75,
  "Alavés": 73, "Las Palmas": 73, "Leganés": 72, Valladolid: 72,

  // Serie A — Italia
  Inter: 91, Juventus: 87, Milan: 87, Napoli: 86,
  Atalanta: 85, Roma: 84, Lazio: 83, Fiorentina: 82,
  Bologna: 79, Torino: 77, Udinese: 76, Como: 75,
  Genoa: 75, Parma: 74, Cagliari: 73, Empoli: 73,
  "Hellas Verona": 73, Lecce: 73, Monza: 73, Venezia: 71,

  // Bundesliga — Alemania
  "Bayern München": 93, "Bayer Leverkusen": 87, Dortmund: 87, "RB Leipzig": 85,
  "E. Frankfurt": 81, Stuttgart: 81, "B. M'gladbach": 78, Freiburg: 77,
  Wolfsburg: 77, "Mainz 05": 76, "Werder Bremen": 76, Augsburg: 75,
  Hoffenheim: 75, "Union Berlin": 75, Heidenheim: 73, "St. Pauli": 73,
  Bochum: 72, "Holstein Kiel": 71,

  // Ligue 1 — Francia
  PSG: 93, Marseille: 83, Monaco: 83, Lille: 80,
  Lyon: 79, Lens: 78, Nice: 78, Rennes: 77,
  Brest: 76, Strasbourg: 76, Angers: 73, Nantes: 72,
  "Saint-Étienne": 70, Toulouse: 69, Montpellier: 68, Auxerre: 67,
  Reims: 67, "Le Havre": 66,

  // Liga Profesional — Argentina
  "River Plate": 82, "Boca Juniors": 81, Racing: 79, Estudiantes: 77,
  "Vélez": 77, "Def. y Justicia": 76, Talleres: 76, Independiente: 75,
  "Lanús": 75, "Rosario Central": 75, "San Lorenzo": 75, "Argentinos Jrs": 74,
  "Newell's": 74, Belgrano: 73, "Huracán": 73, Banfield: 72,
  Gimnasia: 72, "Godoy Cruz": 72, Instituto: 72, Tigre: 71,

  // Liga BetPlay — Colombia
  "Atl. Nacional": 74, Junior: 73, "Ind. Santa Fe": 72, Millonarios: 72,
  "América de Cali": 71, "Dep. Tolima": 71, "Atl. Bucaramanga": 70, "Dep. Cali": 70,
  "Ind. Medellín": 70, "Dep. Pereira": 69, "Once Caldas": 69, "Águilas Doradas": 68,
  Envigado: 66,

  // Torneo BetPlay — Colombia (2ª división)
  "Barranquilla FC": 39, "Boyacá Chicó": 38, "Unión Magdalena": 38, Valledupar: 38,
  "Cortuluá": 37, Llaneros: 37, Patriotas: 37, "Bogotá FC": 36,
  "Dep. Pasto": 36, "Quindío": 36, "Real Santander": 36, "Fortaleza CEIF": 35,
  "Tigres FC": 34, Orsomarso: 33, "Real Cartagena": 33,

  // Liga MX — México
  "América": 76, Monterrey: 76, "Tigres UANL": 76, "Cruz Azul": 75,
  Pachuca: 74, Toluca: 74, Guadalajara: 73, "León": 73,
  "UNAM Pumas": 72, Atlas: 70, Necaxa: 70, "Santos Laguna": 70,
  Tijuana: 70, Puebla: 68,

  // Brasileirão — Brasil
  Palmeiras: 85, Flamengo: 84, Botafogo: 82, "Atlético Mineiro": 81,
  Fluminense: 80, "São Paulo": 80, Corinthians: 79, Cruzeiro: 79,
  Internacional: 79, "Grêmio": 78, "Ath. Paranaense": 77, Fortaleza: 77,
  "RB Bragantino": 76, Vasco: 76,

  // Primeira Div. — Uruguay
  Nacional: 73, "Peñarol": 73, Defensor: 68, "Liverpool M.": 68,
  Danubio: 66, "Racing M.": 65, Wanderers: 65,

  // Primera (Chile) — Chile
  "Colo-Colo": 72, "U. Católica": 71, "U. de Chile": 71, Huachipato: 67,
  "O'Higgins": 65, "Unión Española": 65, "Everton Viña": 64, Cobreloa: 63,

  // Primera (Paraguay) — Paraguay
  "Cerro Porteño": 72, Libertad: 72, Olimpia: 71, "Nacional (PAR)": 70,
  "Guaraní": 68, "Sol de América": 64,

  // Liga Pro — Ecuador
  IDV: 72, "LDU Quito": 72, "Barcelona SC": 70, Emelec: 67,
  "Delfín": 64,

  // Liga 1 — Perú
  "Alianza Lima": 69, "Sporting Cristal": 69, Universitario: 69, Melgar: 66,
  Cienciano: 64,

  // Eredivisie — Países Bajos
  Ajax: 83, PSV: 83, Feyenoord: 82, AZ: 78,
  Twente: 76, Utrecht: 75, "Sparta R.": 71, "Willem II": 69,

  // Liga Portugal — Portugal
  Benfica: 85, Porto: 85, "Sporting CP": 85, Braga: 79,
  "Vitória SC": 74, "Famalicão": 71, Estoril: 70, Moreirense: 70,

  // Süper Lig — Turquía
  Galatasaray: 80, "Fenerbahçe": 79, "Beşiktaş": 76, Trabzonspor: 75,
  "Başakşehir": 73,

  // Saudi Pro — Arabia Saudita
  "Al-Hilal": 80, "Al-Ittihad": 78, "Al-Nassr": 78, "Al-Ahli": 77,
  "Al-Shabab": 73,

  // MLS — Estados Unidos
  "Inter Miami": 74, "Columbus Crew": 73, LAFC: 73, "LA Galaxy": 72,
  "Seattle Sounders": 72, Cincinnati: 71, Philadelphia: 71, "Atlanta United": 70,
  "NY Red Bulls": 70,

  // J1 League — Japón
  "Vissel Kobe": 72, Kawasaki: 71, "Urawa Reds": 71, "Kashima Antlers": 70,
  "Yokohama FM": 70,

  // K League — Corea del Sur
  "Ulsan HD": 71, Jeonbuk: 70, Pohang: 69, "FC Seoul": 68,

  // Jupiler Pro — Bélgica
  "Club Brugge": 78, Anderlecht: 76, Genk: 75, "Union SG": 75,
  Gent: 74, Antwerp: 73, Standard: 72,

  // Super League — Suiza
  "Young Boys": 74, Basel: 73, Servette: 71, Lugano: 70,
  "Zürich": 69,

  // Ekstraklasa — Polonia
  Legia: 72, Jagiellonia: 71, "Lech Poznań": 71, "Raków": 71,

  // Premiership — Escocia
  Celtic: 78, Rangers: 76, Hearts: 70, Aberdeen: 69,

  // Bundesliga (AT) — Austria
  "RB Salzburg": 76, "Sturm Graz": 73, "Rapid Viena": 71, LASK: 70,
  "Austria Viena": 69,

  // Superliga — Serbia
  "Estrella Roja": 74, Partizan: 71, Vojvodina: 68,

  // HNL — Croacia
  "Dinamo Zagreb": 74, "Hajduk Split": 70, Rijeka: 70,

  // Premiership (ZA) — Sudáfrica
  "Mamelodi Sundowns": 72, "Orlando Pirates": 68, "Kaizer Chiefs": 66,

  // Botola Pro — Marruecos
  Wydad: 72, "Raja Casablanca": 71, "AS FAR": 68,

  // EPL (Egipto) — Egipto
  "Al Ahly": 74, "Pyramids FC": 71, Zamalek: 71,

  // A-League — Australia
  "Melbourne City": 66, "Melbourne Victory": 65, "Sydney FC": 65, "Western Sydney": 63,

  // CSL — China
  "Shanghai Port": 68, "Shandong Taishan": 67, "Beijing Guoan": 66,

  // Championship — Inglaterra (2ª división)
  Leeds: 74, Burnley: 73, Sunderland: 72, "Sheffield Utd": 71,
  Middlesbrough: 70, Norwich: 70, "West Brom": 70, Coventry: 69,
  Watford: 69, Stoke: 68, Swansea: 68, Cardiff: 67,
  Birmingham: 66, "Hull City": 66, Blackburn: 64, Derby: 64,
  Luton: 64, QPR: 63, Bolton: 62, "Bristol City": 62,
  Plymouth: 62,

  // 2. Bundesliga — Alemania (2ª división)
  Hamburgo: 72, "Köln": 71, "Hertha BSC": 70, "Schalke 04": 70,
  "Düsseldorf": 68, Hannover: 68, "Nürnberg": 67, Karlsruher: 66,
  Magdeburg: 66, Paderborn: 66, "Greuther Fürth": 64,

  // Serie B — Italia (2ª división)
  Sassuolo: 71, Palermo: 69, Sampdoria: 69, Cremonese: 68,
  Salernitana: 68, Pisa: 67, Spezia: 67, Bari: 66,
  Frosinone: 66, Brescia: 65, Catanzaro: 65, Cesena: 64,
  Cosenza: 62, "Südtirol": 62, Reggiana: 61, "Juve Stabia": 59,
  Modena: 59,

  // Ligue 2 — Francia (2ª división)
  Lorient: 68, Metz: 67, "Paris FC": 67, Troyes: 65,
  Amiens: 63, Caen: 63, "Red Star": 63, Clermont: 62,
  Guingamp: 62, "Le Mans": 62, Pau: 62, Martigues: 61,
  Bastia: 60, Dunkerque: 60, Laval: 60, Grenoble: 58,
  Rodez: 58,

  // Liga Premier (CR) — Costa Rica
  Alajuelense: 68, Saprissa: 68, Herediano: 66,

  // Primera (Venezuela) — Venezuela
  "Caracas FC": 65, "Dep. Táchira": 64, Metropolitanos: 63, Monagas: 63,
  Zamora: 62,

  // Primera (Bolivia) — Bolivia
  "Bolívar": 68, "The Strongest": 66, "Always Ready": 65, Wilstermann: 62,
};

/** Hash estable de un nombre (respaldo si se agregan clubes nuevos) */
function nameHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000;
  return h;
}

const clampRating = (v) => Math.max(32, Math.min(99, Math.round(v)));

/** Ranking del club (0-100) */
export function getClubRating(team, league) {
  const known = CLUB_RATINGS[team];
  if (known !== undefined) return known;
  const prestige = LEAGUES[league]?.p ?? 55;
  return clampRating(prestige * 0.8 + 4 - (nameHash(team) % 9));
}

/** Etiqueta descriptiva del nivel del club */
export function clubTier(rating) {
  if (rating >= 90) return "Élite mundial";
  if (rating >= 82) return "Top continental";
  if (rating >= 74) return "Primer nivel";
  if (rating >= 66) return "Nivel medio";
  if (rating >= 58) return "En construcción";
  if (rating >= 45) return "Modesto";
  return "Amateur";
}

export default CLUB_RATINGS;
