// Clásicos: fichar por el rival directo del club anterior tiene consecuencias
const RIVAL_PAIRS = [
  ["Boca Juniors", "River Plate"],
  ["Racing", "Independiente"],
  ["San Lorenzo", "Huracán"],
  ["Newell's", "Rosario Central"],
  ["Estudiantes", "Gimnasia"],
  ["Millonarios", "Ind. Santa Fe"],
  ["Atl. Nacional", "Ind. Medellín"],
  ["América de Cali", "Dep. Cali"],
  ["Junior", "Atl. Bucaramanga"],
  ["Real Madrid", "Barcelona"],
  ["Atlético Madrid", "Real Madrid"],
  ["Sevilla", "Betis"],
  ["Man. United", "Man. City"],
  ["Liverpool", "Everton"],
  ["Arsenal", "Tottenham"],
  ["Chelsea", "Tottenham"],
  ["Inter", "Milan"],
  ["Roma", "Lazio"],
  ["Juventus", "Torino"],
  ["Napoli", "Roma"],
  ["Dortmund", "Schalke 04"],
  ["Bayern München", "Dortmund"],
  ["PSG", "Marseille"],
  ["Lyon", "Saint-Étienne"],
  ["Ajax", "Feyenoord"],
  ["PSV", "Ajax"],
  ["Benfica", "Porto"],
  ["Sporting CP", "Benfica"],
  ["Galatasaray", "Fenerbahçe"],
  ["Beşiktaş", "Galatasaray"],
  ["Celtic", "Rangers"],
  ["Flamengo", "Fluminense"],
  ["Corinthians", "Palmeiras"],
  ["São Paulo", "Corinthians"],
  ["Grêmio", "Internacional"],
  ["Atlético Mineiro", "Cruzeiro"],
  ["Peñarol", "Nacional"],
  ["Colo-Colo", "U. de Chile"],
  ["U. Católica", "U. de Chile"],
  ["Olimpia", "Cerro Porteño"],
  ["Alianza Lima", "Universitario"],
  ["Barcelona SC", "Emelec"],
  ["LDU Quito", "Barcelona SC"],
  ["América", "Guadalajara"],
  ["Cruz Azul", "América"],
  ["Bolívar", "The Strongest"],
  ["Estrella Roja", "Partizan"],
  ["Dinamo Zagreb", "Hajduk Split"],
  ["Al-Hilal", "Al-Nassr"],
  ["Al-Ahly", "Zamalek"],
  ["Raja Casablanca", "Wydad"],
  ["Kaizer Chiefs", "Orlando Pirates"],
  ["Celta", "Depor"],
  ["Athletic Club", "Real Sociedad"],
  ["Lazio", "Roma"],
];

const RIVALS = {};
for (const [a, b] of RIVAL_PAIRS) {
  (RIVALS[a] ||= []).push(b);
  (RIVALS[b] ||= []).push(a);
}

export function areRivals(teamA, teamB) {
  if (!teamA || !teamB) return false;
  return (RIVALS[teamA] || []).includes(teamB);
}

export default RIVALS;
