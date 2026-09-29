import type { Pokemon, PokemonSpecies, PokemonTypeSlot, ResultItem } from "../types/pokemon";
import { extractId } from "./text";

export function spriteArtwork(pokemon?: Pokemon | null): string {
  return (
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.other?.home?.front_default ||
    pokemon?.sprites?.front_default ||
    ""
  );
}

export function shinyArtwork(pokemon?: Pokemon | null): string {
  return (
    pokemon?.sprites?.other?.["official-artwork"]?.front_shiny ||
    pokemon?.sprites?.other?.home?.front_shiny ||
    pokemon?.sprites?.front_shiny ||
    ""
  );
}

export function evolutionShinyArtwork(pokemon?: Pokemon | null): { url: string; available: boolean } {
  const url = shinyArtwork(pokemon);
  return { url, available: Boolean(url) };
}

export function evolutionArtworkForMode(
  pokemon: Pokemon | null | undefined,
  showShiny: boolean,
): { url: string; available: boolean; shiny: boolean } {
  const url = showShiny ? shinyArtwork(pokemon) : spriteArtwork(pokemon);
  return { url, available: Boolean(url), shiny: showShiny };
}

export function isDefaultVariety(species: PokemonSpecies, pokemon: Pokemon): boolean {
  const defaultName = species.varieties?.find((item) => item.is_default)?.pokemon?.name;
  return !defaultName || pokemon.name === defaultName;
}

export function sortTypes(types: PokemonTypeSlot[]): PokemonTypeSlot[] {
  return [...types].sort((a, b) => a.slot - b.slot);
}

export function directArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function directSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function deduplicateResults(items: ResultItem[]): ResultItem[] {
  const map = new Map<string, ResultItem>();
  items.forEach((item) => {
    const key = item.name;
    if (item.id && !map.has(key)) map.set(key, item);
  });
  return [...map.values()].sort((a, b) => (a.speciesId || a.id) - (b.speciesId || b.id) || a.name.localeCompare(b.name));
}

export function speciesIdFromPokemon(pokemon: Pokemon): number | null {
  return extractId(pokemon.species.url);
}

const GENERATION_REGIONS: Record<string, string> = {
  "generation-i": "Kanto",
  "generation-ii": "Johto",
  "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh",
  "generation-v": "Teselia",
  "generation-vi": "Kalos",
  "generation-vii": "Alola",
  "generation-viii": "Galar",
  "generation-ix": "Paldea",
};

const REGIONAL_MARKERS: Array<[string, string]> = [
  ["-alola", "Alola"],
  ["-galar", "Galar"],
  ["-hisui", "Hisui"],
  ["-paldea", "Paldea"],
];

export function getOriginRegion(species: PokemonSpecies, pokemonName: string): string {
  const regional = REGIONAL_MARKERS.find(([marker]) => pokemonName.includes(marker));
  if (regional) return regional[1];
  return GENERATION_REGIONS[species.generation?.name || ""] || "Desconocida";
}

function typeNames(pokemon: Pokemon): string[] {
  return sortTypes(pokemon.types).map((item) => item.type.name);
}

export function hasTypeChange(base: Pokemon, variant: Pokemon): boolean {
  const baseTypes = typeNames(base);
  const variantTypes = typeNames(variant);
  return baseTypes.length !== variantTypes.length || baseTypes.some((name, index) => name !== variantTypes[index]);
}

function abilitySignature(pokemon: Pokemon): string[] {
  return pokemon.abilities
    .map((entry) => `${entry.ability.name}:${entry.is_hidden ? "hidden" : "regular"}`)
    .sort();
}

export function hasAbilityChange(base: Pokemon, variant: Pokemon): boolean {
  const baseAbilities = abilitySignature(base);
  const variantAbilities = abilitySignature(variant);
  return baseAbilities.length !== variantAbilities.length
    || baseAbilities.some((ability, index) => ability !== variantAbilities[index]);
}

export function hasStatChange(base: Pokemon, variant: Pokemon): boolean {
  if (base.stats.length !== variant.stats.length) return true;
  return base.stats.some((item, index) => item.base_stat !== variant.stats[index]?.base_stat);
}

export function hasMovePoolChange(base: Pokemon, variant: Pokemon): boolean {
  const baseMoves = new Set((base.moves || []).map((entry) => entry.move.name));
  const variantMoves = new Set((variant.moves || []).map((entry) => entry.move.name));
  if (baseMoves.size !== variantMoves.size) return true;
  return [...baseMoves].some((move) => !variantMoves.has(move));
}

const IMPORTANT_VARIANT_MARKERS = [
  "-alola", "-galar", "-hisui", "-paldea",
  "-mega", "-gmax", "-primal", "-origin", "-therian", "-sky",
  "-school", "-blade", "-crowned", "-eternamax", "-busted", "-complete",
  "-ash", "-zen", "-dusk", "-dawn", "-midnight", "-bloodmoon", "-hero", "-hangry",
  // Variantes que parecen cosméticas pero tienen reglas, movimientos o comportamiento propios.
  "-partner", "-cap", "-cosplay", "-rock-star", "-belle", "-pop-star", "-phd", "-libre",
  "-spiky-eared", "-eternal", "-white-striped", "-low-key",
  "-antique", "-artisan", "-masterpiece", "-counterfeit",
  "-curly", "-droopy", "-stretchy", "-plumage",
  "-male", "-female", "-small-size", "-average-size", "-large-size", "-super-size",
  "-small", "-average", "-large", "-super",
  "-douse", "-shock", "-burn", "-chill", "-meteor", "-core",
  "-sunny", "-rainy", "-snowy", "-sunshine", "-gulping", "-gorging", "-noice",
];

export function isMeaningfulVariant(base: Pokemon, variant: Pokemon): boolean {
  if (base.name === variant.name || base.id === variant.id) return false;
  if (IMPORTANT_VARIANT_MARKERS.some((marker) => variant.name.endsWith(marker) || variant.name.includes(`${marker}-`))) return true;
  return hasTypeChange(base, variant)
    || hasStatChange(base, variant)
    || hasAbilityChange(base, variant)
    || hasMovePoolChange(base, variant);
}

export function getVariantContext(name: string): string {
  if (name.includes("-alola")) return "Forma regional · Alola";
  if (name.includes("-galar")) return "Forma regional · Galar";
  if (name.includes("-hisui")) return "Forma regional · Hisui";
  if (name.includes("-paldea")) return "Forma regional · Paldea";
  if (name.includes("-mega")) return "Mega Evolución";
  if (name.includes("-gmax")) return "Gigamax · Galar";
  if (name.includes("-primal")) return "Regresión Primigenia";
  if (name.endsWith("-origin") || name.includes("-origin-")) return "Forma Origen";
  if (name.includes("-therian")) return "Forma Tótem";
  if (name.includes("-cap")) return "Pikachu con gorra · variante especial";
  if (["-cosplay", "-rock-star", "-belle", "-pop-star", "-phd", "-libre"].some((marker) => name.includes(marker))) return "Pikachu Coqueta · RO/ZA";
  if (name.includes("-partner")) return "Pokémon compañero · Let's Go";
  if (name.includes("-spiky-eared")) return "Forma especial · HG/SS";
  if (name.includes("-eternal")) return "Forma especial · Flor Eterna";
  if (name.includes("-white-striped")) return "Forma funcional · Raya Blanca";
  if (name.includes("-low-key")) return "Forma funcional · Low Key";
  if (name.includes("-antique") || name.includes("-artisan") || name.includes("-masterpiece") || name.includes("-counterfeit")) return "Forma de autenticidad";
  if (name.includes("-plumage")) return "Forma de plumaje";
  if (["-small-size", "-average-size", "-large-size", "-super-size", "-small", "-average", "-large", "-super"].some((marker) => name.includes(marker))) return "Forma por tamaño";
  if (["-douse", "-shock", "-burn", "-chill"].some((marker) => name.includes(marker))) return "Forma por ROM";
  if (["-meteor", "-core", "-sunny", "-rainy", "-snowy", "-sunshine", "-gulping", "-gorging", "-noice"].some((marker) => name.includes(marker))) return "Forma de combate";
  if (name.endsWith("-male")) return "Forma macho";
  if (name.endsWith("-female")) return "Forma hembra";
  return "Forma alternativa funcional";
}
