import { afterEach, describe, expect, it, vi } from "vitest";
import { createId } from "./utils";

describe("createId", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gives a different id every time", () => {
    expect(createId()).not.toBe(createId());
  });

  it("still gives a unique id where randomUUID does not exist", () => {
    vi.stubGlobal("crypto", { getRandomValues: crypto.getRandomValues.bind(crypto) });

    const first = createId();

    expect(first).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(createId()).not.toBe(first);
  });
});
