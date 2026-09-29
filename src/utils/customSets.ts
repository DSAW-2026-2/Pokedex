import type { CompetitiveSet } from "../data/competitiveSets";

export type CustomSetMap = Record<string, CompetitiveSet>;

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function upsertCustomSet(map: CustomSetMap, pokemonName: string, set: CompetitiveSet): CustomSetMap {
  return { ...map, [normalizeName(pokemonName)]: { ...set, source: "custom" } };
}

export function removeCustomSet(map: CustomSetMap, pokemonName: string): CustomSetMap {
  const next = { ...map };
  delete next[normalizeName(pokemonName)];
  return next;
}

export function parseCustomSets(raw: string | null): CustomSetMap {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return value as CustomSetMap;
  } catch {
    return {};
  }
}
