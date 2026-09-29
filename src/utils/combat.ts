import type { Pokemon, PokemonTypeResource, TypeMultiplier } from "../types/pokemon";

export const ALL_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const;

function resourceFor(name: string, resources: PokemonTypeResource[]): PokemonTypeResource | undefined {
  return resources.find((resource) => resource.name === name);
}

function relationContains(list: Array<{ name: string }>, typeName: string): boolean {
  return list.some((item) => item.name === typeName);
}

export function defensiveMultiplierForAttacker(
  attackingType: string,
  defenderTypes: string[],
  resources: PokemonTypeResource[],
): number {
  let multiplier = 1;
  for (const defenderType of defenderTypes) {
    const resource = resourceFor(defenderType, resources);
    if (!resource) continue;
    const relations = resource.damage_relations;
    if (relationContains(relations.no_damage_from || [], attackingType)) return 0;
    if (relationContains(relations.double_damage_from || [], attackingType)) multiplier *= 2;
    if (relationContains(relations.half_damage_from || [], attackingType)) multiplier *= 0.5;
  }
  return multiplier;
}

export function calculateDefensiveProfile(typeNames: string[], resources: PokemonTypeResource[]): TypeMultiplier[] {
  return ALL_TYPES.map((type) => ({
    type,
    multiplier: defensiveMultiplierForAttacker(type, typeNames, resources),
  })).filter((row) => row.multiplier !== 1);
}

export interface OffensiveAdvantage {
  sourceType: string;
  strongAgainst: string[];
}

export function getOffensiveAdvantages(typeNames: string[], resources: PokemonTypeResource[]): OffensiveAdvantage[] {
  return typeNames.map((sourceType) => {
    const resource = resourceFor(sourceType, resources);
    return {
      sourceType,
      strongAgainst: (resource?.damage_relations.double_damage_to || []).map((entry) => entry.name),
    };
  });
}

export function matchupMultiplier(attackingType: string, defenderTypes: string[], resources: PokemonTypeResource[]): number {
  const attackResource = resourceFor(attackingType, resources);
  if (!attackResource) return 1;
  let multiplier = 1;
  for (const defenderType of defenderTypes) {
    const relations = attackResource.damage_relations;
    if (relationContains(relations.no_damage_to || [], defenderType)) return 0;
    if (relationContains(relations.double_damage_to || [], defenderType)) multiplier *= 2;
    if (relationContains(relations.half_damage_to || [], defenderType)) multiplier *= 0.5;
  }
  return multiplier;
}

export interface StatComparisonRow {
  stat: string;
  a: number;
  b: number;
  winner: "a" | "b" | "tie";
  difference: number;
}

export function compareBaseStats(a: Pokemon, b: Pokemon): StatComparisonRow[] {
  const mapB = new Map(b.stats.map((row) => [row.stat.name, row.base_stat]));
  return a.stats.map((row) => {
    const valueB = mapB.get(row.stat.name) ?? 0;
    const difference = Math.abs(row.base_stat - valueB);
    return {
      stat: row.stat.name,
      a: row.base_stat,
      b: valueB,
      winner: row.base_stat === valueB ? "tie" : row.base_stat > valueB ? "a" : "b",
      difference,
    };
  });
}

export function baseStatTotal(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, row) => sum + row.base_stat, 0);
}
