import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities/logger";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { loadDesignStyles } from "./index";

vi.mock("@/core/utilities/logger", () => ({ Logger: { error: vi.fn() } }));
vi.mock("@/core/utilities/optional-chunk", () => ({ ignoreChunkLoadFailure: vi.fn() }));

describe("loadDesignStyles with a failing chunk", () => {
  it("resolves and claims the error when the design's chunk fails", async () => {
    const error = new Error("mybrand chunk failed");

    await expect(loadDesignStyles("mybrand", { mybrand: () => Promise.reject(error) })).resolves.toBeUndefined();

    expect(ignoreChunkLoadFailure).toHaveBeenCalledExactlyOnceWith(error);
    expect(Logger.error).toHaveBeenCalledExactlyOnceWith(expect.any(String), error);
  });
});
