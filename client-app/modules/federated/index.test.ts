import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFederatedModules } from "./index";

interface IRouterStub {
  addRoute: (...args: unknown[]) => unknown;
  hasRoute: (name: unknown) => boolean;
}

const { loadRemoteMock, registerRemotesMock, loggerErrorMock, loggerWarnMock, loggerInfoMock, globalsMock } =
  vi.hoisted(() => {
    const hostGlobals: { router?: IRouterStub } = {};
    return {
      loadRemoteMock: vi.fn(),
      registerRemotesMock: vi.fn(),
      loggerErrorMock: vi.fn(),
      loggerWarnMock: vi.fn(),
      loggerInfoMock: vi.fn(),
      globalsMock: hostGlobals,
    };
  });

vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: loadRemoteMock,
  registerRemotes: registerRemotesMock,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: loggerErrorMock, warn: loggerWarnMock, info: loggerInfoMock, debug: vi.fn() },
}));

vi.mock("@/core-api/package.json", () => ({ version: "1.4.0" }));

vi.mock("@/core/globals", () => ({ globals: globalsMock }));

const REMOTE_URL = "https://plugins.example.com/news/mf-manifest.json";

function stubRemotesEnv(remotes: unknown): void {
  vi.stubEnv("APP_MODULES_FEDERATION_REMOTES", typeof remotes === "string" ? remotes : JSON.stringify(remotes));
}

// A manifest the host accepts by default; tests that care override it explicitly.
const COMPATIBLE_MANIFEST = { metaData: { requiredHostVersion: "^1.0.0" } };

function stubManifestFetch(
  manifest: unknown = COMPATIBLE_MANIFEST,
  init?: { ok?: boolean; status?: number },
): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: () => Promise.resolve(manifest),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("initFederatedModules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    delete globalsMock.router;
  });

  it("is a no-op when APP_MODULES_FEDERATION_REMOTES is not set", async () => {
    const fetchMock = stubManifestFetch();
    vi.stubEnv("APP_MODULES_FEDERATION_REMOTES", "");

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(registerRemotesMock).not.toHaveBeenCalled();
  });

  it("ignores invalid JSON in APP_MODULES_FEDERATION_REMOTES", async () => {
    stubManifestFetch();
    stubRemotesEnv("{not json");

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("not valid JSON"), expect.anything());
  });

  it("ignores a non-object APP_MODULES_FEDERATION_REMOTES value", async () => {
    stubManifestFetch();
    stubRemotesEnv([REMOTE_URL]);

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(registerRemotesMock).not.toHaveBeenCalled();
  });

  it("rejects non-https remote URLs (http only for localhost) and reports them as skipped", async () => {
    const fetchMock = stubManifestFetch();
    stubRemotesEnv({ evil: "http://plugins.example.com/mf-manifest.json", junk: "not a url", num: 5 });

    const result = await initFederatedModules();

    // Config-invalid remotes surface as skipped (summary log), never a silent drop.
    expect(result).toEqual({ loaded: [], failed: [], skipped: ["evil", "junk", "num"] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalledTimes(3);
    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("skipped=[evil, junk, num]"));
  });

  it("rejects a remote entry URL without '.json' (would be script-loaded, not read as a manifest)", async () => {
    const fetchMock = stubManifestFetch();
    stubRemotesEnv({ news: "https://plugins.example.com/news/manifest?v=2" });

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: ["news"] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining(".json"));
  });

  it("allows http for localhost development remotes", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "1.4.0" } });
    stubRemotesEnv({ local: "http://localhost:3001/mf-manifest.json" });
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });

    const result = await initFederatedModules();

    expect(result.loaded).toEqual(["local"]);
  });

  it("allows http for IPv6 loopback development remotes", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "1.4.0" } });
    stubRemotesEnv({ local: "http://[::1]:3001/mf-manifest.json" });
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });

    const result = await initFederatedModules();

    expect(result.loaded).toEqual(["local"]);
  });

  it("resolves with every remote failed (never rejects) when registerRemotes throws", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL, loyalty: "https://plugins.example.com/loyalty/mf-manifest.json" });
    // Once, not persistent: beforeEach's clearAllMocks() does not remove implementations.
    registerRemotesMock.mockImplementationOnce(() => {
      throw new Error("runtime not initialized");
    });

    const result = await initFederatedModules();

    expect(result.failed).toEqual(expect.arrayContaining(["news", "loyalty"]));
    expect(result.failed).toHaveLength(2);
    expect(result.loaded).toEqual([]);
    expect(loadRemoteMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalledWith("[MF] registerRemotes failed", expect.any(Error));
  });

  it("loads a compatible plugin and calls its init()", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "^1.0.0" } });
    stubRemotesEnv({ news: REMOTE_URL });
    const initMock = vi.fn();
    loadRemoteMock.mockResolvedValue({ init: initMock });

    const result = await initFederatedModules();

    expect(registerRemotesMock).toHaveBeenCalledWith([{ name: "news", entry: REMOTE_URL }], { force: true });
    expect(loadRemoteMock).toHaveBeenCalledWith("news/plugin");
    expect(initMock).toHaveBeenCalledOnce();
    expect(result).toEqual({ loaded: ["news"], failed: [], skipped: [] });
    // Happy path still emits a positive dev-console confirmation (invisible otherwise
    // for extension-point-only plugins), and no failure noise.
    expect(loggerInfoMock).toHaveBeenCalledWith("[MF] plugins loaded=[news]");
    expect(loggerWarnMock).not.toHaveBeenCalled();
  });

  it("counts a plugin without init() as loaded (init is optional)", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockResolvedValue({});

    const result = await initFederatedModules();

    expect(result.loaded).toEqual(["news"]);
  });

  it("refuses a plugin route that would evict an existing host route", async () => {
    const addRoute = vi.fn();
    const router = { addRoute, hasRoute: (name: unknown) => name === "Cart" };
    globalsMock.router = router;
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockResolvedValue({
      init: () => {
        router.addRoute({ name: "Cart", path: "/cart" });
        router.addRoute({ name: "News", path: "/news" });
      },
    });

    const result = await initFederatedModules();

    expect(addRoute).toHaveBeenCalledTimes(1);
    expect(addRoute).toHaveBeenCalledWith({ name: "News", path: "/news" });
    expect(result.loaded).toEqual(["news"]);
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining('tried to replace the existing route "Cart"'));
  });

  it("restores the router after init so a later host add is not guarded", async () => {
    const addRoute = vi.fn();
    const router = { addRoute, hasRoute: () => true };
    globalsMock.router = router;
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });

    await initFederatedModules();
    router.addRoute({ name: "Cart", path: "/cart" });

    expect(addRoute).toHaveBeenCalledTimes(1);
  });

  it("skips an incompatible plugin before loading any of its code", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "99.0.0" } });
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: ["news"] });
    expect(registerRemotesMock).not.toHaveBeenCalled();
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("skips (fail closed) on a malformed requiredHostVersion", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "not-a-version" } });
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules();

    expect(result.skipped).toEqual(["news"]);
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("skips (fail closed) a manifest that declares no requiredHostVersion", async () => {
    stubManifestFetch({}); // no metaData.requiredHostVersion
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules();

    expect(result.skipped).toEqual(["news"]);
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("skips (fail closed) when the manifest responds with an error status", async () => {
    stubManifestFetch({}, { ok: false, status: 503 });
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules();

    expect(result.skipped).toEqual(["news"]);
  });

  it("skips (fail closed) when the manifest fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules();

    expect(result.skipped).toEqual(["news"]);
  });

  it("skips (fail closed) when the manifest fetch hangs past the budget", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})),
    );
    stubRemotesEnv({ news: REMOTE_URL });

    const result = await initFederatedModules({ manifestTimeoutMs: 20 });

    expect(result.skipped).toEqual(["news"]);
    expect(loggerErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('manifest for "news"'),
      expect.objectContaining({ message: expect.stringContaining("timed out") }),
    );
  });

  it("fails a plugin whose load/init hangs past the budget instead of blocking boot", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockImplementation(() => new Promise(() => {}));

    const result = await initFederatedModules({ loadTimeoutMs: 20 });

    expect(result).toEqual({ loaded: [], failed: ["news"], skipped: [] });
  });

  it("never calls init() of a plugin whose load resolved only after the budget", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    const initMock = vi.fn();
    let resolveLoad: ((plugin: { init: () => void }) => void) | undefined;
    loadRemoteMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        }),
    );

    const result = await initFederatedModules({ loadTimeoutMs: 20 });
    expect(result.failed).toEqual(["news"]);

    resolveLoad?.({ init: initMock });
    await flushPromises();

    expect(initMock).not.toHaveBeenCalled();
    // The late load DID execute the remote's module scope — that must be logged, like
    // a late init, so the "failed" outcome is never silently contradicted.
    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("load completed after its budget"));
  });

  it("logs the real cause when a timed-out load later fails (not just the synthetic timeout)", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    let rejectLoad: ((reason: Error) => void) | undefined;
    loadRemoteMock.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectLoad = reject;
        }),
    );

    const result = await initFederatedModules({ loadTimeoutMs: 20 });
    expect(result.failed).toEqual(["news"]);

    const realCause = new Error("shared-dependency gate: vue range mismatch");
    rejectLoad?.(realCause);
    await flushPromises();

    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("load failed after its budget"), realCause);
  });

  it("does not late-log an ordinary failure (only budget expiries get the 'after its budget' warn)", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockRejectedValue(new Error("boom"));

    const result = await initFederatedModules();
    await flushPromises();

    expect(result.failed).toEqual(["news"]);
    // The caller's catch owns a work-own rejection; a spurious "after its budget" warn
    // would contradict the single Logger.error it produces.
    expect(loggerWarnMock).not.toHaveBeenCalledWith(expect.stringContaining("after its budget"), expect.anything());
    expect(loggerWarnMock).not.toHaveBeenCalledWith(expect.stringContaining("after its budget"));
  });

  it("counts a plugin whose load resolves to null (no module delivered) as failed, not loaded", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    // The MF runtime resolves null instead of rejecting when an errorLoadRemote
    // failover hook is registered — "no module" must never silently count as loaded.
    loadRemoteMock.mockResolvedValue(null);

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: ["news"], skipped: [] });
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("news"), expect.anything());
  });

  it("backstop invariant: a budget-compliant remote can never trip the boot backstop", async () => {
    const { BOOT_BACKSTOP_MS } = await import("./bootstrap");
    const { DEFAULT_MANIFEST_TIMEOUT_MS, DEFAULT_LOAD_TIMEOUT_MS } = await import("./index");

    // One remote may legally take manifest + load + init; the bootstrap backstop must
    // sit above that sum or a compliant plugin loses its deep-link guarantee.
    expect(BOOT_BACKSTOP_MS).toBeGreaterThan(DEFAULT_MANIFEST_TIMEOUT_MS + 2 * DEFAULT_LOAD_TIMEOUT_MS);
  });

  it("reports failed on an overrunning init() and logs its late completion as indeterminate", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    let resolveInit: (() => void) | undefined;
    loadRemoteMock.mockResolvedValue({
      init: () =>
        new Promise<void>((resolve) => {
          resolveInit = resolve;
        }),
    });

    const result = await initFederatedModules({ loadTimeoutMs: 20 });
    expect(result.failed).toEqual(["news"]);

    resolveInit?.();
    await flushPromises();

    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("indeterminate"));
  });

  it("isolates a failing plugin from the others", async () => {
    stubManifestFetch();
    stubRemotesEnv({ good: REMOTE_URL, bad: "https://plugins.example.com/bad/mf-manifest.json" });
    loadRemoteMock.mockImplementation((id: string) =>
      id === "bad/plugin" ? Promise.reject(new Error("boom")) : Promise.resolve({ init: vi.fn() }),
    );

    const result = await initFederatedModules();
    await flushPromises();

    expect(result.loaded).toEqual(["good"]);
    expect(result.failed).toEqual(["bad"]);
  });

  it("counts a plugin whose init() throws as failed", async () => {
    stubManifestFetch();
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockResolvedValue({
      init: () => {
        throw new Error("init exploded");
      },
    });

    const result = await initFederatedModules();

    expect(result.failed).toEqual(["news"]);
  });
});
