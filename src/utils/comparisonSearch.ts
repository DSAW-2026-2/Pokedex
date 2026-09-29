import type { SearchIndexItem, SearchMatch } from "../types/pokemon";
import { compactText } from "./text";
import { getFuzzyMatches, isDexNumber, parseDexNumber, resolveSearchQuery } from "./search";

export interface ComparisonResolution {
  name: string | null;
  suggestions: SearchMatch[];
  correction: string | null;
}

export function getComparisonSuggestions(
  query: string,
  searchIndex: SearchIndexItem[],
  limit = 5,
): SearchMatch[] {
  const compact = compactText(query);
  if (compact.length < 2) return [];

  const prefix = searchIndex
    .filter((item) => compactText(item.name).startsWith(compact))
    .map((item) => ({ ...item, distance: 0, score: 2 }))
    .slice(0, limit);

  if (prefix.length >= limit) return prefix;

  const fuzzy = getFuzzyMatches(query, searchIndex, limit * 2)
    .filter((item) => item.score >= 0.45 && !prefix.some((row) => row.name === item.name));

  return [...prefix, ...fuzzy].slice(0, limit);
}

export function resolveComparisonName(
  query: string,
  searchIndex: SearchIndexItem[],
): ComparisonResolution {
  if (isDexNumber(query)) {
    const id = parseDexNumber(query);
    const byId = searchIndex.find((item) => item.id === id && item.kind === "species")
      || searchIndex.find((item) => item.id === id);
    return { name: byId?.name || null, suggestions: [], correction: null };
  }

  const resolved = resolveSearchQuery(query, searchIndex);
  return {
    name: typeof resolved.identifier === "string" ? resolved.identifier : null,
    suggestions: resolved.suggestions.length
      ? resolved.suggestions
      : getComparisonSuggestions(query, searchIndex),
    correction: resolved.correction,
  };
}
