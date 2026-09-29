export const CACHE_TTL = 24 * 60 * 60 * 1000;
export const MAX_LOCAL_CACHE_CHARS = 300_000;
export const CACHE_PREFIX = "pokedex-async:";

const memoryCache = new Map<string, unknown>();

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readMemoryCache<T>(url: string): T | null {
  return memoryCache.has(url) ? (memoryCache.get(url) as T) : null;
}

export function writeMemoryCache<T>(url: string, data: T): void {
  memoryCache.set(url, data);
}

export function readLocalCache<T>(url: string): T | null {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${url}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; data?: T };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > CACHE_TTL) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${url}`);
      return null;
    }
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writeLocalCache<T>(url: string, data: T): void {
  if (!canUseLocalStorage()) return;
  try {
    const serialized = JSON.stringify({ savedAt: Date.now(), data });
    if (serialized.length < MAX_LOCAL_CACHE_CHARS) {
      window.localStorage.setItem(`${CACHE_PREFIX}${url}`, serialized);
    }
  } catch {
    // La aplicación sigue funcionando aunque localStorage esté bloqueado o lleno.
  }
}

export function clearPokedexCache(): void {
  memoryCache.clear();
  if (!canUseLocalStorage()) return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // No-op.
  }
}
