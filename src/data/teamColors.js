// Color primario de cada club (para sombreados, badges y monogramas)
const TEAM_COLORS = {
  // Premier League
  Arsenal: "#EF0107", "Aston Villa": "#670E36", Bournemouth: "#DA291C", Brentford: "#E30613",
  Brighton: "#0057B8", Chelsea: "#034694", "Crystal Palace": "#1B458F", Everton: "#003399",
  Fulham: "#111111", "Ipswich Town": "#0044A9", Leicester: "#003090", Liverpool: "#C8102E",
  "Man. City": "#6CABDD", "Man. United": "#DA291C", Newcastle: "#241F20", "Nottingham Forest": "#DD0000",
  Southampton: "#D71920", Tottenham: "#132257", "West Ham": "#7A263A", Wolves: "#FDB913",
  // La Liga
  "Alavés": "#0761AF", "Athletic Club": "#EE2523", "Atlético Madrid": "#CB3524", Barcelona: "#A50044",
  Betis: "#00954C", Celta: "#8AC3EE", Espanyol: "#007FC8", Getafe: "#005999", Girona: "#CD2534",
  "Las Palmas": "#FFE400", "Leganés": "#0F1D41", Mallorca: "#E20613", Osasuna: "#D91A21",
  "Rayo Vallecano": "#E53027", "Real Madrid": "#FEBE10", "Real Sociedad": "#0067B1", Sevilla: "#F43333",
  Valencia: "#EE3524", Valladolid: "#921C88", Villarreal: "#FFE667",
  // Serie A
  Atalanta: "#1E71B8", Bologna: "#A21C26", Cagliari: "#B01028", Como: "#0F3A5E", Empoli: "#00579C",
  Fiorentina: "#482E92", Genoa: "#AE1919", "Hellas Verona": "#FCE500", Inter: "#010E80",
  Juventus: "#111111", Lazio: "#87D8F7", Lecce: "#DA291C", Milan: "#FB090B", Monza: "#EE0E36",
  Napoli: "#12A0D7", Parma: "#FFD520", Roma: "#8E1F2F", Torino: "#8A1E03", Udinese: "#111111", Venezia: "#EE7B00",
  // Bundesliga + 2.
  Augsburg: "#BA3733", "Bayern München": "#DC052D", "Bayer Leverkusen": "#E32221", Dortmund: "#FDE100",
  "B. M'gladbach": "#0F9D3A", "E. Frankfurt": "#E1000F", Freiburg: "#5B5B5B", Heidenheim: "#E30613",
  Hoffenheim: "#1961B5", "Holstein Kiel": "#005CA9", "Mainz 05": "#C3141E", "RB Leipzig": "#DD0741",
  "St. Pauli": "#624737", Stuttgart: "#E32219", "Union Berlin": "#EB1923", "Werder Bremen": "#1D9053",
  Wolfsburg: "#65B32E", Bochum: "#005CA9", "Düsseldorf": "#E30613", "Greuther Fürth": "#009A3E",
  Hamburgo: "#0A3F86", Hannover: "#009A3E", "Hertha BSC": "#005CA9", Karlsruher: "#00427F",
  "Köln": "#ED1C24", "Nürnberg": "#8C0F1F", Paderborn: "#005CA9", Magdeburg: "#0057A6", "Schalke 04": "#004D9D",
  // Ligue 1 + 2
  Angers: "#111111", Auxerre: "#0E4C92", Brest: "#E30613", "Le Havre": "#95C9EF", Lens: "#FED307",
  Lille: "#E01E13", Lyon: "#DA001A", Marseille: "#2FAEE0", Monaco: "#E51B22", Montpellier: "#F86F0A",
  Nantes: "#FCD405", Nice: "#ED1C24", PSG: "#004170", Reims: "#EE2223", Rennes: "#E13327",
  "Saint-Étienne": "#0DB04B", Strasbourg: "#00A0E4", Toulouse: "#5F4B8B",
  Amiens: "#5B6770", Bastia: "#0055A4", Caen: "#D51317", Clermont: "#C60C30", Dunkerque: "#00A5DC",
  Grenoble: "#0055A4", Guingamp: "#D51317", Laval: "#F58220", "Le Mans": "#F58220", Lorient: "#F58220",
  Martigues: "#F5A623", Metz: "#7B1224", "Paris FC": "#00417E", Pau: "#FFCC00", "Red Star": "#0C6B37",
  Rodez: "#B71234", Troyes: "#005DAA",
  // Argentina
  "Argentinos Jrs": "#D0112B", Banfield: "#00915A", Belgrano: "#33A3DD", "Boca Juniors": "#103F79",
  "Def. y Justicia": "#00713D", Estudiantes: "#E20E17", Gimnasia: "#004A98", "Godoy Cruz": "#004B93",
  "Huracán": "#D8121C", Independiente: "#E30613", Instituto: "#D8121C", "Lanús": "#800F1F",
  "Newell's": "#AD1919", Racing: "#75AADB", "River Plate": "#EB192D", "Rosario Central": "#0A2C50",
  "San Lorenzo": "#22317F", Talleres: "#1A3668", Tigre: "#153A7C", "Vélez": "#12285F",
  // Colombia
  "América de Cali": "#E01B22", "Atl. Bucaramanga": "#FFD200", "Atl. Nacional": "#12A24A",
  "Dep. Tolima": "#8E1230", "Dep. Cali": "#00913C", "Dep. Pereira": "#F5C518", Envigado: "#F58220",
  "Ind. Medellín": "#E4032E", "Ind. Santa Fe": "#D0112B", Junior: "#E01B22", Millonarios: "#0055A4",
  "Once Caldas": "#111111", "Águilas Doradas": "#F5C518",
  "Barranquilla FC": "#F5C518", "Bogotá FC": "#8B0304", "Boyacá Chicó": "#0A9E42", "Cortuluá": "#E4032E",
  "Dep. Pasto": "#B71234", "Fortaleza CEIF": "#D0112B", Llaneros: "#0DB04B", Orsomarso: "#F58220",
  Patriotas: "#B71234", "Quindío": "#0A9E42", "Real Cartagena": "#F5C518", "Real Santander": "#00913C",
  "Tigres FC": "#F5C518", "Unión Magdalena": "#0A5CA8", Valledupar: "#0DB04B",
  // México
  "América": "#FFCB05", Atlas: "#AB1B2D", "Cruz Azul": "#00519C", Guadalajara: "#D0112B",
  "León": "#0A6640", Monterrey: "#0A2240", Necaxa: "#D0112B", Pachuca: "#00447C", Puebla: "#003DA5",
  "Santos Laguna": "#0A6640", "Tigres UANL": "#FDB913", Tijuana: "#D0112B", Toluca: "#D0112B", "UNAM Pumas": "#0A2240",
  // Brasil
  "Ath. Paranaense": "#C3161C", "Atlético Mineiro": "#111111", Botafogo: "#111111", Corinthians: "#111111",
  Cruzeiro: "#003DA5", Flamengo: "#C3161C", Fluminense: "#7A0C2E", Fortaleza: "#1B5FAA",
  "Grêmio": "#0D80BF", Internacional: "#E5050F", Palmeiras: "#006437", "RB Bragantino": "#DD0741",
  "São Paulo": "#E5050F", Vasco: "#111111",
  // Uruguay / Chile / Paraguay / Ecuador / Perú
  Danubio: "#111111", Defensor: "#5F3F92", "Liverpool M.": "#0A2C50", Nacional: "#0A3F86",
  "Peñarol": "#FFD100", "Racing M.": "#0DB04B", Wanderers: "#111111",
  Cobreloa: "#F58220", "Colo-Colo": "#111111", "Everton Viña": "#00447C", Huachipato: "#0A5CA8",
  "O'Higgins": "#87CEEB", "U. Católica": "#0A5CA8", "U. de Chile": "#00427F", "Unión Española": "#D0112B",
  "Cerro Porteño": "#D0112B", "Guaraní": "#F5C518", Libertad: "#111111", Olimpia: "#111111", "Sol de América": "#0A5CA8",
  "Barcelona SC": "#FFD100", "Delfín": "#0A9E42", Emelec: "#0A5CA8", IDV: "#111111", "LDU Quito": "#F5F5F5",
  "Alianza Lima": "#0A2C50", Cienciano: "#D0112B", Melgar: "#111111", "Sporting Cristal": "#87CEEB", Universitario: "#7A0C2E",
  // Países Bajos / Portugal
  Ajax: "#D2122E", AZ: "#D0112B", Feyenoord: "#C8102E", Twente: "#D0112B", Utrecht: "#D0112B",
  PSV: "#ED1C24", "Sparta R.": "#D0112B", "Willem II": "#0A2C50",
  Benfica: "#E31E24", Braga: "#C3161C", Estoril: "#FFD100", "Famalicão": "#0A5CA8", Moreirense: "#0A9E42",
  Porto: "#00428C", "Sporting CP": "#008057", "Vitória SC": "#111111",
  // Turquía / Arabia / MLS
  "Başakşehir": "#FF6600", "Beşiktaş": "#111111", "Fenerbahçe": "#FFED00", Galatasaray: "#A32638", Trabzonspor: "#7B1224",
  "Al-Ahli": "#0A9E42", "Al-Hilal": "#0A5CA8", "Al-Ittihad": "#FFD100", "Al-Nassr": "#FFD100", "Al-Shabab": "#F5F5F5",
  "Atlanta United": "#80000A", Cincinnati: "#F05323", "Columbus Crew": "#FEDD00", "Inter Miami": "#F7B5CD",
  "LA Galaxy": "#00245D", LAFC: "#111111", "NY Red Bulls": "#ED1E36", Philadelphia: "#071B2C", "Seattle Sounders": "#5D9741",
  // Japón / Corea / Bélgica / Suiza / Polonia
  "Kashima Antlers": "#8E1230", Kawasaki: "#009FE3", "Urawa Reds": "#E60012", "Vissel Kobe": "#7A0C2E", "Yokohama FM": "#003DA5",
  "FC Seoul": "#D0112B", Jeonbuk: "#0A9E42", Pohang: "#111111", "Ulsan HD": "#0A5CA8",
  Anderlecht: "#5F3F92", Antwerp: "#D0112B", "Club Brugge": "#0A5CA8", Gent: "#0A5CA8",
  Genk: "#0A5CA8", Standard: "#D0112B", "Union SG": "#FFD100",
  Basel: "#D0112B", Lugano: "#111111", Servette: "#7A0C2E", "Young Boys": "#FFD100", "Zürich": "#0A5CA8",
  Jagiellonia: "#FFD100", "Lech Poznań": "#0A5CA8", Legia: "#0A9E42", "Raków": "#D0112B",
  // Escocia / Austria / Serbia / Croacia
  Aberdeen: "#E20E17", Celtic: "#018749", Hearts: "#7A0C2E", Rangers: "#0A2C6E",
  "Austria Viena": "#5F3F92", LASK: "#111111", "Rapid Viena": "#0A9E42", "RB Salzburg": "#DD0741", "Sturm Graz": "#111111",
  "Estrella Roja": "#D0112B", Partizan: "#111111", Vojvodina: "#D0112B",
  "Dinamo Zagreb": "#0A5CA8", "Hajduk Split": "#F5F5F5", Rijeka: "#F5F5F5",
  // África / Australia / China
  "Kaizer Chiefs": "#F58220", "Mamelodi Sundowns": "#FFD100", "Orlando Pirates": "#111111",
  "AS FAR": "#111111", "Raja Casablanca": "#0A9E42", Wydad: "#D0112B",
  "Al Ahly": "#D0112B", "Pyramids FC": "#0A5CA8", Zamalek: "#F5F5F5",
  "Melbourne City": "#87CEEB", "Melbourne Victory": "#0A2C50", "Sydney FC": "#87CEEB", "Western Sydney": "#D0112B",
  "Beijing Guoan": "#0A9E42", "Shanghai Port": "#D0112B", "Shandong Taishan": "#F58220",
  // Championship
  Birmingham: "#0A5CA8", Blackburn: "#0A5CA8", Bolton: "#F5F5F5", "Bristol City": "#D0112B",
  Burnley: "#6C1D45", Cardiff: "#0A5CA8", Coventry: "#87CEEB", Derby: "#F5F5F5", "Hull City": "#F58220",
  Leeds: "#FFCD00", Luton: "#F58220", Middlesbrough: "#D0112B", Norwich: "#FFD100", Plymouth: "#0A6640",
  QPR: "#0A5CA8", "Sheffield Utd": "#EE2737", Stoke: "#D0112B", Sunderland: "#EB172B", Swansea: "#F5F5F5",
  Watford: "#FBEE23", "West Brom": "#0A2C50",
  // Serie B
  Bari: "#D0112B", Brescia: "#0A5CA8", Catanzaro: "#FFD100", Cesena: "#111111", Cosenza: "#D0112B",
  Cremonese: "#7A0C2E", Frosinone: "#FFD100", "Juve Stabia": "#FFD100", Modena: "#FFD100",
  Palermo: "#E75DA5", Pisa: "#111111", Reggiana: "#7A0C2E", Salernitana: "#7A0C2E", Sampdoria: "#0A5CA8",
  Sassuolo: "#0A9E42", Spezia: "#F5F5F5", "Südtirol": "#D0112B",
  // Costa Rica / Venezuela / Bolivia
  Alajuelense: "#D0112B", Herediano: "#FFD100", Saprissa: "#5F3F92",
  "Caracas FC": "#8E1230", "Dep. Táchira": "#FFD100", Metropolitanos: "#5F3F92", Monagas: "#0A5CA8", Zamora: "#111111",
  "Always Ready": "#D0112B", "Bolívar": "#87CEEB", "The Strongest": "#FFD100", Wilstermann: "#D0112B",
};

// Fallback por liga
const LEAGUE_FALLBACK = {
  "Premier League": "#38003C", "La Liga": "#EE8707", "Serie A": "#008FD7", Bundesliga: "#D20515",
  "Ligue 1": "#091C3E", "Liga Profesional": "#75AADB", "Liga BetPlay": "#FCD116", "Torneo BetPlay": "#FCD116",
  "Liga MX": "#0A6640", "Brasileirão": "#009C3B",
};

export function getTeamColor(team, league) {
  return TEAM_COLORS[team] || LEAGUE_FALLBACK[league] || "#52525b";
}

/** rgba del color del equipo, para sombreados */
export function teamTint(team, league, alpha = 0.16) {
  const hex = getTeamColor(team, league);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default TEAM_COLORS;
