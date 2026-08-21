import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initFederatedModules } from "./index";
import type { IPlatformPlugin } from "./index";

const { loadRemoteMock, registerRemotesMock, loggerErrorMock, loggerWarnMock, loggerInfoMock } = vi.hoisted(() => ({
  loadRemoteMock: vi.fn(),
  registerRemotesMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  loggerInfoMock: vi.fn(),
}));

vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: loadRemoteMock,
  registerRemotes: registerRemotesMock,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: loggerErrorMock, warn: loggerWarnMock, info: loggerInfoMock, debug: vi.fn() },
}));

vi.mock("@/core-api/package.json", () => ({ version: "1.4.0" }));

const COMPATIBLE_MANIFEST = { metaData: { requiredHostVersion: "^1.0.0" } };

function stubManifestFetch(manifest: unknown = COMPATIBLE_MANIFEST): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(manifest) });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Shaped like the xAPI projection: entry.path is same-origin and carries the `$(ModuleId)` token. */
function platformPlugin(overrides: Partial<IPlatformPlugin> = {}): IPlatformPlugin {
  return {
    id: "VirtoCommerce.SalesRep",
    version: "3.1000.0",
    entry: {
      type: "script",
      path: "/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/remoteEntry.js",
      hash: "8DBA4F3C",
    },
    contentFiles: [],
    remote: { name: "sales-rep", exposed: "./plugin" },
    ...overrides,
  };
}

describe("platform-served plugin discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });
    document.head.querySelectorAll("link[data-mf-plugin-style]").forEach((node) => node.remove());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("registers the manifest that sits next to the platform's entry, cache-busted by its hash", async () => {
    const fetchMock = stubManifestFetch();

    const result = await initFederatedModules({ plugins: [platformPlugin()] });

    const expected = `${globalThis.location.origin}/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/mf-manifest.json?v=8DBA4F3C`;
    expect(fetchMock).toHaveBeenCalledWith(expected, expect.anything());
    expect(registerRemotesMock).toHaveBeenCalledWith([{ name: "sales-rep", entry: expected }], { force: true });
    expect(result.loaded).toEqual(["sales-rep"]);
  });

  it("loads the expose key the plugin declares", async () => {
    stubManifestFetch();

    await initFederatedModules({ plugins: [platformPlugin()] });

    expect(loadRemoteMock).toHaveBeenCalledWith("sales-rep/plugin");
  });

  it("falls back to the platform's default expose key", async () => {
    stubManifestFetch();

    await initFederatedModules({ plugins: [platformPlugin({ remote: { name: "sales-rep" } })] });

    expect(loadRemoteMock).toHaveBeenCalledWith("sales-rep/Module");
  });

  it("names the remote after the module id when the platform declares no remote name", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({ plugins: [platformPlugin({ remote: null })] });

    expect(result.loaded).toEqual(["VirtoCommerce.SalesRep"]);
  });

  it("skips a plugin whose permission the user lacks, without fetching anything", async () => {
    const fetchMock = stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [platformPlugin({ permission: "sales-rep:access" })],
      hasPermission: () => false,
    });

    expect(result).toEqual({ loaded: [], failed: [], skipped: ["sales-rep"] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("loads a permission-gated plugin when the user holds the permission", async () => {
    stubManifestFetch();
    const hasPermission = vi.fn().mockReturnValue(true);

    const result = await initFederatedModules({
      plugins: [platformPlugin({ permission: "sales-rep:access" })],
      hasPermission,
    });

    expect(hasPermission).toHaveBeenCalledWith("sales-rep:access");
    expect(result.loaded).toEqual(["sales-rep"]);
  });

  it("skips a permission-gated plugin when the host provides no permission check", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({ plugins: [platformPlugin({ permission: "sales-rep:access" })] });

    expect(result.skipped).toEqual(["sales-rep"]);
  });

  it("skips a plugin the platform advertises without an entry path", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({ plugins: [platformPlugin({ entry: null })] });

    expect(result.skipped).toEqual(["sales-rep"]);
    expect(registerRemotesMock).not.toHaveBeenCalled();
  });

  it("injects stylesheets the plugin ships separately, once each", async () => {
    stubManifestFetch();
    const plugin = platformPlugin({
      contentFiles: [
        { type: "style", path: "/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/style.css", hash: "AA11" },
        { type: "script", path: "/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/extra.js", hash: "BB22" },
      ],
    });

    await initFederatedModules({ plugins: [plugin] });
    await initFederatedModules({ plugins: [plugin] });

    const injected = Array.from(document.head.querySelectorAll("link[data-mf-plugin-style]"));
    const expected = `${globalThis.location.origin}/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/style.css?v=AA11`;
    expect(injected.map((node) => node.getAttribute("href"))).toEqual([expected]);
    expect(injected[0].getAttribute("rel")).toBe("stylesheet");
  });

  it("lets the env override win over the platform list", async () => {
    stubManifestFetch();
    vi.stubEnv("APP_MODULES_FEDERATION_REMOTES", JSON.stringify({ local: "http://localhost:3001/mf-manifest.json" }));

    const result = await initFederatedModules({ plugins: [platformPlugin()] });

    expect(result.loaded).toEqual(["local"]);
    expect(loadRemoteMock).toHaveBeenCalledWith("local/plugin");
  });
  it.each([
    ["an absolute foreign URL", "https://evil.example/plugins/remoteEntry.js"],
    ["a protocol-relative URL", "//evil.example/plugins/remoteEntry.js"],
  ])("skips a plugin whose entry path is %s", async (_label, path) => {
    const fetchMock = stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [platformPlugin({ entry: { type: "script", path, hash: "CC33" } })],
    });

    expect(result.skipped).toEqual(["sales-rep"]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(registerRemotesMock).not.toHaveBeenCalled();
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("ignores a stylesheet served from another origin", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [
        platformPlugin({
          contentFiles: [{ type: "style", path: "https://evil.example/theme.css", hash: "DD44" }],
        }),
      ],
    });

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(document.head.querySelectorAll("link[data-mf-plugin-style]")).toHaveLength(0);
  });
  it("leaves no stylesheet behind when the plugin fails to load", async () => {
    stubManifestFetch();
    loadRemoteMock.mockRejectedValue(new Error("boom"));
    const plugin = platformPlugin({
      contentFiles: [
        { type: "style", path: "/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend/fail.css", hash: "EE55" },
      ],
    });

    const result = await initFederatedModules({ plugins: [plugin] });

    expect(result.failed).toEqual(["sales-rep"]);
    expect(document.head.querySelectorAll("link[data-mf-plugin-style]")).toHaveLength(0);
  });

  it("keeps only the first plugin when two declare the same remote name", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [
        platformPlugin({ id: "First" }),
        platformPlugin({ id: "Second", entry: { type: "script", path: "/modules/b/remoteEntry.js" } }),
      ],
    });

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(loadRemoteMock).toHaveBeenCalledTimes(1);
    expect(registerRemotesMock).toHaveBeenCalledWith([expect.objectContaining({ name: "sales-rep" })], {
      force: true,
    });
  });

  it("still counts a plugin with no init() as loaded, with a warning", async () => {
    stubManifestFetch();
    loadRemoteMock.mockResolvedValue({});

    const result = await initFederatedModules({ plugins: [platformPlugin()] });

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("exposes no init()"));
  });

  it("treats a blank permission as no permission at all", async () => {
    stubManifestFetch();
    const hasPermission = vi.fn().mockReturnValue(false);

    const result = await initFederatedModules({ plugins: [platformPlugin({ permission: "  " })], hasPermission });

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(hasPermission).not.toHaveBeenCalled();
  });

  it("skips only the plugin whose permission check throws", async () => {
    stubManifestFetch();
    const hasPermission = vi.fn().mockImplementation((permission: string) => {
      if (permission === "explodes") {
        throw new Error("nope");
      }
      return true;
    });

    const result = await initFederatedModules({
      plugins: [
        platformPlugin({ id: "A", remote: { name: "a", exposed: "./plugin" }, permission: "explodes" }),
        platformPlugin({ id: "B", remote: { name: "b", exposed: "./plugin" }, permission: "fine" }),
      ],
      hasPermission,
    });

    expect(result.skipped).toEqual(["a"]);
    expect(result.loaded).toEqual(["b"]);
  });

  it("says so when the env override suppresses a non-empty platform list", async () => {
    stubManifestFetch();
    vi.stubEnv("APP_MODULES_FEDERATION_REMOTES", "{}");

    await initFederatedModules({ plugins: [platformPlugin()] });

    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining("1 platform plugin(s) are ignored"));
  });
  it("skips a plugin whose entry is not a script", async () => {
    const fetchMock = stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [platformPlugin({ entry: { type: "importmap", path: "/modules/a/x.json", hash: "FF66" } })],
    });

    expect(result.skipped).toEqual(["sales-rep"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a plugin whose entry declares no type", async () => {
    stubManifestFetch();

    const result = await initFederatedModules({
      plugins: [platformPlugin({ entry: { path: "/modules/a/remoteEntry.js" } })],
    });

    expect(result.loaded).toEqual(["sales-rep"]);
  });
  it("names the platform module version in the outcome log", async () => {
    stubManifestFetch();

    await initFederatedModules({ plugins: [platformPlugin()] });

    expect(loggerInfoMock).toHaveBeenCalledWith("[MF] plugins loaded=[sales-rep@3.1000.0]");
  });
});
