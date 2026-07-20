// Escudos reales: IDs conocidos del CDN de api-sports (media.api-sports.io).
// Para el resto se busca en TheSportsDB por nombre (ver components/ClubLogo.jsx).
const TEAM_LOGO_IDS = {
  // Premier League
  Arsenal: 42, "Aston Villa": 66, Bournemouth: 35, Brentford: 55, Brighton: 51, Chelsea: 49,
  "Crystal Palace": 52, Everton: 45, Fulham: 36, Leicester: 46, Liverpool: 40, "Man. City": 50,
  "Man. United": 33, Newcastle: 34, "Nottingham Forest": 65, Southampton: 41, Tottenham: 47,
  "West Ham": 48, Wolves: 39,
  // Championship
  Burnley: 44, Leeds: 63, Watford: 38,
  // La Liga
  "Alavés": 542, "Athletic Club": 531, "Atlético Madrid": 530, Barcelona: 529, Betis: 543,
  Celta: 538, Espanyol: 540, Getafe: 546, Girona: 547, Mallorca: 798, Osasuna: 727,
  "Rayo Vallecano": 728, "Real Madrid": 541, "Real Sociedad": 548, Sevilla: 536, Valencia: 532,
  Valladolid: 720, Villarreal: 533,
  // Serie A
  Atalanta: 499, Bologna: 500, Cagliari: 490, Empoli: 511, Fiorentina: 502, Genoa: 495,
  "Hellas Verona": 504, Inter: 505, Juventus: 496, Lazio: 487, Lecce: 867, Milan: 489,
  Monza: 1579, Napoli: 492, Parma: 523, Roma: 497, Torino: 503, Udinese: 494,
  // Bundesliga + 2. Bundesliga
  Augsburg: 170, "Bayern München": 157, "Bayer Leverkusen": 168, Dortmund: 165,
  "B. M'gladbach": 163, "E. Frankfurt": 169, Freiburg: 160, Heidenheim: 180, Hoffenheim: 167,
  "Mainz 05": 164, "RB Leipzig": 173, Stuttgart: 172, "Union Berlin": 182, "Werder Bremen": 162,
  Wolfsburg: 161, Bochum: 176, "Schalke 04": 174,
  // Ligue 1
  Angers: 77, Brest: 106, Lens: 116, Lille: 79, Lyon: 80, Marseille: 81, Monaco: 91,
  Montpellier: 82, Nantes: 83, Nice: 84, PSG: 85, Reims: 93, Rennes: 94,
  "Saint-Étienne": 1063, Strasbourg: 95, Toulouse: 96,
  // Eredivisie / Portugal
  Ajax: 194, PSV: 197,
  Benfica: 211, Porto: 212, "Sporting CP": 228,
  // Brasil
  Flamengo: 127, Botafogo: 120, Corinthians: 131, Fluminense: 124, "Grêmio": 130,
  Internacional: 119, Palmeiras: 121, "São Paulo": 126, Vasco: 133,
  // Argentina
  "Boca Juniors": 451, "River Plate": 435, Racing: 436, Independiente: 453, "San Lorenzo": 460,
  "Vélez": 438, Estudiantes: 450, "Newell's": 456,
  // Escocia / Turquía
  Celtic: 247, Rangers: 257, Galatasaray: 645, "Fenerbahçe": 611,
};

// Nombres de búsqueda para TheSportsDB cuando el nombre local es abreviado
export const LOGO_SEARCH_NAMES = {
  "Man. City": "Manchester City", "Man. United": "Manchester United",
  "B. M'gladbach": "Borussia Monchengladbach", "E. Frankfurt": "Eintracht Frankfurt",
  "Mainz 05": "Mainz", "St. Pauli": "St Pauli", Hamburgo: "Hamburger SV", "Köln": "FC Koln",
  "Düsseldorf": "Fortuna Dusseldorf", Hannover: "Hannover 96", Magdeburg: "1. FC Magdeburg",
  "Athletic Club": "Athletic Bilbao", Betis: "Real Betis", Celta: "Celta Vigo",
  Inter: "Internazionale", Milan: "AC Milan", Roma: "AS Roma",
  PSG: "Paris Saint-Germain", Porto: "FC Porto",
  "Argentinos Jrs": "Argentinos Juniors", "Def. y Justicia": "Defensa y Justicia",
  "Newell's": "Newells Old Boys", "Vélez": "Velez Sarsfield", Gimnasia: "Gimnasia La Plata",
  Racing: "Racing Club", Talleres: "Talleres Cordoba", Estudiantes: "Estudiantes La Plata",
  "Atl. Nacional": "Atletico Nacional", "Ind. Medellín": "Independiente Medellin",
  "Ind. Santa Fe": "Independiente Santa Fe", "Dep. Cali": "Deportivo Cali",
  Junior: "Junior FC", "América de Cali": "America de Cali",
  "América": "Club America", "UNAM Pumas": "Pumas UNAM", "León": "Club Leon",
  "Ath. Paranaense": "Athletico Paranaense", "RB Bragantino": "Bragantino",
  Nacional: "Nacional Montevideo", "Peñarol": "Penarol", Defensor: "Defensor Sporting",
  "U. Católica": "Universidad Catolica", "U. de Chile": "Universidad de Chile",
  IDV: "Independiente del Valle", "LDU Quito": "LDU de Quito",
  "Sparta R.": "Sparta Rotterdam", "Vitória SC": "Vitoria Guimaraes",
  "Estrella Roja": "Red Star Belgrade", "Austria Viena": "Austria Vienna",
  "Rapid Viena": "Rapid Vienna", "RB Salzburg": "Red Bull Salzburg",
  "Sheffield Utd": "Sheffield United", QPR: "Queens Park Rangers", "West Brom": "West Bromwich Albion",
  "Saint-Étienne": "Saint-Etienne", Standard: "Standard Liege", "Union SG": "Union Saint-Gilloise",
  "Lech Poznań": "Lech Poznan", "Raków": "Rakow Czestochowa", Legia: "Legia Warszawa",
  "Beşiktaş": "Besiktas", "Başakşehir": "Istanbul Basaksehir",
  "Al-Ahli": "Al-Ahli Saudi", Cincinnati: "FC Cincinnati", Philadelphia: "Philadelphia Union",
  "NY Red Bulls": "New York Red Bulls", Kawasaki: "Kawasaki Frontale", "Yokohama FM": "Yokohama F. Marinos",
  Jeonbuk: "Jeonbuk Hyundai Motors", Pohang: "Pohang Steelers", "Ulsan HD": "Ulsan Hyundai",
  Wydad: "Wydad Casablanca", "Western Sydney": "Western Sydney Wanderers",
};

export function getLogoUrl(team) {
  const id = TEAM_LOGO_IDS[team];
  return id ? `https://media.api-sports.io/football/teams/${id}.png` : null;
}

export default TEAM_LOGO_IDS;
