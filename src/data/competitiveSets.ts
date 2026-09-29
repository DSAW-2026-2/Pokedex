import type { Pokemon } from "../types/pokemon";
import type { EvSpread } from "../utils/setValidation";
import { abilityLabel, moveLabel } from "../utils/text";

export type CompetitiveSetSource = "curated" | "suggested" | "custom";

export interface CompetitiveSet {
  source: CompetitiveSetSource;
  role: string;
  label: string;
  ability: string;
  item: string;
  nature: string;
  evs: string;
  moves: string[];
  tags: string[];
  abilityKey?: string;
  itemKey?: string;
  natureKey?: string;
  moveKeys?: string[];
  versionGroup?: string;
  evValues?: EvSpread;
}

export type CompetitivePreset = CompetitiveSet;

const PRESETS: Record<string, CompetitiveSet> = {
  rillaboom: {
    source: "curated",
    role: "Soporte / Pivote",
    label: "Terreno y prioridad",
    ability: "Herbogénesis",
    item: "Chaleco Asalto",
    nature: "Firme (+Atq, -At.Esp)",
    evs: "252 PS / 116 Atq / 140 Def.Esp",
    moves: ["Sorpresa", "Ida y Vuelta", "Fitoimpulso", "Mazazo"],
    tags: ["control-turno", "pivot", "prioridad", "presion-fisica"],
  },
  incineroar: {
    source: "curated",
    role: "Soporte / Pivote",
    label: "Control y debilitación",
    ability: "Intimidación",
    item: "Gafas Protectoras",
    nature: "Cauta (+Def.Esp, -At.Esp)",
    evs: "252 PS / 68 Def / 188 Def.Esp",
    moves: ["Sorpresa", "Última Palabra", "Envite Ígneo", "Desarme"],
    tags: ["control-turno", "pivot", "debilitacion", "presion-fisica"],
  },
};

const TYPE_MOVE_PRIORITY: Record<string, string[]> = {
  normal: ["body-slam", "double-edge", "hyper-voice", "facade"],
  fire: ["flare-blitz", "heat-wave", "overheat", "flamethrower", "fire-blast"],
  water: ["wave-crash", "liquidation", "hydro-pump", "surf", "scald"],
  electric: ["wild-charge", "thunderbolt", "discharge", "volt-switch", "thunder"],
  grass: ["grassy-glide", "wood-hammer", "power-whip", "leaf-blade", "energy-ball", "giga-drain"],
  ice: ["icicle-crash", "ice-spinner", "ice-beam", "blizzard", "freeze-dry"],
  fighting: ["close-combat", "drain-punch", "body-press", "aura-sphere", "focus-blast"],
  poison: ["gunk-shot", "poison-jab", "sludge-bomb", "sludge-wave"],
  ground: ["earthquake", "high-horsepower", "earth-power", "stomping-tantrum"],
  flying: ["brave-bird", "dual-wingbeat", "air-slash", "hurricane"],
  psychic: ["psychic", "psyshock", "expanding-force", "zen-headbutt"],
  bug: ["u-turn", "x-scissor", "bug-buzz", "leech-life"],
  rock: ["rock-slide", "stone-edge", "power-gem", "rock-blast"],
  ghost: ["shadow-ball", "poltergeist", "shadow-claw", "hex"],
  dragon: ["draco-meteor", "dragon-claw", "outrage", "dragon-pulse"],
  dark: ["knock-off", "darkest-lariat", "sucker-punch", "dark-pulse", "snarl"],
  steel: ["iron-head", "flash-cannon", "heavy-slam", "meteor-mash"],
  fairy: ["moonblast", "play-rough", "dazzling-gleam", "draining-kiss"],
};

const SUPPORT_PRIORITY = [
  "fake-out", "protect", "parting-shot", "u-turn", "volt-switch", "tailwind", "trick-room",
  "helping-hand", "follow-me", "rage-powder", "spore", "thunder-wave", "will-o-wisp", "snarl",
  "knock-off", "taunt", "encore", "wide-guard", "icy-wind", "reflect", "light-screen",
];

const OFFENSE_PRIORITY = [
  "earthquake", "rock-slide", "close-combat", "knock-off", "sucker-punch", "u-turn", "ice-spinner",
  "ice-beam", "thunderbolt", "shadow-ball", "moonblast", "play-rough", "protect",
];

function statValue(pokemon: Pokemon, stat: string): number {
  return pokemon.stats.find((row) => row.stat.name === stat)?.base_stat ?? 0;
}

function normalizedLearnset(pokemon: Pokemon): string[] {
  return [...new Set((pokemon.moves || []).map((row) => row.move.name).filter(Boolean))];
}

function chooseMoveKeys(pokemon: Pokemon, role: string): string[] {
  const available = normalizedLearnset(pokemon);
  const availableSet = new Set(available);
  const priorities: string[] = [];

  for (const type of pokemon.types.map((row) => row.type.name)) {
    priorities.push(...(TYPE_MOVE_PRIORITY[type] || []));
  }
  if (role.includes("Soporte") || role.includes("Balanceado")) priorities.push(...SUPPORT_PRIORITY);
  priorities.push(...OFFENSE_PRIORITY, ...SUPPORT_PRIORITY);

  const chosen: string[] = [];
  const add = (name: string) => {
    if (!availableSet.has(name) || chosen.includes(name)) return;
    chosen.push(name);
  };
  priorities.forEach(add);
  available.forEach(add);

  return chosen.slice(0, 4);
}

function displayMoves(moveKeys: string[]): string[] {
  const display = moveKeys.map(moveLabel);
  while (display.length < 4) display.push(`Movimiento libre ${display.length + 1}`);
  return display;
}

function inferTags(moves: string[], role: string): string[] {
  const normalized = moves.map((move) => move.toLowerCase().replace(/ /g, "-"));
  const tags = new Set<string>();
  if (normalized.includes("fake-out")) tags.add("control-turno");
  if (normalized.some((move) => ["u-turn", "volt-switch", "parting-shot", "teleport"].includes(move))) tags.add("pivot");
  if (normalized.some((move) => ["sucker-punch", "grassy-glide", "aqua-jet", "bullet-punch", "extreme-speed", "ice-shard"].includes(move))) tags.add("prioridad");
  if (role.includes("físico")) tags.add("presion-fisica");
  if (role.includes("especial")) tags.add("presion-especial");
  if (role.includes("Soporte")) tags.add("soporte");
  return [...tags];
}

export function getCompetitivePreset(pokemonName: string): CompetitiveSet | undefined {
  return PRESETS[pokemonName.trim().toLowerCase()];
}

export function suggestCompetitiveSet(pokemon: Pokemon): CompetitiveSet {
  const attack = statValue(pokemon, "attack");
  const specialAttack = statValue(pokemon, "special-attack");
  const speed = statValue(pokemon, "speed");
  const hp = statValue(pokemon, "hp");
  const defense = statValue(pokemon, "defense");
  const specialDefense = statValue(pokemon, "special-defense");

  const physical = attack >= specialAttack + 10;
  const special = specialAttack >= attack + 10;
  const bulky = hp + defense + specialDefense >= 285;
  const fast = speed >= 95;

  let role = "Balanceado";
  let item = "Restos";
  let nature = "Cauta (+Def.Esp, -At.Esp)";
  let evs = "252 PS / 128 Def / 128 Def.Esp";

  if (physical) {
    role = fast ? "Atacante físico rápido" : "Atacante físico";
    item = "Vidasfera";
    nature = fast ? "Alegre (+Vel, -At.Esp)" : "Firme (+Atq, -At.Esp)";
    evs = "252 Atq / 252 Vel / 4 PS";
  } else if (special) {
    role = fast ? "Atacante especial rápido" : "Atacante especial";
    item = "Vidasfera";
    nature = fast ? "Miedosa (+Vel, -Atq)" : "Modesta (+At.Esp, -Atq)";
    evs = "252 At.Esp / 252 Vel / 4 PS";
  } else if (bulky) {
    role = "Soporte resistente";
    item = "Restos";
    nature = defense >= specialDefense ? "Agitada (+Def, -Atq)" : "Cauta (+Def.Esp, -At.Esp)";
    evs = defense >= specialDefense ? "252 PS / 252 Def / 4 Def.Esp" : "252 PS / 4 Def / 252 Def.Esp";
  }

  const ability = pokemon.abilities
    .slice()
    .sort((a, b) => Number(a.is_hidden) - Number(b.is_hidden) || a.slot - b.slot)[0]?.ability.name;
  const moveKeys = chooseMoveKeys(pokemon, role);
  const moves = displayMoves(moveKeys);

  return {
    source: "suggested",
    role,
    label: "Sugerencia automática",
    ability: ability ? abilityLabel(ability) : "Sin datos",
    item,
    nature,
    evs,
    moves,
    tags: inferTags(moveKeys, role),
    abilityKey: ability,
    moveKeys,
  };
}

export interface SimilarCompetitivePreset {
  name: string;
  preset: CompetitiveSet;
  sharedTags: string[];
  score: number;
}

export function findSimilarCompetitivePresets(pokemonName: string, limit = 3): SimilarCompetitivePreset[] {
  const normalized = pokemonName.trim().toLowerCase();
  const source = PRESETS[normalized];
  if (!source) return [];

  return Object.entries(PRESETS)
    .filter(([name]) => name !== normalized)
    .map(([name, preset]) => {
      const sharedTags = source.tags.filter((tag) => preset.tags.includes(tag));
      const roleBonus = preset.role === source.role ? 2 : 0;
      return { name, preset, sharedTags, score: sharedTags.length + roleBonus };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
