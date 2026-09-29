import { useCallback, useEffect, useState } from "react";
import type { CompetitiveSet } from "../data/competitiveSets";
import { parseCustomSets, removeCustomSet, upsertCustomSet, type CustomSetMap } from "../utils/customSets";

const STORAGE_KEY = "pokecheck:custom-competitive-sets:v1";

export function useCustomCompetitiveSets() {
  const [sets, setSets] = useState<CustomSetMap>(() => {
    if (typeof window === "undefined") return {};
    return parseCustomSets(window.localStorage.getItem(STORAGE_KEY));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  }, [sets]);

  const get = useCallback((pokemonName: string) => sets[pokemonName.trim().toLowerCase()], [sets]);

  const save = useCallback((pokemonName: string, set: CompetitiveSet) => {
    setSets((current) => upsertCustomSet(current, pokemonName, set));
  }, []);

  const remove = useCallback((pokemonName: string) => {
    setSets((current) => removeCustomSet(current, pokemonName));
  }, []);

  return { sets, get, save, remove };
}
