import { afterEach, describe, expect, it } from "vitest";
import {
  isStorageAvailable,
  readJSON,
  removeItem,
  storageKey,
  writeJSON,
} from "@/lib/storage";

function installFakeWindowStorage(storage: Storage | (() => never)): void {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value:
      typeof storage === "function"
        ? {
            get localStorage() {
              return storage();
            },
          }
        : { localStorage: storage },
  });
}

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("lib/storage", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "window");
  });

  it("builds namespaced keys", () => {
    expect(storageKey("taxo-bingo", "stats")).toBe("biogames:taxo-bingo:stats");
  });

  it("reads, writes, validates, and removes JSON with a fake localStorage", () => {
    const store = createMemoryStorage();
    installFakeWindowStorage(store);

    expect(isStorageAvailable()).toBe(true);
    const key = storageKey("taxo-bingo", "prefs");
    expect(writeJSON(key, { hard: true })).toBe(true);
    expect(readJSON(key, { hard: false })).toEqual({ hard: true });

    // Fails custom type guard -> returns fallback
    expect(
      readJSON(
        key,
        { hard: false },
        (v): v is { hard: boolean } =>
          typeof v === "object" && v !== null && (v as { hard?: unknown }).hard === false
      )
    ).toEqual({ hard: false });

    removeItem(key);
    expect(readJSON(key, { hard: false })).toEqual({ hard: false });
  });

  it("returns fallback when JSON is corrupted or storage throws", () => {
    const store = createMemoryStorage();
    installFakeWindowStorage(store);
    store.setItem("corrupt", "{not-valid-json");
    expect(readJSON("corrupt", 42)).toBe(42);

    installFakeWindowStorage(() => {
      throw new Error("SecurityError: storage disabled");
    });
    expect(isStorageAvailable()).toBe(false);
    expect(writeJSON("k", { a: 1 })).toBe(false);
    expect(readJSON("k", "fallback")).toBe("fallback");
    expect(() => removeItem("k")).not.toThrow();
  });
});
