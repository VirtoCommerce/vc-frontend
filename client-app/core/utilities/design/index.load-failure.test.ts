import { afterEach, describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { loadDesignStyles, loadPresetStyles, mergeStyles } from "./index";

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

describe("mergeStyles with a failing chunk", () => {
  function deferred() {
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  }

  async function nextTimer(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
  }

  it("claims the earlier error before a zero-delay timer runs, while the later stylesheet loads", async () => {
    const earlierError = new Error("kit chunk failed");
    const later = deferred();
    const merged = mergeStyles({ mercury: () => Promise.reject(earlierError) }, { mercury: () => later.promise });
    let isSettled = false;
    const result = merged.mercury().finally(() => {
      isSettled = true;
    });

    await nextTimer();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledExactlyOnceWith(earlierError);
    expect(isSettled).toBe(false);

    later.resolve();

    await expect(result).rejects.toBe(earlierError);
  });

  it("starts the later stylesheet only after the earlier one settles", async () => {
    const earlier = deferred();
    const later = vi.fn(async () => undefined);
    const result = mergeStyles({ mercury: () => earlier.promise }, { mercury: later }).mercury();

    await nextTimer();

    expect(later).not.toHaveBeenCalled();

    earlier.reject(new Error("kit chunk failed"));

    await expect(result).rejects.toThrow("kit chunk failed");
    expect(later).toHaveBeenCalledOnce();
  });

  it("claims and logs both errors when both stylesheets fail", async () => {
    const earlierError = new Error("kit chunk failed");
    const laterError = new Error("app chunk failed");
    const styles = mergeStyles(
      { mercury: () => Promise.reject(earlierError) },
      { mercury: () => Promise.reject(laterError) },
    );

    await expect(loadPresetStyles("mercury", styles)).resolves.toBeUndefined();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledTimes(2);
    expect(ignoreChunkLoadFailure).toHaveBeenNthCalledWith(1, earlierError);
    expect(ignoreChunkLoadFailure).toHaveBeenNthCalledWith(2, laterError);
    expect(Logger.error).toHaveBeenCalledTimes(2);
    expect(Logger.error).toHaveBeenNthCalledWith(1, "Failed to load a stylesheet.", earlierError);
    expect(Logger.error).toHaveBeenNthCalledWith(2, "Failed to load the preset styles.", laterError);
  });

  it("claims the later error when only the later stylesheet fails", async () => {
    const laterError = new Error("app chunk failed");
    const styles = mergeStyles({ mercury: async () => undefined }, { mercury: () => Promise.reject(laterError) });

    await expect(loadPresetStyles("mercury", styles)).resolves.toBeUndefined();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledExactlyOnceWith(laterError);
  });
});
