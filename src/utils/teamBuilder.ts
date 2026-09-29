export type TeamMode = "adventure" | "competitive";

export type TeamRole =
  | "Sin rol"
  | "Atacante físico"
  | "Atacante especial"
  | "Atacante mixto"
  | "Soporte"
  | "Pivote"
  | "Muralla física"
  | "Muralla especial"
  | "Control de velocidad"
  | "Setup / Sweeper"
  | "Control de campo";

export const TEAM_ROLES: TeamRole[] = [
  "Sin rol",
  "Atacante físico",
  "Atacante especial",
  "Atacante mixto",
  "Soporte",
  "Pivote",
  "Muralla física",
  "Muralla especial",
  "Control de velocidad",
  "Setup / Sweeper",
  "Control de campo",
];

export interface TeamMemberStats {
  attack: number;
  specialAttack: number;
  speed: number;
}

export interface TeamMemberSummary {
  name: string;
  role: TeamRole | string;
  stats: TeamMemberStats;
  types: string[];
}

export interface TeamBasicsAnalysis {
  orientation: {
    physical: number;
    special: number;
    mixed: number;
  };
  averageSpeed: number;
  speedBand: "Lenta" | "Media" | "Rápida";
  roleGaps: string[];
  duplicateTypes: Array<{ type: string; count: number }>;
}

export interface WeaknessProfileInput {
  pokemon: string;
  weaknesses: Array<{ type: string; multiplier: number }>;
}

export interface RepeatedWeakness {
  type: string;
  count: number;
  severe: number;
}

function orientationFor(stats: TeamMemberStats): "physical" | "special" | "mixed" {
  const diff = stats.attack - stats.specialAttack;
  if (diff >= 15) return "physical";
  if (diff <= -15) return "special";
  return "mixed";
}

export function analyzeTeamBasics(members: TeamMemberSummary[]): TeamBasicsAnalysis {
  const orientation = { physical: 0, special: 0, mixed: 0 };
  const typeCounts = new Map<string, number>();
  const roles = new Set(members.map((member) => member.role).filter((role) => role && role !== "Sin rol"));

  for (const member of members) {
    orientation[orientationFor(member.stats)] += 1;
    for (const type of member.types) typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }

  const averageSpeed = members.length
    ? Math.round(members.reduce((sum, member) => sum + member.stats.speed, 0) / members.length)
    : 0;
  const speedBand: TeamBasicsAnalysis["speedBand"] = averageSpeed < 70 ? "Lenta" : averageSpeed < 100 ? "Media" : "Rápida";

  const keyRoles: TeamRole[] = ["Atacante físico", "Atacante especial", "Soporte", "Pivote"];
  const roleGaps = keyRoles.filter((role) => !roles.has(role));
  const duplicateTypes = [...typeCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));

  return { orientation, averageSpeed, speedBand, roleGaps, duplicateTypes };
}

export function rankRepeatedWeaknesses(profiles: WeaknessProfileInput[]): RepeatedWeakness[] {
  const counts = new Map<string, { count: number; severe: number }>();
  for (const profile of profiles) {
    const seen = new Set<string>();
    for (const weakness of profile.weaknesses) {
      if (weakness.multiplier <= 1 || seen.has(weakness.type)) continue;
      seen.add(weakness.type);
      const current = counts.get(weakness.type) || { count: 0, severe: 0 };
      current.count += 1;
      if (weakness.multiplier >= 4) current.severe += 1;
      counts.set(weakness.type, current);
    }
  }

  return [...counts.entries()]
    .map(([type, value]) => ({ type, ...value }))
    .sort((a, b) => b.count - a.count || b.severe - a.severe || a.type.localeCompare(b.type));
}

export interface TeamSuggestion {
  name: string;
  helpsAgainst: string[];
  reason: string;
}

const SUGGESTION_POOL: TeamSuggestion[] = [
  { name: "rotom-wash", helpsAgainst: ["fire", "water", "flying", "ground"], reason: "Aporta Agua/Eléctrico, pivoteo y una inmunidad útil a Tierra mediante Levitación." },
  { name: "corviknight", helpsAgainst: ["ground", "grass", "bug", "fairy", "dragon"], reason: "Acero/Volador añade muchas resistencias y una inmunidad a Tierra." },
  { name: "amoonguss", helpsAgainst: ["water", "electric", "fairy", "fighting"], reason: "Planta/Veneno añade resistencias y encaja bien como soporte." },
  { name: "gastrodon", helpsAgainst: ["fire", "rock", "electric", "water"], reason: "Agua/Tierra cubre varias amenazas comunes y aporta inmunidad a Eléctrico." },
  { name: "gardevoir", helpsAgainst: ["dragon", "fighting", "dark"], reason: "Psíquico/Hada ayuda frente a Dragón, Lucha y Siniestro." },
  { name: "incineroar", helpsAgainst: ["ice", "grass", "bug", "ghost", "dark"], reason: "Fuego/Siniestro aporta resistencias y utilidad de soporte." },
  { name: "lucario", helpsAgainst: ["ice", "rock", "fairy", "dragon", "dark"], reason: "Lucha/Acero aporta una mezcla útil de resistencias y presión ofensiva." },
  { name: "azumarill", helpsAgainst: ["dragon", "fire", "ice", "dark"], reason: "Agua/Hada cubre Dragón y añade una resistencia natural a Fuego." },
  { name: "gliscor", helpsAgainst: ["electric", "ground", "fighting", "poison"], reason: "Tierra/Volador ofrece inmunidades a Eléctrico y Tierra." },
  { name: "scizor", helpsAgainst: ["ice", "fairy", "grass", "psychic", "dragon"], reason: "Bicho/Acero concentra numerosas resistencias y prioridad física." },
  { name: "milotic", helpsAgainst: ["fire", "ice", "water", "steel"], reason: "Agua añade estabilidad defensiva frente a Fuego y Hielo." },
  { name: "rillaboom", helpsAgainst: ["water", "electric", "ground", "grass"], reason: "Planta ayuda contra Agua y Tierra y puede aportar prioridad." },
];

export function suggestTeamCandidates(
  repeatedWeaknesses: RepeatedWeakness[],
  existingNames: string[],
  limit = 3,
): TeamSuggestion[] {
  const existing = new Set(existingNames.map((name) => name.toLowerCase()));
  const priorities = repeatedWeaknesses.slice(0, 4).map((item) => item.type);

  return SUGGESTION_POOL
    .filter((candidate) => !existing.has(candidate.name))
    .map((candidate) => ({
      candidate,
      score: candidate.helpsAgainst.reduce((sum, type) => sum + (priorities.includes(type) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map((item) => item.candidate);
}
