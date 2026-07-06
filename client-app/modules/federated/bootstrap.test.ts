import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { initFederatedModulesMock, loggerErrorMock, loggerWarnMock } = vi.hoisted(() => ({
  initFederatedModulesMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  loggerWarnMock: vi.fn(),
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: loggerErrorMock, warn: loggerWarnMock, info: vi.fn(), debug: vi.fn() },
}));

async function loadBootstrap() {
  return await import("./bootstrap");
}

describe("startFederatedModules", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doMock("./index", () => ({ initFederatedModules: initFederatedModulesMock }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("./index");
  });

  it.each([undefined, "", "false", "0"])("is a no-op when APP_MODULES_FEDERATION_ENABLED is %j", async (value) => {
    if (value !== undefined) {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", value);
    }
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(initFederatedModulesMock).not.toHaveBeenCalled();
  });

  it("runs the loader when APP_MODULES_FEDERATION_ENABLED is enabled", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(initFederatedModulesMock).toHaveBeenCalledOnce();
  });

  it("resolves (never rejects) when the loader chunk fails to load", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    vi.doMock("./index", () => {
      throw new Error("chunk load error");
    });
    const { startFederatedModules } = await loadBootstrap();

    await expect(startFederatedModules()).resolves.toBeUndefined();
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("failed to start"), expect.anything());
  });

  it("resolves (never rejects) when the loader itself rejects", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    initFederatedModulesMock.mockRejectedValue(new Error("unexpected"));
    const { startFederatedModules } = await loadBootstrap();

    await expect(startFederatedModules()).resolves.toBeUndefined();
    expect(loggerErrorMock).toHaveBeenCalled();
  });

  it("stops waiting at the aggregate boot budget when the loader hangs (boot proceeds)", async () => {
    vi.useFakeTimers();
    try {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      // Per-phase budgets are bypassed here on purpose: this simulates their WORST-CASE
      // chaining (manifest ok + slow load + hung init), which only the aggregate cap bounds.
      initFederatedModulesMock.mockImplementation(() => new Promise(() => {}));
      const { startFederatedModules } = await loadBootstrap();

      const boot = startFederatedModules();
      await vi.advanceTimersByTimeAsync(10_000);

      await expect(boot).resolves.toBeUndefined();
      expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("boot budget"));
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not log a budget warning when the loader settles in time", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    initFederatedModulesMock.mockResolvedValue({ loaded: ["news"], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(loggerWarnMock).not.toHaveBeenCalled();
  });
});
