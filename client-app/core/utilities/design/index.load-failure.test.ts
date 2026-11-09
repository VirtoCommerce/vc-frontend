import { afterEach, describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { loadDesignStyles, loadPresetStyles } from "./index";

vi.mock("@/core/utilities/logger", () => ({ Logger: { error: vi.fn() } }));
vi.mock("@/core/utilities/optional-chunk", () => ({ ignoreChunkLoadFailure: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe("loadDesignStyles with a failing chunk", () => {
  it("resolves and claims the error when the design's chunk fails", async () => {
    const error = new Error("mybrand chunk failed");

    await expect(loadDesignStyles("mybrand", { mybrand: () => Promise.reject(error) })).resolves.toBeUndefined();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledExactlyOnceWith(error);
    expect(Logger.error).toHaveBeenCalledExactlyOnceWith(expect.any(String), error);
  });
});

describe("loadPresetStyles with a failing chunk", () => {
  it("resolves and claims the error when the preset's chunk fails", async () => {
    const error = new Error("mercury chunk failed");

    await expect(loadPresetStyles("mercury", { mercury: () => Promise.reject(error) })).resolves.toBeUndefined();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledExactlyOnceWith(error);
    expect(Logger.error).toHaveBeenCalledExactlyOnceWith("Failed to load the preset styles.", error);
  });
});
