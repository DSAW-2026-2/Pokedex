import { useCallback, useEffect, useMemo, useState } from "react";
import type { PokemonBundle, ResultItem } from "../types/pokemon";

const STORAGE_KEY = "pokecheck:favorites:v1";

function readFavorites(): ResultItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResultItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.name === "string" && typeof item.id === "number") : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<ResultItem[]>(readFavorites);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // LocalStorage puede estar bloqueado; la sesión sigue funcionando en memoria.
    }
  }, [favorites]);

  const favoriteNames = useMemo(() => new Set(favorites.map((item) => item.name)), [favorites]);

  const isFavorite = useCallback((name: string) => favoriteNames.has(name), [favoriteNames]);

  const toggleFavorite = useCallback((bundle: PokemonBundle) => {
    const nextItem: ResultItem = {
      id: bundle.pokemon.id,
      name: bundle.pokemon.name,
      speciesId: bundle.species.id,
      isVariant: bundle.pokemon.id >= 10000,
    };
    setFavorites((current) => current.some((item) => item.name === nextItem.name)
      ? current.filter((item) => item.name !== nextItem.name)
      : [...current, nextItem].sort((a, b) => (a.speciesId || a.id) - (b.speciesId || b.id)));
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return { favorites, isFavorite, toggleFavorite, clearFavorites };
}
