import type { Pokemon, PokemonVariety } from "../types/pokemon";

export interface BattleFormStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface LocalBattleForm {
  id: string;
  species: string;
  label: string;
  types: string[];
  ability: string;
  stats: BattleFormStats;
  height: number;
  weight: number;
  artwork?: string;
  note?: string;
}

export interface BattleFormOption {
  id: string;
  label: string;
  kind: "base" | "api" | "local";
  pokemonName?: string;
  localForm?: LocalBattleForm;
}

const LOCAL_BATTLE_FORMS: LocalBattleForm[] = [
  {
    id: "staraptor-mega",
    species: "staraptor",
    label: "Mega-Staraptor",
    types: ["fighting", "flying"],
    ability: "contrary",
    stats: {
      hp: 85,
      attack: 140,
      defense: 100,
      specialAttack: 60,
      specialDefense: 90,
      speed: 110,
    },
    height: 19,
    weight: 500,
    artwork: "https://oze5kscmlfwcwdlw.public.blob.vercel-storage.com/sprites/pokemon/other/official-artwork/10308.png",
    note: "Forma de Megaevolución disponible en Pokémon Champions.",
  },
];

function words(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.length <= 2 ? part.toUpperCase() : `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join(" ");
}

export function battleFormLabel(speciesName: string, pokemonName: string): string {
  if (pokemonName === speciesName) return words(speciesName);
  const suffix = pokemonName.startsWith(`${speciesName}-`) ? pokemonName.slice(speciesName.length + 1) : pokemonName;
  if (suffix === "mega") return `Mega-${words(speciesName)}`;
  if (suffix.startsWith("mega-")) return `Mega-${words(speciesName)} ${words(suffix.slice(5))}`;
  const region = ({ alola: "Alola", galar: "Galar", hisui: "Hisui", paldea: "Paldea" } as Record<string, string>)[suffix];
  if (region) return `${words(speciesName)} de ${region}`;
  return `${words(speciesName)} · ${words(suffix)}`;
}

export function getLocalBattleForms(speciesName: string): LocalBattleForm[] {
  return LOCAL_BATTLE_FORMS.filter((form) => form.species === speciesName);
}

export function mergeBattleFormOptions(speciesName: string, varieties: PokemonVariety[] = []): BattleFormOption[] {
  const defaultVariety = varieties.find((item) => item.is_default)?.pokemon.name || speciesName;
  const options: BattleFormOption[] = [
    { id: defaultVariety, label: battleFormLabel(speciesName, defaultVariety), kind: "base", pokemonName: defaultVariety },
  ];

  for (const variety of varieties) {
    const name = variety.pokemon.name;
    if (name === defaultVariety) continue;
    options.push({ id: name, label: battleFormLabel(speciesName, name), kind: "api", pokemonName: name });
  }

  for (const form of getLocalBattleForms(speciesName)) {
    if (options.some((option) => option.id === form.id)) continue;
    options.push({ id: form.id, label: form.label, kind: "local", localForm: form });
  }

  return options;
}

export function applyLocalBattleForm(basePokemon: Pokemon, form: LocalBattleForm): Pokemon {
  const statMap: Record<string, number> = {
    hp: form.stats.hp,
    attack: form.stats.attack,
    defense: form.stats.defense,
    "special-attack": form.stats.specialAttack,
    "special-defense": form.stats.specialDefense,
    speed: form.stats.speed,
  };

  return {
    ...basePokemon,
    name: form.id,
    height: form.height,
    weight: form.weight,
    abilities: [{ is_hidden: false, slot: 1, ability: { name: form.ability, url: "" } }],
    types: form.types.map((name, index) => ({ slot: index + 1, type: { name, url: "" } })),
    stats: basePokemon.stats.map((entry) => ({ ...entry, base_stat: statMap[entry.stat.name] ?? entry.base_stat })),
    sprites: {
      ...basePokemon.sprites,
      other: {
        ...basePokemon.sprites.other,
        "official-artwork": {
          ...basePokemon.sprites.other?.["official-artwork"],
          front_default: form.artwork || basePokemon.sprites.other?.["official-artwork"]?.front_default || basePokemon.sprites.front_default || null,
        },
      },
    },
  };
}
