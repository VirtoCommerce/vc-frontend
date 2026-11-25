import { describe, expect, it } from "vitest";
import { createLruCache } from "./lru-cache";

describe("createLruCache", () => {
  it("drops the entry used least recently once full, a read counting as a use", () => {
    const cache = createLruCache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a");
    cache.set("c", 3);

    expect([cache.has("a"), cache.has("b"), cache.has("c")]).toEqual([true, false, true]);
  });

  it("replaces a value without dropping another", () => {
    const cache = createLruCache<string, number>(2);

    for (const [key, value] of [
      ["a", 1],
      ["b", 2],
      ["a", 3],
    ] as const) {
      cache.set(key, value);
    }

    expect([cache.get("a"), cache.get("b")]).toEqual([3, 2]);
  });

  it("holds an undefined value apart from a missing one", () => {
    const cache = createLruCache<string, number | undefined>(2);

    cache.set("a", undefined);

    expect([cache.has("a"), cache.has("b")]).toEqual([true, false]);
  });
});
