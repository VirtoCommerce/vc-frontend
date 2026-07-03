import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFederatedModules } from "./index";

const { loadRemoteMock, registerRemotesMock, loggerErrorMock, loggerWarnMock, notificationErrorMock } = vi.hoisted(
  () => ({
    loadRemoteMock: vi.fn(),
    registerRemotesMock: vi.fn(),
    loggerErrorMock: vi.fn(),
    loggerWarnMock: vi.fn(),
    notificationErrorMock: vi.fn(),
  }),
);

vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: loadRemoteMock,
  registerRemotes: registerRemotesMock,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: loggerErrorMock, warn: loggerWarnMock, info: vi.fn(), debug: vi.fn() },
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ error: notificationErrorMock }),
}));

vi.mock("@/core-api/version", () => ({ CORE_VERSION: "2.53.0" }));

const REMOTE_URL = "https://plugins.example.com/news/mf-manifest.json";

function stubRemotesEnv(remotes: unknown): void {
  vi.stubEnv("APP_MF_REMOTES", typeof remotes === "string" ? remotes : JSON.stringify(remotes));
}

function stubManifestFetch(manifest: unknown, init?: { ok?: boolean; status?: number }): ReturnType<typeof vi.fn> {
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
  });

  it("is a no-op when APP_MF_REMOTES is not set", async () => {
    const fetchMock = stubManifestFetch({});
    vi.stubEnv("APP_MF_REMOTES", "");

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(registerRemotesMock).not.toHaveBeenCalled();
  });

  it("ignores invalid JSON in APP_MF_REMOTES", async () => {
    stubManifestFetch({});
    stubRemotesEnv("{not json");

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(loggerErrorMock).toHaveBeenCalledWith(expect.stringContaining("not valid JSON"), expect.anything());
  });

  it("ignores a non-object APP_MF_REMOTES value", async () => {
    stubManifestFetch({});
    stubRemotesEnv([REMOTE_URL]);

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(registerRemotesMock).not.toHaveBeenCalled();
  });

  it("rejects non-https remote URLs (http only for localhost)", async () => {
    const fetchMock = stubManifestFetch({});
    stubRemotesEnv({ evil: "http://plugins.example.com/mf-manifest.json", junk: "not a url", num: 5 });

    const result = await initFederatedModules();

    expect(result).toEqual({ loaded: [], failed: [], skipped: [] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loggerErrorMock).toHaveBeenCalledTimes(3);
  });

  it("allows http for localhost development remotes", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "2.53.0" } });
    stubRemotesEnv({ local: "http://localhost:3001/mf-manifest.json" });
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });

    const result = await initFederatedModules();

    expect(result.loaded).toEqual(["local"]);
  });

  it("loads a compatible plugin and calls its init()", async () => {
    stubManifestFetch({ metaData: { requiredHostVersion: "^2.0.0" } });
    stubRemotesEnv({ news: REMOTE_URL });
    const initMock = vi.fn();
    loadRemoteMock.mockResolvedValue({ init: initMock });

    const result = await initFederatedModules();

    expect(registerRemotesMock).toHaveBeenCalledWith([{ name: "news", entry: REMOTE_URL }], { force: true });
    expect(loadRemoteMock).toHaveBeenCalledWith("news/plugin");
    expect(initMock).toHaveBeenCalledOnce();
    expect(result).toEqual({ loaded: ["news"], failed: [], skipped: [] });
  });

  it("counts a plugin without init() as loaded (init is optional)", async () => {
    stubManifestFetch({});
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockResolvedValue({});

    const result = await initFederatedModules();

    expect(result.loaded).toEqual(["news"]);
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
    stubManifestFetch({});
    stubRemotesEnv({ news: REMOTE_URL });
    loadRemoteMock.mockImplementation(() => new Promise(() => {}));

    const result = await initFederatedModules({ loadTimeoutMs: 20 });

    expect(result).toEqual({ loaded: [], failed: ["news"], skipped: [] });
  });

  it("never calls init() of a plugin whose load resolved only after the budget", async () => {
    stubManifestFetch({});
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
  });

  it("reports failed on an overrunning init() and logs its late completion as indeterminate", async () => {
    stubManifestFetch({});
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
    stubManifestFetch({});
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
    stubManifestFetch({});
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
