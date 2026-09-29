import type { NamedAPIResource, Pokemon } from "../types/pokemon";
import { abilityLabel, moveLabel, normalizeText, titleCase } from "./text";

export const ROLE_OPTIONS = [
  "Atacante físico",
  "Atacante especial",
  "Atacante mixto",
  "Soporte",
  "Pivote",
  "Muralla física",
  "Muralla especial",
  "Control de velocidad",
  "Preparación / Barrido",
  "Control de campo",
] as const;

export type LocalizedLabelMap = Record<string, string>;

export interface NatureOption {
  key: string;
  label: string;
}

export const NATURE_OPTIONS: NatureOption[] = [
  { key: "hardy", label: "Fuerte" },
  { key: "lonely", label: "Huraña (+Atq, -Def)" },
  { key: "brave", label: "Audaz (+Atq, -Vel)" },
  { key: "adamant", label: "Firme (+Atq, -At.Esp)" },
  { key: "naughty", label: "Pícara (+Atq, -Def.Esp)" },
  { key: "bold", label: "Osada (+Def, -Atq)" },
  { key: "docile", label: "Dócil" },
  { key: "relaxed", label: "Plácida (+Def, -Vel)" },
  { key: "impish", label: "Agitada (+Def, -At.Esp)" },
  { key: "lax", label: "Floja (+Def, -Def.Esp)" },
  { key: "timid", label: "Miedosa (+Vel, -Atq)" },
  { key: "hasty", label: "Activa (+Vel, -Def)" },
  { key: "serious", label: "Seria" },
  { key: "jolly", label: "Alegre (+Vel, -At.Esp)" },
  { key: "naive", label: "Ingenua (+Vel, -Def.Esp)" },
  { key: "modest", label: "Modesta (+At.Esp, -Atq)" },
  { key: "mild", label: "Afable (+At.Esp, -Def)" },
  { key: "quiet", label: "Mansa (+At.Esp, -Vel)" },
  { key: "bashful", label: "Tímida" },
  { key: "rash", label: "Alocada (+At.Esp, -Def.Esp)" },
  { key: "calm", label: "Serena (+Def.Esp, -Atq)" },
  { key: "gentle", label: "Amable (+Def.Esp, -Def)" },
  { key: "sassy", label: "Grosera (+Def.Esp, -Vel)" },
  { key: "careful", label: "Cauta (+Def.Esp, -At.Esp)" },
  { key: "quirky", label: "Rara" },
];

export interface EvSpread {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export const EMPTY_EV_SPREAD: EvSpread = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

const VERSION_GROUP_ORDER = [
  "red-blue",
  "yellow",
  "gold-silver",
  "crystal",
  "ruby-sapphire",
  "emerald",
  "firered-leafgreen",
  "diamond-pearl",
  "platinum",
  "heartgold-soulsilver",
  "black-white",
  "black-2-white-2",
  "x-y",
  "omega-ruby-alpha-sapphire",
  "sun-moon",
  "ultra-sun-ultra-moon",
  "lets-go-pikachu-lets-go-eevee",
  "sword-shield",
  "brilliant-diamond-and-shining-pearl",
  "legends-arceus",
  "scarlet-violet",
  "legends-z-a",
];

const VERSION_GROUP_LABELS: Record<string, string> = {
  "red-blue": "Rojo / Azul",
  yellow: "Amarillo",
  "gold-silver": "Oro / Plata",
  crystal: "Cristal",
  "ruby-sapphire": "Rubí / Zafiro",
  emerald: "Esmeralda",
  "firered-leafgreen": "Rojo Fuego / Verde Hoja",
  "diamond-pearl": "Diamante / Perla",
  platinum: "Platino",
  "heartgold-soulsilver": "HeartGold / SoulSilver",
  "black-white": "Negro / Blanco",
  "black-2-white-2": "Negro 2 / Blanco 2",
  "x-y": "X / Y",
  "omega-ruby-alpha-sapphire": "Rubí Omega / Zafiro Alfa",
  "sun-moon": "Sol / Luna",
  "ultra-sun-ultra-moon": "Ultrasol / Ultraluna",
  "lets-go-pikachu-lets-go-eevee": "Let's Go Pikachu / Eevee",
  "sword-shield": "Espada / Escudo",
  "brilliant-diamond-and-shining-pearl": "Diamante Brillante / Perla Reluciente",
  "legends-arceus": "Leyendas Pokémon: Arceus",
  "scarlet-violet": "Escarlata / Púrpura",
  "legends-z-a": "Leyendas Pokémon: Z-A",
};


export const COMPETITIVE_ITEM_SUGGESTION_KEYS = [
  "leftovers", "life-orb", "assault-vest", "safety-goggles", "choice-band", "choice-specs",
  "choice-scarf", "focus-sash", "heavy-duty-boots", "sitrus-berry", "clear-amulet",
  "booster-energy", "eviolite", "rocky-helmet", "weakness-policy", "light-clay",
  "black-sludge", "white-herb", "power-herb", "mental-herb", "covert-cloak",
  "loaded-dice", "mirror-herb", "throat-spray", "room-service", "air-balloon",
  "shed-shell", "wide-lens", "zoom-lens", "expert-belt", "muscle-band",
  "wise-glasses", "charcoal", "mystic-water", "miracle-seed", "magnet",
  "never-melt-ice", "spell-tag", "dragon-fang", "soft-sand", "sharp-beak",
  "twisted-spoon", "silver-powder", "hard-stone", "black-glasses", "metal-coat",
  "pixie-plate", "terrain-extender", "red-card", "eject-button", "eject-pack",
] as const;

const ITEM_ES: Record<string, string> = {
  leftovers: "Restos",
  "life-orb": "Vidasfera",
  "assault-vest": "Chaleco Asalto",
  "safety-goggles": "Gafas Protectoras",
  "choice-band": "Cinta Elegida",
  "choice-specs": "Gafas Elegidas",
  "choice-scarf": "Pañuelo Elegido",
  "focus-sash": "Banda Focus",
  "heavy-duty-boots": "Botas Gruesas",
  "sitrus-berry": "Baya Zidra",
  "clear-amulet": "Amuleto Puro",
  "booster-energy": "Energía Potenciadora",
  "eviolite": "Mineral Evolutivo",
  "rocky-helmet": "Casco Dentado",
  "weakness-policy": "Seguro Debilidad",
  "light-clay": "Refleluz",
  "black-sludge": "Lodo Negro",
  "white-herb": "Hierba Blanca",
  "power-herb": "Hierba Única",
  "mental-herb": "Hierba Mental",
  "covert-cloak": "Capa Furtiva",
  "loaded-dice": "Dado Trucado",
  "mirror-herb": "Hierba Espejo",
  "throat-spray": "Aerosol Bucal",
  "air-balloon": "Globo Helio",
};

function comparable(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9-]/g, "");
}

function aliasesWithLocalized(name: string, localized: LocalizedLabelMap | undefined, fallback: (key: string) => string): string[] {
  return [name, localized?.[name], fallback(name), titleCase(name)]
    .filter((value): value is string => Boolean(value))
    .map(comparable);
}

function moveAliases(name: string, localized?: LocalizedLabelMap): string[] {
  return aliasesWithLocalized(name, localized, moveLabel);
}

function abilityAliases(name: string, localized?: LocalizedLabelMap): string[] {
  return aliasesWithLocalized(name, localized, abilityLabel);
}

export function itemLabel(name: string): string {
  return ITEM_ES[name] || titleCase(name);
}

function itemAliases(item: NamedAPIResource, localized?: LocalizedLabelMap): string[] {
  return aliasesWithLocalized(item.name, localized, itemLabel);
}

export function getAvailableVersionGroups(pokemon: Pokemon): string[] {
  const names = new Set<string>();
  for (const slot of pokemon.moves || []) {
    for (const detail of slot.version_group_details || []) {
      if (detail.version_group?.name) names.add(detail.version_group.name);
    }
  }
  const rank = new Map(VERSION_GROUP_ORDER.map((name, index) => [name, index]));
  return [...names].sort((a, b) => {
    const rankA = rank.get(a) ?? -1;
    const rankB = rank.get(b) ?? -1;
    if (rankA !== rankB) return rankB - rankA;
    return a.localeCompare(b);
  });
}

export function versionGroupLabel(name: string): string {
  return VERSION_GROUP_LABELS[name] || titleCase(name);
}

export function validateAbility(pokemon: Pokemon, input: string, localized?: LocalizedLabelMap): boolean {
  const value = comparable(input);
  if (!value) return false;
  return pokemon.abilities.some((slot) => abilityAliases(slot.ability.name, localized).includes(value));
}

export function resolveAbilityKey(pokemon: Pokemon, input: string, localized?: LocalizedLabelMap): string | null {
  const value = comparable(input);
  return pokemon.abilities.find((slot) => abilityAliases(slot.ability.name, localized).includes(value))?.ability.name || null;
}

export function resolveMoveKey(pokemon: Pokemon, input: string, localized?: LocalizedLabelMap): string | null {
  const value = comparable(input);
  if (!value) return null;
  return (pokemon.moves || []).find((slot) => moveAliases(slot.move.name, localized).includes(value))?.move.name || null;
}

export function validateMoveForVersion(pokemon: Pokemon, input: string, versionGroup: string, localized?: LocalizedLabelMap): boolean {
  const key = resolveMoveKey(pokemon, input, localized);
  if (!key) return false;
  const slot = (pokemon.moves || []).find((entry) => entry.move.name === key);
  if (!slot) return false;
  if (!versionGroup) return slot.version_group_details.length > 0;
  return slot.version_group_details.some((detail) => detail.version_group?.name === versionGroup);
}

export function getMoveOptionsForVersion(pokemon: Pokemon, versionGroup: string): string[] {
  return (pokemon.moves || [])
    .filter((slot) => !versionGroup || slot.version_group_details.some((detail) => detail.version_group?.name === versionGroup))
    .map((slot) => slot.move.name)
    .sort((a, b) => moveLabel(a).localeCompare(moveLabel(b), "es"));
}

export function resolveItemKey(items: NamedAPIResource[], input: string, localized?: LocalizedLabelMap): string | null {
  const value = comparable(input);
  if (!value) return null;
  return items.find((item) => itemAliases(item, localized).includes(value))?.name || null;
}

export function validateItem(items: NamedAPIResource[], input: string, localized?: LocalizedLabelMap): boolean {
  return Boolean(resolveItemKey(items, input, localized));
}

export function resolveNatureKey(input: string): string | null {
  const value = comparable(input);
  const found = NATURE_OPTIONS.find((nature) => [nature.key, nature.label, titleCase(nature.key)].map(comparable).includes(value));
  return found?.key || null;
}

export function validateNature(input: string): boolean {
  return Boolean(resolveNatureKey(input));
}

function safeEv(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

export function validateEvSpread(spread: EvSpread): { valid: boolean; total: number; errors: string[] } {
  const normalized: EvSpread = {
    hp: safeEv(spread.hp),
    attack: safeEv(spread.attack),
    defense: safeEv(spread.defense),
    specialAttack: safeEv(spread.specialAttack),
    specialDefense: safeEv(spread.specialDefense),
    speed: safeEv(spread.speed),
  };
  const entries = Object.entries(normalized) as Array<[keyof EvSpread, number]>;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const errors: string[] = [];
  if (entries.some(([, value]) => value > 252)) errors.push("Cada estadística admite como máximo 252 EVs.");
  if (total > 510) errors.push("El total de EVs no puede superar 510.");
  return { valid: errors.length === 0, total, errors };
}

const EV_LABELS: Array<[keyof EvSpread, string, string[]]> = [
  ["hp", "PS", ["ps", "hp"]],
  ["attack", "Atq", ["atq", "ataque", "atk"]],
  ["defense", "Def", ["def", "defensa"]],
  ["specialAttack", "At.Esp", ["at.esp", "atesp", "ataqueespecial", "spa", "spatk"]],
  ["specialDefense", "Def.Esp", ["def.esp", "defesp", "defensaespecial", "spd", "spdef"]],
  ["speed", "Vel", ["vel", "velocidad", "spe", "speed"]],
];

export function normalizeEvSpread(value: string | Partial<EvSpread> | null | undefined): EvSpread {
  if (value && typeof value === "object") {
    return {
      hp: safeEv(value.hp),
      attack: safeEv(value.attack),
      defense: safeEv(value.defense),
      specialAttack: safeEv(value.specialAttack),
      specialDefense: safeEv(value.specialDefense),
      speed: safeEv(value.speed),
    };
  }
  const result = { ...EMPTY_EV_SPREAD };
  const text = String(value || "");
  for (const part of text.split("/")) {
    const amount = Number(part.match(/\d+/)?.[0] || 0);
    const compact = part
      .replace(/\d+/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z.]/g, "");
    const matched = EV_LABELS.find(([, , aliases]) => aliases.some((alias) => compact === alias.replace(/[^a-z.]/g, "")));
    if (matched) result[matched[0]] = safeEv(amount);
  }
  return result;
}

export function formatEvSpread(spread: EvSpread): string {
  const pieces = EV_LABELS
    .map(([key, label]) => [safeEv(spread[key]), label] as const)
    .filter(([amount]) => amount > 0)
    .map(([amount, label]) => `${amount} ${label}`);
  return pieces.length ? pieces.join(" / ") : "0 EVs";
}
