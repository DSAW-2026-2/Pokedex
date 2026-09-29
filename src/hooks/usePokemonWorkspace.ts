import { useCallback, useEffect, useRef, useState } from "react";
import {
  filterTypeResultsBySpecial,
  getPokemonBundle,
  getSearchIndex,
  getSpecialIndex,
  searchByType,
} from "../api/pokeApi";
import type {
  PokemonBundle,
  RarityFilter,
  ResultItem,
  SearchMatch,
  StatusMessage,
} from "../types/pokemon";
import { deduplicateResults } from "../utils/pokemon";
import { resolveSearchQuery } from "../utils/search";
import { titleCase, typeLabel } from "../utils/text";

const INITIAL_VISIBLE_RESULTS = 7;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function usePokemonWorkspace() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("");
  const [status, setStatus] = useState<StatusMessage>({
    text: "Busca por nombre, número de Pokédex o usa los filtros.",
    kind: "info",
  });
  const [suggestions, setSuggestions] = useState<SearchMatch[]>([]);
  const [suggestionPrompt, setSuggestionPrompt] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [resultsTitle, setResultsTitle] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [visibleResults, setVisibleResults] = useState(INITIAL_VISIBLE_RESULTS);
  const [currentBundle, setCurrentBundle] = useState<PokemonBundle | null>(null);
  const [busy, setBusy] = useState(false);

  const searchController = useRef<AbortController | null>(null);
  const loadController = useRef<AbortController | null>(null);
  const filterController = useRef<AbortController | null>(null);

  const abortOperations = useCallback(() => {
    searchController.current?.abort();
    loadController.current?.abort();
    filterController.current?.abort();
  }, []);

  useEffect(() => () => abortOperations(), [abortOperations]);

  const loadPokemon = useCallback(async (
    identifier: string | number,
    correctionMessage = "",
    replaceResults = false,
  ): Promise<PokemonBundle | null> => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setBusy(true);
    setSuggestions([]);
    setSuggestionPrompt("");
    setStatus({ text: "Consultando Pokémon, especie y datos principales...", kind: "info" });

    try {
      const bundle = await getPokemonBundle(identifier, controller.signal);
      if (controller.signal.aborted) return null;
      setCurrentBundle(bundle);
      if (replaceResults) {
        setResults([{
          id: bundle.pokemon.id,
          name: bundle.pokemon.name,
          speciesId: bundle.species.id,
          isVariant: bundle.pokemon.id >= 10000,
        }]);
        setResultsTitle("Coincidencia");
        setVisibleResults(INITIAL_VISIBLE_RESULTS);
        setResultsVisible(true);
      }
      const rarity = bundle.species.is_mythical
        ? "Mítico"
        : bundle.species.is_legendary
          ? "Legendario"
          : "No legendario / no mítico";
      setStatus({
        text: correctionMessage || `${titleCase(bundle.pokemon.name)} cargado correctamente. Clasificación PokéAPI: ${rarity}.`,
        kind: correctionMessage ? "info" : "success",
      });
      return bundle;
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return null;
      setStatus({ text: error instanceof Error ? error.message : "Ocurrió un error inesperado.", kind: "error" });
      return null;
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);

  const handleTextSearch = useCallback(async (): Promise<string | null> => {
    searchController.current?.abort();
    loadController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setBusy(true);
    setSuggestions([]);
    setSuggestionPrompt("");
    setStatus({ text: "Preparando índice de nombres y revisando coincidencias...", kind: "info" });

    try {
      const searchIndex = await getSearchIndex(controller.signal);
      if (controller.signal.aborted) return null;
      const resolved = resolveSearchQuery(query, searchIndex);

      if (!resolved.identifier) {
        setSuggestions(resolved.suggestions);
        if (resolved.correction) {
          setSuggestionPrompt(`¿Quisiste decir ${titleCase(resolved.correction)}?`);
          setStatus({ text: `No encontramos “${query.trim()}” exactamente.`, kind: "info" });
        } else {
          setSuggestions([]);
          setSuggestionPrompt("");
          setStatus({ text: `No encontramos un Pokémon llamado “${query.trim()}”. Revisa cómo está escrito.`, kind: "error" });
        }
        return null;
      }

      setSuggestions([]);
      setSuggestionPrompt("");
      const bundle = await loadPokemon(resolved.identifier, "", true);
      return bundle?.pokemon.name || null;
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return null;
      setStatus({ text: error instanceof Error ? error.message : "No fue posible realizar la búsqueda.", kind: "error" });
      return null;
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, [loadPokemon, query]);

  const applyFilters = useCallback(async (nextType = typeFilter, nextRarity = rarityFilter) => {
    if (!nextType && !nextRarity) {
      setResults([]);
      setResultsTitle("");
      setResultsVisible(false);
      setStatus({ text: query.trim() ? "Pulsa Buscar para consultar ese Pokémon." : "Busca un Pokémon o selecciona un filtro.", kind: "info" });
      return;
    }

    filterController.current?.abort();
    const controller = new AbortController();
    filterController.current = controller;
    setBusy(true);
    setSuggestions([]);
    setStatus({ text: "Consultando filtros...", kind: "info" });

    try {
      let nextResults: ResultItem[] = [];
      const titleParts: string[] = [];

      if (nextType) {
        nextResults = await searchByType(nextType, controller.signal);
        titleParts.push(`Tipo ${typeLabel(nextType)}`);
      }

      if (nextRarity) {
        titleParts.push(nextRarity === "legendary" ? "Legendarios" : "Míticos");
        if (nextType) {
          nextResults = await filterTypeResultsBySpecial(nextResults, nextRarity, controller.signal);
        } else {
          nextResults = getSpecialIndex(nextRarity);
        }
      }

      if (controller.signal.aborted) return;
      const cleaned = deduplicateResults(nextResults);
      setResults(cleaned);
      setVisibleResults(INITIAL_VISIBLE_RESULTS);
      setResultsTitle(titleParts.join(" · "));
      setResultsVisible(true);
      setStatus({
        text: cleaned.length ? `Se encontraron ${cleaned.length} resultados.` : "No hay resultados con esa combinación de filtros.",
        kind: cleaned.length ? "success" : "info",
      });
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return;
      setStatus({ text: error instanceof Error ? error.message : "No fue posible aplicar los filtros.", kind: "error" });
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, [query, rarityFilter, typeFilter]);

  const clearAll = useCallback(() => {
    abortOperations();
    setQuery("");
    setTypeFilter("");
    setRarityFilter("");
    setSuggestions([]);
    setSuggestionPrompt("");
    setResults([]);
    setResultsTitle("");
    setResultsVisible(false);
    setVisibleResults(INITIAL_VISIBLE_RESULTS);
    setCurrentBundle(null);
    setBusy(false);
    setStatus({ text: "Búsqueda y ficha limpiadas. Puedes iniciar una nueva consulta.", kind: "info" });
  }, [abortOperations]);

  const showMore = useCallback(() => setVisibleResults((value) => value + INITIAL_VISIBLE_RESULTS), []);

  return {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    rarityFilter,
    setRarityFilter,
    status,
    suggestions,
    suggestionPrompt,
    results,
    resultsTitle,
    resultsVisible,
    visibleResults,
    currentBundle,
    busy,
    handleTextSearch,
    applyFilters,
    loadPokemon,
    clearAll,
    showMore,
  };
}
