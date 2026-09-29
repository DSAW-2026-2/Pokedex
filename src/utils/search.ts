import type { SearchIndexItem, SearchMatch, SearchResolution } from "../types/pokemon";
import { compactText } from "./text";

export function levenshtein(a: string, b: string): number {
  const s = compactText(a);
  const t = compactText(b);
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;

  const prev = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < current.length; j += 1) prev[j] = current[j];
  }
  return prev[t.length];
}

export function getFuzzyMatches(query: string, items: SearchIndexItem[], limit = 6): SearchMatch[] {
  const q = compactText(query);
  if (!q) return [];

  return items
    .map((item) => {
      const candidate = compactText(item.name);
      const distance = levenshtein(q, candidate);
      const maxLength = Math.max(q.length, candidate.length) || 1;
      let score = 1 - distance / maxLength;
      if (candidate.startsWith(q) || q.startsWith(candidate)) score += 0.12;
      if (candidate.includes(q) || q.includes(candidate)) score += 0.08;
      return { ...item, distance, score };
    })
    .sort((a, b) => b.score - a.score || a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function acceptableTypo(query: string, match?: SearchMatch): boolean {
  const length = compactText(query).length;
  const threshold = Math.min(3, Math.max(1, Math.ceil(length * 0.4)));
  return Boolean(match && match.distance <= threshold && match.score >= 0.5);
}

export function isDexNumber(value: string): boolean {
  const compact = String(value).replace(/\s+/g, "");
  return /^#?\d+$/.test(compact);
}

export function parseDexNumber(value: string): number {
  return Number(String(value).replace(/[^0-9]/g, ""));
}

export function resolveSearchQuery(rawQuery: string, searchIndex: SearchIndexItem[]): SearchResolution {
  const query = String(rawQuery || "");
  const compact = compactText(query);
  if (!compact) throw new Error("Escribe un nombre o número de Pokédex.");

  if (isDexNumber(query)) {
    const id = parseDexNumber(query);
    if (!id) throw new Error("El número de Pokédex no es válido.");
    return { identifier: id, correction: null, suggestions: [] };
  }

  const exact = searchIndex.find((item) => compactText(item.name) === compact);
  if (exact) return { identifier: exact.name, correction: null, suggestions: [] };

  const matches = getFuzzyMatches(query, searchIndex, 6);
  const best = matches[0];
  if (acceptableTypo(query, best)) {
    return {
      identifier: null,
      correction: best.name,
      suggestions: best ? [best] : [],
    };
  }

  return { identifier: null, correction: null, suggestions: matches };
}
