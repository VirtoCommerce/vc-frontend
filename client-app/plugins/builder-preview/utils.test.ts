import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getBuilderOrigin", () => {
  beforeEach(() => {
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("ignores the endpoint when the preview is not in a frame", async () => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F");

    const { getBuilderOrigin } = await import("./utils");

    expect(getBuilderOrigin()).toBeUndefined();
  });

  it("uses only the HTTP endpoint origin", async () => {
    window.history.replaceState(null, "", "/?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F");

    const { getBuilderOrigin } = await import("./utils");

    expect(getBuilderOrigin()).toBe("https://builder.example");
  });

  it.each(["not-a-url", "javascript:alert(1)", "file:///tmp/builder"])(
    "rejects an invalid endpoint: %s",
    async (endpoint) => {
      window.history.replaceState(null, "", `/?ep=${encodeURIComponent(endpoint)}`);

      const { getBuilderOrigin } = await import("./utils");

      expect(getBuilderOrigin()).toBeUndefined();
      vi.resetModules();
    },
  );
});
