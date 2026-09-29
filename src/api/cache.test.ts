import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CACHE_PREFIX,
  CACHE_TTL,
  MAX_LOCAL_CACHE_CHARS,
  clearPokedexCache,
  readLocalCache,
  writeLocalCache,
} from "./cache";

describe("persistent cache", () => {
  beforeEach(() => {
    localStorage.clear();
    clearPokedexCache();
    vi.useRealTimers();
  });

  it("reutiliza datos dentro de las 24 horas", () => {
    writeLocalCache("https://example.test/a", { value: 7 });
    expect(readLocalCache<{ value: number }>("https://example.test/a")).toEqual({ value: 7 });
  });

  it("descarta una entrada vencida", () => {
    const url = "https://example.test/old";
    localStorage.setItem(`${CACHE_PREFIX}${url}`, JSON.stringify({ savedAt: Date.now() - CACHE_TTL - 1, data: { value: 1 } }));
    expect(readLocalCache(url)).toBeNull();
    expect(localStorage.getItem(`${CACHE_PREFIX}${url}`)).toBeNull();
  });

  it("no persiste respuestas gigantes", () => {
    const url = "https://example.test/large";
    writeLocalCache(url, "x".repeat(MAX_LOCAL_CACHE_CHARS));
    expect(localStorage.getItem(`${CACHE_PREFIX}${url}`)).toBeNull();
  });
});
