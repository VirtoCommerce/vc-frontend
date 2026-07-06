import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { initFederatedModulesMock, loggerErrorMock } = vi.hoisted(() => ({
  initFederatedModulesMock: vi.fn(),
  loggerErrorMock: vi.fn(),
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: loggerErrorMock, warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
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
});
