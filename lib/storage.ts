function getLocalStorage(): Storage | null {
  if (typeof globalThis.window === "undefined") {
    return null;
  }
  try {
    return globalThis.window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function storageKey(gameSlug: string, key: string): string {
  return `biogames:${gameSlug}:${key}`;
}

export function isStorageAvailable(): boolean {
  const store = getLocalStorage();
  if (!store) return false;
  try {
    const testKey = "__biogames_storage_test__";
    store.setItem(testKey, "1");
    store.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function readJSON<T>(
  key: string,
  fallback: T,
  isValid?: (v: unknown) => v is T
): T {
  const store = getLocalStorage();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  const store = getLocalStorage();
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  const store = getLocalStorage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore storage removal errors
  }
}
