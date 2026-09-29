export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface LocalizedName {
  name: string;
  language: NamedAPIResource;
}

export interface LocalizedNamedResource {
  name?: string;
  names?: LocalizedName[];
}

export interface GenusEntry {
  genus: string;
  language: NamedAPIResource;
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version?: NamedAPIResource;
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonStatSlot {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonAbilitySlot {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonSprites {
  front_default?: string | null;
  front_shiny?: string | null;
  front_female?: string | null;
  front_shiny_female?: string | null;
  other?: {
    "official-artwork"?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
    home?: {
      front_default?: string | null;
      front_shiny?: string | null;
      front_female?: string | null;
      front_shiny_female?: string | null;
    };
  };
}


export interface PokemonMoveSlot {
  move: NamedAPIResource;
  version_group_details: Array<{
    level_learned_at?: number;
    move_learn_method?: NamedAPIResource;
    version_group?: NamedAPIResource;
  }>;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: PokemonAbilitySlot[];
  forms: NamedAPIResource[];
  species: NamedAPIResource;
  sprites: PokemonSprites;
  stats: PokemonStatSlot[];
  types: PokemonTypeSlot[];
  moves?: PokemonMoveSlot[];
}

export interface PokemonVariety {
  is_default: boolean;
  pokemon: NamedAPIResource;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  has_gender_differences: boolean;
  gender_rate?: number;
  generation?: NamedAPIResource;
  evolution_chain?: { url: string | null } | null;
  flavor_text_entries: FlavorTextEntry[];
  genera: GenusEntry[];
  names: LocalizedName[];
  varieties: PokemonVariety[];
}

export interface PokemonForm {
  id: number;
  name: string;
  is_mega?: boolean;
  is_battle_only?: boolean;
  is_default?: boolean;
  form_name?: string;
  pokemon?: NamedAPIResource;
  sprites?: {
    front_default?: string | null;
    front_shiny?: string | null;
    back_default?: string | null;
    back_shiny?: string | null;
  };
  types: PokemonTypeSlot[];
}

export interface EvolutionDetail {
  min_level?: number | null;
  item?: NamedAPIResource | null;
  held_item?: NamedAPIResource | null;
  trigger?: NamedAPIResource | null;
  min_happiness?: number | null;
  min_affection?: number | null;
  min_beauty?: number | null;
  time_of_day?: string;
  location?: NamedAPIResource | null;
  known_move?: NamedAPIResource | null;
  known_move_type?: NamedAPIResource | null;
  party_species?: NamedAPIResource | null;
  party_type?: NamedAPIResource | null;
  gender?: number | null;
  needs_overworld_rain?: boolean;
  turn_upside_down?: boolean;
  relative_physical_stats?: number | null;
}

export interface EvolutionNode {
  species: NamedAPIResource;
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionNode[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionNode;
}

export interface EncounterDetail {
  min_level: number;
  max_level: number;
  chance: number;
  method?: NamedAPIResource;
  condition_values?: NamedAPIResource[];
}

export interface EncounterVersionDetail {
  max_chance: number;
  version: NamedAPIResource;
  encounter_details: EncounterDetail[];
}

export interface Encounter {
  location_area: NamedAPIResource;
  version_details: EncounterVersionDetail[];
}

export interface TypeDamageRelations {
  double_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  no_damage_to: NamedAPIResource[];
}

export interface PokemonTypeResource {
  id?: number;
  name: string;
  damage_relations: TypeDamageRelations;
  pokemon?: Array<{
    slot: number;
    pokemon: NamedAPIResource;
  }>;
}

export interface PokemonBundle {
  pokemon: Pokemon;
  species: PokemonSpecies;
}

export type SearchIndexKind = "species" | "pokemon";

export interface SearchIndexItem {
  id: number | null;
  name: string;
  url: string;
  kind: SearchIndexKind;
  isVariant: boolean;
}

export interface SearchMatch extends SearchIndexItem {
  distance: number;
  score: number;
}

export interface SearchResolution {
  identifier: string | number | null;
  correction: string | null;
  suggestions: SearchMatch[];
}

export interface ResultItem {
  id: number;
  name: string;
  url?: string;
  isVariant?: boolean;
  speciesId?: number;
}

export interface TypeMultiplier {
  type: string;
  multiplier: number;
}

export type RarityFilter = "" | "legendary" | "mythical";
export type PokemonTab = "overview" | "variants" | "combat";

export interface StatusMessage {
  text: string;
  kind: "info" | "success" | "error";
}

export interface PokemonGeneration {
  id: number;
  name: string;
  main_region?: NamedAPIResource | null;
  pokemon_species: NamedAPIResource[];
}

export interface PokemonAbilityResource {
  id: number;
  name: string;
  names?: LocalizedName[];
  pokemon: Array<{
    is_hidden: boolean;
    slot: number;
    pokemon: NamedAPIResource;
  }>;
}

export interface MoveEffectEntry {
  effect: string;
  short_effect: string;
  language: NamedAPIResource;
}

export interface MoveFlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version_group?: NamedAPIResource;
}

export interface PokemonMoveResource {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number | null;
  priority: number;
  power: number | null;
  damage_class: NamedAPIResource;
  type: NamedAPIResource;
  generation: NamedAPIResource;
  names?: LocalizedName[];
  effect_entries?: MoveEffectEntry[];
  flavor_text_entries?: MoveFlavorTextEntry[];
  learned_by_pokemon: NamedAPIResource[];
}
