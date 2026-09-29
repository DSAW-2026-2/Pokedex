import type {
  Encounter,
  EvolutionChain,
  Pokemon,
  PokemonBundle,
  PokemonForm,
  PokemonSpecies,
  PokemonTypeResource,
  PokemonGeneration,
  LocalizedNamedResource,
  NamedAPIResource,
  ResultItem,
  SearchIndexItem,
  PokemonAbilityResource,
  PokemonMoveResource,
} from "../types/pokemon";
import { SPECIAL_POKEMON, type SpecialKind } from "../data/specialPokemon";
import { getFunctionalVariantFallbacks } from "../data/functionalVariants";
import { abilityLabel, extractId, moveLabel, titleCase } from "../utils/text";
import {
  clearPokedexCache,
  readLocalCache,
  readMemoryCache,
  writeLocalCache,
  writeMemoryCache,
} from "./cache";

export const API_BASE = "https://pokeapi.co/api/v2";

interface FetchOptions {
  useCache?: boolean;
  signal?: AbortSignal;
}

interface APIListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

function toUrl(resource: string): string {
  if (/^https?:\/\//i.test(resource)) return resource;
  return `${API_BASE}/${String(resource).replace(/^\//, "")}`;
}

export async function fetchJSON<T>(resource: string, options: FetchOptions = {}): Promise<T> {
  const { useCache = true, signal } = options;
  const url = toUrl(resource);

  if (useCache) {
    const memory = readMemoryCache<T>(url);
    if (memory !== null) return memory;

    const local = readLocalCache<T>(url);
    if (local !== null) {
      writeMemoryCache(url, local);
      return local;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new Error("No fue posible conectarse con PokéAPI. Revisa tu conexión a internet.");
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error("Pokémon o recurso no encontrado en PokéAPI.");
    throw new Error(`PokéAPI respondió con el estado HTTP ${response.status}.`);
  }

  const data = (await response.json()) as T;
  if (useCache) {
    writeMemoryCache(url, data);
    writeLocalCache(url, data);
  }
  return data;
}

export function getPokemon(identifier: string | number, signal?: AbortSignal): Promise<Pokemon> {
  return fetchJSON<Pokemon>(`pokemon/${encodeURIComponent(String(identifier).toLowerCase())}`, { signal });
}

export function getSpecies(identifierOrUrl: string | number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const value = String(identifierOrUrl);
  if (/^https?:\/\//i.test(value)) return fetchJSON<PokemonSpecies>(value, { signal });
  return fetchJSON<PokemonSpecies>(`pokemon-species/${encodeURIComponent(value.toLowerCase())}`, { signal });
}

export async function getPokemonBundle(identifier: string | number, signal?: AbortSignal): Promise<PokemonBundle> {
  try {
    const pokemon = await getPokemon(identifier, signal);
    const species = await getSpecies(pokemon.species.url, signal);
    return { pokemon, species };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    if (!(error instanceof Error) || !error.message.includes("no encontrado")) throw error;

    const species = await getSpecies(identifier, signal);
    const defaultVariety = species.varieties?.find((item) => item.is_default)?.pokemon?.name
      || species.varieties?.[0]?.pokemon?.name;
    if (!defaultVariety) throw error;
    const pokemon = await getPokemon(defaultVariety, signal);
    return { pokemon, species };
  }
}

export async function getSpeciesIndex(signal?: AbortSignal): Promise<SearchIndexItem[]> {
  const data = await fetchJSON<APIListResponse>("pokemon-species?limit=2000&offset=0", { signal });
  return data.results.map((item) => ({
    id: extractId(item.url),
    name: item.name,
    url: item.url,
    kind: "species" as const,
    isVariant: false,
  }));
}

export async function getHoldableItemIndex(signal?: AbortSignal): Promise<NamedAPIResource[]> {
  const data = await fetchJSON<{ items?: NamedAPIResource[] }>("item-attribute/holdable", { signal });
  return [...(data.items || [])].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPokemonIndex(signal?: AbortSignal): Promise<SearchIndexItem[]> {
  const data = await fetchJSON<APIListResponse>("pokemon?limit=2000&offset=0", { signal });
  return data.results.map((item) => {
    const id = extractId(item.url);
    return {
      id,
      name: item.name,
      url: item.url,
      kind: "pokemon" as const,
      isVariant: Boolean(id && id >= 10000),
    };
  });
}

export async function getSearchIndex(signal?: AbortSignal): Promise<SearchIndexItem[]> {
  const [species, pokemon] = await Promise.all([
    getSpeciesIndex(signal),
    getPokemonIndex(signal),
  ]);
  const byName = new Map<string, SearchIndexItem>(species.map((item) => [item.name, item]));
  pokemon.forEach((item) => {
    if (!byName.has(item.name)) byName.set(item.name, item);
  });
  return [...byName.values()];
}



export async function getAbilityIndex(signal?: AbortSignal): Promise<NamedAPIResource[]> {
  const data = await fetchJSON<APIListResponse>("ability?limit=1000&offset=0", { signal });
  return data.results;
}

export function getAbility(identifier: string | number, signal?: AbortSignal): Promise<PokemonAbilityResource> {
  return fetchJSON<PokemonAbilityResource>(`ability/${encodeURIComponent(String(identifier).toLowerCase())}`, { signal });
}

export async function getMoveIndex(signal?: AbortSignal): Promise<NamedAPIResource[]> {
  const data = await fetchJSON<APIListResponse>("move?limit=2000&offset=0", { signal });
  return data.results;
}

export function getMove(identifier: string | number, signal?: AbortSignal): Promise<PokemonMoveResource> {
  return fetchJSON<PokemonMoveResource>(`move/${encodeURIComponent(String(identifier).toLowerCase())}`, { signal });
}

export function getGeneration(identifier: string | number, signal?: AbortSignal): Promise<PokemonGeneration> {
  return fetchJSON<PokemonGeneration>(`generation/${encodeURIComponent(String(identifier).toLowerCase())}`, { signal });
}

export function getType(typeName: string, signal?: AbortSignal): Promise<PokemonTypeResource> {
  return fetchJSON<PokemonTypeResource>(`type/${encodeURIComponent(typeName)}`, { signal });
}

export async function searchByType(typeName: string, signal?: AbortSignal): Promise<ResultItem[]> {
  const data = await getType(typeName, signal);
  return (data.pokemon || []).map((entry) => {
    const id = extractId(entry.pokemon.url) || 0;
    return {
      id,
      name: entry.pokemon.name,
      url: entry.pokemon.url,
      isVariant: id >= 10000,
    };
  });
}

export function getSpecialIndex(kind: SpecialKind): ResultItem[] {
  return SPECIAL_POKEMON[kind].map(([id, name]) => ({ id, name, speciesId: id, isVariant: false }));
}

export async function filterTypeResultsBySpecial(
  typeResults: ResultItem[],
  kind: SpecialKind,
  signal?: AbortSignal,
): Promise<ResultItem[]> {
  const rows = SPECIAL_POKEMON[kind];
  const specialNames = new Set(rows.map(([, name]) => name));
  const specialIdsByName = new Map(rows.map(([id, name]) => [name, id]));
  const specialIdSet = new Set(rows.map(([id]) => id));
  const accepted: ResultItem[] = [];
  const candidates: ResultItem[] = [];

  for (const item of typeResults) {
    // Algunas especies usan como Pokémon por defecto un nombre con sufijo
    // (p. ej. tornadus-incarnate) pero conservan el mismo ID nacional.
    if (specialIdSet.has(item.id)) {
      accepted.push({ ...item, speciesId: item.id });
      continue;
    }
    if (specialNames.has(item.name)) {
      accepted.push({ ...item, speciesId: specialIdsByName.get(item.name) });
      continue;
    }
    // Los IDs altos son variedades reales de /pokemon. Validamos su especie
    // consultando pokemon.species en vez de adivinarla por el prefijo del nombre.
    if (item.isVariant || item.id >= 10000) candidates.push(item);
  }

  if (!candidates.length) return accepted;

  const settled = await Promise.allSettled(candidates.map((item) => getPokemon(item.name, signal)));
  settled.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const speciesName = result.value.species.name;
    if (!specialNames.has(speciesName)) return;
    accepted.push({
      ...candidates[index],
      speciesId: specialIdsByName.get(speciesName) || extractId(result.value.species.url) || undefined,
    });
  });

  return accepted;
}

export function getEvolutionChain(url?: string | null, signal?: AbortSignal): Promise<EvolutionChain | null> {
  if (!url) return Promise.resolve(null);
  return fetchJSON<EvolutionChain>(url, { signal });
}

export function getEncounters(identifier: number, signal?: AbortSignal): Promise<Encounter[]> {
  return fetchJSON<Encounter[]>(`pokemon/${encodeURIComponent(String(identifier))}/encounters`, {
    useCache: false,
    signal,
  });
}

export function getForm(formUrl: string, signal?: AbortSignal): Promise<PokemonForm> {
  return fetchJSON<PokemonForm>(formUrl, { signal });
}

export async function getAllForms(pokemon: Pokemon, signal?: AbortSignal): Promise<PokemonForm[]> {
  const references = pokemon.forms || [];
  if (!references.length) return [];
  const settled = await Promise.allSettled(references.map((reference) => getForm(reference.url, signal)));
  return settled
    .filter((item): item is PromiseFulfilledResult<PokemonForm> => item.status === "fulfilled")
    .map((item) => item.value);
}

export async function getVarietyDetails(species: PokemonSpecies, signal?: AbortSignal): Promise<Pokemon[]> {
  // species.varieties sigue siendo la fuente principal. El catálogo funcional añade
  // candidatos conocidos que PokéAPI puede exponer fuera de esa lista. Cada candidato
  // se valida consultando /pokemon, así que nunca inventamos una ficha inexistente.
  const declared = (species.varieties || []).map((item) => item.pokemon?.name).filter(Boolean);
  const fallbacks = getFunctionalVariantFallbacks(species.name);
  const names = [...new Set([...declared, ...fallbacks])];
  if (!names.length) return [];
  const settled = await Promise.allSettled(names.map((name) => getPokemon(name, signal)));
  return settled
    .filter((item): item is PromiseFulfilledResult<Pokemon> => item.status === "fulfilled")
    .map((item) => item.value);
}

export async function getTypeRelations(typeNames: string[], signal?: AbortSignal): Promise<PokemonTypeResource[]> {
  const settled = await Promise.allSettled(typeNames.map((name) => getType(name, signal)));
  return settled
    .filter((item): item is PromiseFulfilledResult<PokemonTypeResource> => item.status === "fulfilled")
    .map((item) => item.value);
}


export async function getLocalizedResourceName(
  resource: NamedAPIResource | null | undefined,
  kind: "ability" | "move" | "generic" = "generic",
  signal?: AbortSignal,
): Promise<string> {
  if (!resource) return "Sin datos";
  const fallback = kind === "ability"
    ? abilityLabel(resource.name)
    : kind === "move"
      ? moveLabel(resource.name)
      : titleCase(resource.name);
  if (!resource.url) return fallback;

  try {
    const data = await fetchJSON<LocalizedNamedResource>(resource.url, { signal });
    const spanish = data.names?.find((entry) => entry.language?.name === "es")?.name;
    return spanish || fallback;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    return fallback;
  }
}

export async function getLocalizedResourceNames(
  resources: NamedAPIResource[],
  kind: "ability" | "move" | "generic" = "generic",
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  const unique = [...new Map(resources.filter((resource) => resource?.name).map((resource) => [resource.name, resource])).values()];
  const entries = await Promise.all(
    unique.map(async (resource) => [resource.name, await getLocalizedResourceName(resource, kind, signal)] as const),
  );
  return Object.fromEntries(entries);
}

export function clearCache(): void {
  clearPokedexCache();
}
