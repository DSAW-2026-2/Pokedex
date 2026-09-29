import type { GenusEntry, PokemonForm, PokemonSpecies } from "../types/pokemon";

export const TYPE_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

const STAT_ES: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Especial",
  "special-defense": "Def. Especial",
  speed: "Velocidad",
};

const ROMAN_GENERATIONS: Record<string, string> = {
  "generation-i": "I",
  "generation-ii": "II",
  "generation-iii": "III",
  "generation-iv": "IV",
  "generation-v": "V",
  "generation-vi": "VI",
  "generation-vii": "VII",
  "generation-viii": "VIII",
  "generation-ix": "IX",
  "generation-x": "X",
};

const VERSION_ES: Record<string, string> = {
  red: "Rojo", blue: "Azul", yellow: "Amarillo",
  gold: "Oro", silver: "Plata", crystal: "Cristal",
  ruby: "Rubí", sapphire: "Zafiro", emerald: "Esmeralda",
  firered: "Rojo Fuego", leafgreen: "Verde Hoja",
  diamond: "Diamante", pearl: "Perla", platinum: "Platino",
  heartgold: "Oro HeartGold", soulsilver: "Plata SoulSilver",
  black: "Negro", white: "Blanco", "black-2": "Negro 2", "white-2": "Blanco 2",
  x: "X", y: "Y", "omega-ruby": "Rubí Omega", "alpha-sapphire": "Zafiro Alfa",
  sun: "Sol", moon: "Luna", "ultra-sun": "Ultrasol", "ultra-moon": "Ultraluna",
  "lets-go-pikachu": "Let's Go, Pikachu!", "lets-go-eevee": "Let's Go, Eevee!",
  sword: "Espada", shield: "Escudo", "brilliant-diamond": "Diamante Brillante",
  "shining-pearl": "Perla Reluciente", "legends-arceus": "Leyendas Pokémon: Arceus",
  scarlet: "Escarlata", violet: "Púrpura",
};

export const MOVE_ES: Record<string, string> = {
  "fake-out": "Sorpresa", protect: "Protección", "parting-shot": "Última Palabra",
  "u-turn": "Ida y Vuelta", "volt-switch": "Voltiocambio", tailwind: "Viento Afín",
  "trick-room": "Espacio Raro", "helping-hand": "Refuerzo", "follow-me": "Señuelo",
  "rage-powder": "Polvo Ira", spore: "Espora", "thunder-wave": "Onda Trueno",
  "will-o-wisp": "Fuego Fatuo", snarl: "Alarido", "knock-off": "Desarme", taunt: "Mofa",
  encore: "Otra Vez", "wide-guard": "Vasta Guardia", "icy-wind": "Viento Hielo",
  reflect: "Reflejo", "light-screen": "Pantalla Luz", earthquake: "Terremoto",
  "rock-slide": "Avalancha", "close-combat": "A Bocajarro", "sucker-punch": "Golpe Bajo",
  "ice-spinner": "Pirueta Helada", "ice-beam": "Rayo Hielo", thunderbolt: "Rayo",
  "shadow-ball": "Bola Sombra", moonblast: "Fuerza Lunar", "play-rough": "Carantoña",
  tackle: "Placaje", "dragon-claw": "Garra Dragón", "swords-dance": "Danza Espada",
  "body-slam": "Golpe Cuerpo", "double-edge": "Doble Filo", "hyper-voice": "Vozarrón",
  facade: "Imagen", "flare-blitz": "Envite Ígneo", "heat-wave": "Onda Ígnea",
  overheat: "Sofoco", flamethrower: "Lanzallamas", "fire-blast": "Llamarada",
  "wave-crash": "Envite Acuático", liquidation: "Hidroariete", "hydro-pump": "Hidrobomba",
  surf: "Surf", scald: "Escaldar", "wild-charge": "Voltio Cruel", discharge: "Chispazo",
  thunder: "Trueno", "grassy-glide": "Fitoimpulso", "wood-hammer": "Mazazo",
  "power-whip": "Latigazo", "leaf-blade": "Hoja Aguda", "energy-ball": "Energibola",
  "giga-drain": "Gigadrenado", "icicle-crash": "Chuzos", blizzard: "Ventisca",
  "freeze-dry": "Liofilización", "drain-punch": "Puño Drenaje", "body-press": "Plancha Corporal",
  "aura-sphere": "Esfera Aural", "focus-blast": "Onda Certera", "gunk-shot": "Lanzamugre",
  "poison-jab": "Puya Nociva", "sludge-bomb": "Bomba Lodo", "sludge-wave": "Onda Tóxica",
  "high-horsepower": "Fuerza Equina", "earth-power": "Tierra Viva", "stomping-tantrum": "Pataleta",
  "brave-bird": "Pájaro Osado", "dual-wingbeat": "Ala Bis", "air-slash": "Tajo Aéreo",
  hurricane: "Vendaval", psychic: "Psíquico", psyshock: "Psicocarga",
  "expanding-force": "Vasta Fuerza", "zen-headbutt": "Cabezazo Zen", "x-scissor": "Tijera X",
  "bug-buzz": "Zumbido", "leech-life": "Chupavidas", "stone-edge": "Roca Afilada",
  "power-gem": "Joya de Luz", "rock-blast": "Pedrada", poltergeist: "Poltergeist",
  "shadow-claw": "Garra Umbría", hex: "Infortunio", "draco-meteor": "Cometa Draco",
  outrage: "Enfado", "dragon-pulse": "Pulso Dragón", "darkest-lariat": "Lariat Oscuro",
  "dark-pulse": "Pulso Umbrío", "iron-head": "Cabeza de Hierro", "flash-cannon": "Foco Resplandor",
  "heavy-slam": "Cuerpo Pesado", "meteor-mash": "Puño Meteoro", "dazzling-gleam": "Brillo Mágico",
  "draining-kiss": "Beso Drenaje", "aqua-jet": "Acua Jet", "bullet-punch": "Puño Bala",
  "extreme-speed": "Velocidad Extrema", "ice-shard": "Canto Helado", teleport: "Teletransporte",
  "solar-beam": "Rayo Solar", roost: "Respiro", "dragon-dance": "Danza Dragón",
  "nasty-plot": "Maquinación", "calm-mind": "Paz Mental", substitute: "Sustituto",
};

export const ABILITY_ES: Record<string, string> = {
  "sand-veil": "Velo Arena", intimidate: "Intimidación", "grassy-surge": "Herbogénesis",
  "cursed-body": "Cuerpo Maldito", levitate: "Levitación", overgrow: "Espesura", blaze: "Mar Llamas",
  torrent: "Torrente", swarm: "Enjambre", pressure: "Presión", sturdy: "Robustez",
  "solar-power": "Poder Solar", "magic-guard": "Muro Mágico", "prankster": "Bromista",
  "protosynthesis": "Paleosíntesis", "quark-drive": "Carga Cuark", contrary: "Respondón",
};

export function moveLabel(name = ""): string {
  const key = normalizeText(name);
  return MOVE_ES[key] || titleCase(name);
}

export function abilityLabel(name = ""): string {
  const key = normalizeText(name);
  return ABILITY_ES[key] || titleCase(name);
}

export function normalizeText(value = ""): string {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");
}

export function compactText(value = ""): string {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

export function extractId(url = ""): number | null {
  const parts = url.split("/").filter(Boolean);
  const id = Number(parts.at(-1));
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function padDex(id: number | null | undefined): string {
  if (!id) return "#????";
  return `#${String(id).padStart(4, "0")}`;
}

export function titleCase(value = ""): string {
  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generationRoman(name = ""): string {
  return ROMAN_GENERATIONS[name] || titleCase(name);
}

export function statLabel(name = ""): string {
  return STAT_ES[name] || titleCase(name);
}

export function typeLabel(name = ""): string {
  return TYPE_ES[name] || titleCase(name);
}

export function sanitizeFlavorText(text = ""): string {
  return text.replace(/[\n\f\r]+/g, " ").replace(/\s+/g, " ").trim();
}

export function getLocalizedEntry(
  entries: Array<{ language?: { name: string }; name?: string; genus?: string }> = [],
  field: "name" | "genus",
  preferred = ["es", "en"],
): string {
  for (const lang of preferred) {
    const found = entries.find((entry) => entry.language?.name === lang && entry[field]);
    if (found?.[field]) return sanitizeFlavorText(String(found[field]));
  }
  const first = entries[0]?.[field];
  return first ? sanitizeFlavorText(String(first)) : "";
}

export function classifySpecialForm(name = "", formData: PokemonForm | null = null): string {
  const n = normalizeText(name);
  if (formData?.is_mega || n.includes("mega")) return "Mega Evolución";
  if (n.includes("gmax")) return "Gigamax";
  if (n.includes("primal")) return "Forma Primigenia";
  if (n.includes("origin")) return "Forma Origen";
  if (n.includes("alola")) return "Forma de Alola";
  if (n.includes("galar")) return "Forma de Galar";
  if (n.includes("hisui")) return "Forma de Hisui";
  if (n.includes("paldea")) return "Forma de Paldea";
  if (n.includes("therian")) return "Forma Therian";
  if (n.includes("incarnate")) return "Forma Incarnate";
  if (n.includes("crowned")) return "Forma Coronada";
  if (n.includes("eternamax")) return "Eternamax";
  if (n.includes("ultra")) return "Forma Ultra";
  if (formData?.is_battle_only) return "Forma de combate";
  return "Forma especial";
}

export function getDisplayName(species: PokemonSpecies, pokemonName: string): string {
  const spanish = species.names?.find((item) => item.language?.name === "es")?.name;
  const english = species.names?.find((item) => item.language?.name === "en")?.name;
  const baseName = spanish || english || titleCase(species.name);
  const defaultName = species.varieties?.find((item) => item.is_default)?.pokemon?.name;
  if (!defaultName || pokemonName === defaultName) return baseName;
  const category = classifySpecialForm(pokemonName);
  return category.startsWith("Forma de ") ? `${baseName} · ${category}` : titleCase(pokemonName);
}

export function getCategory(species: PokemonSpecies): string {
  return getLocalizedEntry(species.genera as GenusEntry[], "genus", ["es"]) || "Sin categoría";
}

export function getLatestFlavor(species: PokemonSpecies): string {
  const spanish = (species.flavor_text_entries || []).filter((entry) => entry.language?.name === "es");
  const chosen = spanish.at(-1);
  return chosen
    ? sanitizeFlavorText(chosen.flavor_text)
    : "PokéAPI no tiene una descripción disponible para esta especie.";
}

export interface VersionFlavorEntry {
  version: string;
  text: string;
  language: string;
}

export function getFlavorEntriesByVersion(species: PokemonSpecies): VersionFlavorEntry[] {
  const grouped = new Map<string, VersionFlavorEntry>();
  const entries = species.flavor_text_entries || [];

  for (const entry of entries.filter((row) => row.language?.name === "es")) {
    const version = entry.version?.name || "general";
    if (!grouped.has(version)) {
      grouped.set(version, { version, text: sanitizeFlavorText(entry.flavor_text), language: "es" });
    }
  }


  return [...grouped.values()];
}

export function formatGenderRatio(species: PokemonSpecies): string {
  const rate = species.gender_rate;
  if (rate === -1) return "Sin género";
  if (typeof rate !== "number" || rate < 0 || rate > 8) return "Sin datos";
  const female = (rate / 8) * 100;
  const male = 100 - female;
  if (female === 0) return "♂ 100%";
  if (male === 0) return "♀ 100%";
  const clean = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  return `♂ ${clean(male)}% · ♀ ${clean(female)}%`;
}

export function versionLabel(name: string): string {
  return VERSION_ES[name] || titleCase(name.replace(/-/g, " "));
}
