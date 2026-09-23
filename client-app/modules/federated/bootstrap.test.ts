import { flushPromises } from "@vue/test-utils";
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
    // prepare + load behave as the old single init as far as these cases go: whatever the mock
    // does is what boot waits for.
    vi.doMock("./index", () => ({
      prepareFederatedModules: (options: unknown) => Promise.resolve({ options }),
      loadPreparedModules: ({ options }: { options: unknown }) => {
        const run = Promise.resolve().then(() => initFederatedModulesMock(options));
        return { blocking: run.then(() => undefined), all: run.catch(() => undefined) };
      },
    }));
    // The stock theme ships the switch OFF, so every case below that exercises the loader has to
    // turn it on; the two cases that read the shipped config say so in their own names.
    stubThemeSettings({ module_federation_enabled: true });
  });

  afterEach(() => {
    vi.doUnmock("./index");
    vi.doUnmock("@/config/settings_data.json");
  });

  function stubThemeSettings(settings: Record<string, unknown>) {
    vi.doMock("@/config/settings_data.json", () => ({ default: { current: "default", settings } }));
  }

  it("runs the loader when the theme enables federation", async () => {
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(initFederatedModulesMock).toHaveBeenCalledOnce();
  });

  it("is a no-op when the theme sets module_federation_enabled to false", async () => {
    stubThemeSettings({ module_federation_enabled: false });
    const fetchPlugins = vi.fn();
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins });

    expect(initFederatedModulesMock).not.toHaveBeenCalled();
    expect(fetchPlugins).not.toHaveBeenCalled();
  });

  // Reads client-app/config/settings_data.json itself: the shipped theme must stay a no-op until
  // the Sales Rep Hub plugin is released, so nobody pays the MF runtime for a plugin nobody serves.
  it("is a no-op with the theme config as shipped", async () => {
    vi.doUnmock("@/config/settings_data.json");
    vi.resetModules();
    const fetchPlugins = vi.fn();
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins });

    expect(initFederatedModulesMock).not.toHaveBeenCalled();
    expect(fetchPlugins).not.toHaveBeenCalled();
  });

  it("treats a theme without the module_federation_enabled key as enabled", async () => {
    stubThemeSettings({});
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(initFederatedModulesMock).toHaveBeenCalledOnce();
  });

  it("resolves (never rejects) when the loader chunk fails to load", async () => {
    vi.doMock("./index", () => {
      throw new Error("chunk load error");
    });
    const { startFederatedModules } = await loadBootstrap();

    await expect(startFederatedModules()).resolves.toBeUndefined();
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("failed to start"), expect.anything());
  });

  it("resolves (never rejects) when the loader itself rejects", async () => {
    initFederatedModulesMock.mockRejectedValue(new Error("unexpected"));
    const { startFederatedModules } = await loadBootstrap();

    await expect(startFederatedModules()).resolves.toBeUndefined();
    expect(loggerErrorMock).toHaveBeenCalled();
  });

  it("stops waiting at the boot backstop when the loader hangs (boot proceeds)", async () => {
    vi.useFakeTimers();
    try {
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
      initFederatedModulesMock.mockResolvedValue({ loaded: ["news"], failed: [], skipped: [] });
      const { startFederatedModules } = await loadBootstrap();

      await startFederatedModules();
      // Advance PAST the backstop: a leaked (uncleared) timer would fire its
      // misleading warning long after a perfectly normal boot.
      await vi.advanceTimersByTimeAsync(20_000);

      expect(loggerWarnMock).not.toHaveBeenCalledWith(expect.stringContaining("boot backstop"));
    } finally {
      vi.useRealTimers();
    }
  });

  // The shape a fork can land on when resolving the app-runner merge; without a line it disables
  // platform discovery in silence.
  it("warns when it is started without a plugin-list source", async () => {
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules();

    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("no plugin-list source"));
    expect(initFederatedModulesMock).toHaveBeenCalledWith(expect.objectContaining({ plugins: undefined }));
  });

  it("passes the fetched plugin list to the loader", async () => {
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const plugins = [{ id: "VirtoCommerce.SalesRep" }];
    const hasPermission = vi.fn();
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.resolve(plugins), hasPermission });

    expect(initFederatedModulesMock).toHaveBeenCalledWith({ plugins, hasPermission });
  });

  it("degrades to no plugins when the plugin list cannot be read", async () => {
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.reject(new Error("no such field")) });

    expect(initFederatedModulesMock).toHaveBeenCalledWith({ plugins: undefined, hasPermission: undefined });
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("plugin list"), expect.anything());
  });
  it("budgets the plugin list, so a stalled discovery query cannot eat the boot backstop", async () => {
    initFederatedModulesMock.mockResolvedValue({ loaded: [], failed: [], skipped: [] });
    const { startFederatedModules, DISCOVERY_TIMEOUT_MS } = await loadBootstrap();
    vi.useFakeTimers();
    try {
      // Never settles - the cold-backend case the backstop used to absorb.
      const started = startFederatedModules({ fetchPlugins: () => new Promise(() => {}) });
      await vi.advanceTimersByTimeAsync(DISCOVERY_TIMEOUT_MS);
      await started;
    } finally {
      vi.useRealTimers();
    }

    expect(initFederatedModulesMock).toHaveBeenCalledWith(expect.objectContaining({ plugins: undefined }));
    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("did not answer within"));
  });
});

describe("startFederatedModules with declared plugins", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.doMock("@/config/settings_data.json", () => ({
      default: { current: "default", settings: { module_federation_enabled: true } },
    }));
  });

  afterEach(() => {
    vi.doUnmock("./index");
    vi.doUnmock("@/config/settings_data.json");
    vi.doUnmock("@/core/globals");
  });

  function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    return { promise, resolve };
  }

  function stubLoader(blocking: Promise<void>, all: Promise<unknown>) {
    const prepare = vi.fn(() => Promise.resolve({}));
    vi.doMock("./index", () => ({
      prepareFederatedModules: prepare,
      loadPreparedModules: () => ({ blocking, all }),
    }));
    return prepare;
  }

  it("does not wait for a declared plugin's code", async () => {
    stubLoader(Promise.resolve(), new Promise(() => {}));
    const { startFederatedModules } = await loadBootstrap();

    await expect(startFederatedModules({ fetchPlugins: () => Promise.resolve([]) })).resolves.toBeUndefined();
  });

  it("waits for the plugins that declared nothing, as before", async () => {
    const blocking = deferred();
    stubLoader(blocking.promise, new Promise(() => {}));
    const { startFederatedModules } = await loadBootstrap();

    let settled = false;
    const started = startFederatedModules({ fetchPlugins: () => Promise.resolve([]) }).then(() => {
      settled = true;
    });
    await flushPromises();
    expect(settled).toBe(false);

    blocking.resolve();
    await started;
    expect(settled).toBe(true);
  });

  it("hands the condition context to the preparation", async () => {
    const prepare = stubLoader(Promise.resolve(), Promise.resolve());
    const conditionContext = { setting: vi.fn(), themeSetting: vi.fn(), isAuthenticated: true, can: vi.fn() };
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.resolve([]), conditionContext });

    expect(prepare).toHaveBeenCalledWith(expect.objectContaining({ conditionContext }));
  });

  it("follows the current URL once every plugin settled, when it now matches a route that was missing", async () => {
    const replace = vi.fn(() => Promise.resolve());
    const router = {
      currentRoute: {
        value: {
          name: "Matcher",
          path: "/company/late",
          query: {},
          hash: "",
          fullPath: "/company/late",
          matched: [{}],
        },
      },
      resolve: vi.fn(() => ({ name: "LatePage" })),
      replace,
    };
    vi.doMock("@/core/globals", () => ({ globals: { router } }));
    const all = deferred();
    stubLoader(Promise.resolve(), all.promise);
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.resolve([]) });
    expect(replace).not.toHaveBeenCalled();

    all.resolve();
    await flushPromises();

    expect(replace).toHaveBeenCalledWith({ path: "/company/late", query: {}, hash: "", force: true });
  });

  it("leaves the URL alone when it still resolves to the same route", async () => {
    const replace = vi.fn();
    const router = {
      currentRoute: { value: { name: "Home", path: "/", query: {}, hash: "", fullPath: "/", matched: [{}] } },
      resolve: vi.fn(() => ({ name: "Home" })),
      replace,
    };
    vi.doMock("@/core/globals", () => ({ globals: { router } }));
    stubLoader(Promise.resolve(), Promise.resolve());
    const { startFederatedModules } = await loadBootstrap();

    await startFederatedModules({ fetchPlugins: () => Promise.resolve([]) });
    await flushPromises();

    expect(replace).not.toHaveBeenCalled();
  });
});
