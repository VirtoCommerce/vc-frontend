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

  it("stops waiting at the boot backstop when the loader hangs (boot proceeds)", async () => {
    vi.useFakeTimers();
    try {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      // Simulates an inner-budget malfunction (the loader never settles) — the one
      // in-loader case the backstop exists for.
      initFederatedModulesMock.mockImplementation(() => new Promise(() => {}));
      const { startFederatedModules } = await loadBootstrap();

      const boot = startFederatedModules();
      await vi.advanceTimersByTimeAsync(20_000);

      await expect(boot).resolves.toBeUndefined();
      expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("boot backstop"));
    } finally {
      vi.useRealTimers();
    }
  });

  it("logs a loader-chunk failure even when it happens AFTER the backstop fired", async () => {
    vi.useFakeTimers();
    try {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      // Chunk fetch stalls past the backstop, then errors: the failure must still be
      // logged — otherwise the backstop's "late plugins" warning is the only (and
      // misleading) signal for a loader that actually died.
      vi.doMock(
        "./index",
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error("chunk error after backstop")), 25_000);
          }),
      );
      const { startFederatedModules } = await loadBootstrap();

      const boot = startFederatedModules();
      await vi.advanceTimersByTimeAsync(20_000);
      await expect(boot).resolves.toBeUndefined();
      expect(loggerErrorMock).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(5_000);
      expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("failed to start"), expect.anything());
    } finally {
      vi.useRealTimers();
    }
  });

  it("bounds a hanging loader-chunk import at the backstop (timer starts before the import)", async () => {
    vi.useFakeTimers();
    try {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      // A stalled (never-settling) chunk fetch: the import promise neither resolves nor rejects.
      vi.doMock("./index", () => new Promise(() => {}));
      const { startFederatedModules } = await loadBootstrap();

      const boot = startFederatedModules();
      await vi.advanceTimersByTimeAsync(20_000);

      await expect(boot).resolves.toBeUndefined();
      expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("boot backstop"));
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not log a backstop warning when the loader settles in time (timer is cleared)", async () => {
    vi.useFakeTimers();
    try {
      vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
      initFederatedModulesMock.mockResolvedValue({ loaded: ["news"], failed: [], skipped: [] });
      const { startFederatedModules } = await loadBootstrap();

      await startFederatedModules();
      // Advance PAST the backstop: a leaked (uncleared) timer would fire its
      // misleading warning long after a perfectly normal boot.
      await vi.advanceTimersByTimeAsync(20_000);

      expect(loggerWarnMock).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
  it("does not fetch the plugin list when the flag is off", async () => {
    const fetchPlugins = vi.fn();
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins });

    expect(fetchPlugins).not.toHaveBeenCalled();
  });

  it("passes the fetched plugin list to the loader", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const plugins = [{ id: "VirtoCommerce.SalesRep" }];
    const hasPermission = vi.fn();
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.resolve(plugins), hasPermission });

    expect(initFederatedModulesMock).toHaveBeenCalledWith({ plugins, hasPermission });
  });

  it("degrades to no plugins when the plugin list cannot be read", async () => {
    vi.stubEnv("APP_MODULES_FEDERATION_ENABLED", "true");
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.reject(new Error("no such field")) });

    expect(initFederatedModulesMock).toHaveBeenCalledWith({ plugins: undefined, hasPermission: undefined });
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("plugin list"), expect.anything());
  });
});
