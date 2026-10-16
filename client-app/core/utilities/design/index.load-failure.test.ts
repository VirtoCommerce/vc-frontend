import { beforeEach, describe, expect, it, vi } from "vitest";

const loadedStyles = vi.hoisted((): string[] => []);

vi.mock("@/core/utilities/logger", () => ({ Logger: { error: vi.fn() } }));
vi.mock("@/core/utilities/optional-chunk", () => ({ ignoreChunkLoadFailure: vi.fn() }));

type ChunkType = "kit" | "app";

async function loadWithFailing(failing: ChunkType[]) {
  const chunk = (name: ChunkType) => () => {
    if (failing.includes(name)) {
      throw new Error(`${name} chunk failed`);
    }

    loadedStyles.push(name);
    return {};
  };

  vi.doMock("@/ui-kit/styles/soft/index.scss", chunk("kit"));
  vi.doMock("@/assets/styles/soft/index.scss", chunk("app"));

  const { loadDesignStyles } = await import("./index");
  const { Logger } = await import("@/core/utilities/logger");
  const { ignoreChunkLoadFailure } = await import("@/core/utilities/optional-chunk");

  await expect(loadDesignStyles("soft")).resolves.toBeUndefined();

  return { Logger, ignoreChunkLoadFailure };
}

describe("loadDesignStyles with failing chunks", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    loadedStyles.length = 0;
  });

  it("resolves, still loads the other chunk and claims the failure", async () => {
    const { Logger, ignoreChunkLoadFailure } = await loadWithFailing(["kit"]);

    expect(loadedStyles).toEqual(["app"]);
    expect(ignoreChunkLoadFailure).toHaveBeenCalledTimes(1);
    expect(Logger.error).toHaveBeenCalledTimes(1);
  });

  it("resolves and claims each failure when both chunks fail", async () => {
    const { Logger, ignoreChunkLoadFailure } = await loadWithFailing(["kit", "app"]);

    expect(loadedStyles).toEqual([]);
    expect(ignoreChunkLoadFailure).toHaveBeenCalledTimes(2);
    expect(Logger.error).toHaveBeenCalledTimes(2);
  });
});
