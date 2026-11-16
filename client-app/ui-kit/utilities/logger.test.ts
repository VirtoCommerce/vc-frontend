import { afterEach, describe, expect, it, vi } from "vitest";
import { Logger, setLogger } from "./logger";

describe("ui-kit Logger", () => {
  afterEach(() => {
    setLogger(console);
    vi.restoreAllMocks();
  });

  it("logs to console until the app sets its logger", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    Logger.error("failed", 1);

    expect(consoleError).toHaveBeenCalledWith("failed", 1);
  });

  it("routes to the logger the app sets", () => {
    const appLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    setLogger(appLogger);

    Logger.warn("careful");

    expect(appLogger.warn).toHaveBeenCalledWith("careful");
  });
});
