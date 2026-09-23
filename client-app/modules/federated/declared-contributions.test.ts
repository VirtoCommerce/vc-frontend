import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import type { IPlatformPlugin } from "./index";
import type { Router } from "vue-router";

const { loadRemoteMock, registerRemotesMock, globalsMock } = vi.hoisted(() => ({
  loadRemoteMock: vi.fn(),
  registerRemotesMock: vi.fn(),
  globalsMock: {},
}));

vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: loadRemoteMock,
  registerRemotes: registerRemotesMock,
}));
vi.mock("@/core/globals", () => ({ globals: globalsMock }));
vi.mock("@/core-api/package.json", () => ({ version: "1.4.0" }));
vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const BASE = "/modules/$(VirtoCommerce.SalesRep)/plugins/vc-frontend";
const Page = { template: "<div />" };

function plugin(contentFiles: IPlatformPlugin["contentFiles"] = [{ path: `${BASE}/contributions.json`, hash: "C1" }]) {
  return {
    id: "VirtoCommerce.SalesRep",
    entry: { type: "script", path: `${BASE}/remoteEntry.js`, hash: "E1" },
    contentFiles,
    remote: { name: "sales-rep", exposed: "./plugin" },
  } satisfies IPlatformPlugin;
}

const DECLARED = {
  format: 1,
  when: { setting: "SalesRep.Enabled" },
  routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments" }],
};

function stubFetch(contributions: unknown, init: { contributionsStatus?: number } = {}) {
  const fetchMock = vi.fn((requested: string) => {
    const isContributions = requested.includes("contributions.json");
    const status = isContributions ? (init.contributionsStatus ?? 200) : 200;
    return Promise.resolve({
      ok: status < 400,
      status,
      url: requested,
      json: () => Promise.resolve(isContributions ? contributions : { metaData: { requiredHostVersion: "^1.0.0" } }),
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function context(enabled: boolean) {
  return {
    setting: (key: string) => (key === "SalesRep.Enabled" ? enabled : undefined),
    themeSetting: () => undefined,
    isAuthenticated: true,
    can: () => true,
  };
}

describe("declared contributions in the loader", () => {
  let router: Router;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/company", name: "Company", component: { template: "<router-view />" }, children: [] }],
    });
    globalsMock.router = router;
    (await import("./contributions/status")).resetPluginStatuses();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches nothing of a plugin whose declared `when` is false, and reports why", async () => {
    const fetchMock = stubFetch(DECLARED);
    const { prepareFederatedModules, loadPreparedModules } = await import("./index");
    const { usePluginsStatus } = await import("./contributions/status");

    const prepared = await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(false) });
    await loadPreparedModules(prepared).all;

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      `${globalThis.location.origin}${BASE}/contributions.json?v=C1`,
    ]);
    expect(loadRemoteMock).not.toHaveBeenCalled();
    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(usePluginsStatus().plugins.value).toEqual([
      { name: "sales-rep", state: "skipped", reason: expect.stringContaining("declared `when` is false") },
    ]);
  });

  it("asks nothing, not even the contributions, of a plugin the user may not run", async () => {
    const fetchMock = stubFetch(DECLARED);
    const { prepareFederatedModules } = await import("./index");

    await prepareFederatedModules({
      plugins: [{ ...plugin(), permission: "sales-rep:access" }],
      hasPermission: () => false,
      conditionContext: context(true),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("declares a plugin's routes before its code loads and does not make boot wait for it", async () => {
    stubFetch(DECLARED);
    let finishInit!: () => void;
    loadRemoteMock.mockResolvedValue({
      init: () =>
        new Promise<void>((resolve) => {
          finishInit = resolve;
        }),
    });
    const { prepareFederatedModules, loadPreparedModules } = await import("./index");
    const { PLACEHOLDER_META_KEY } = await import("./contributions/declare");

    const prepared = await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(true) });

    expect(prepared.deferred.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(prepared.blocking).toEqual([]);
    expect(router.resolve("/company/documents").meta[PLACEHOLDER_META_KEY]).toBe("sales-rep");

    const loading = loadPreparedModules(prepared);
    await expect(loading.blocking).resolves.toBeUndefined();
    await flushPromises();

    // The plugin's own init() takes its placeholder over: the guard lets it, it is not a host route.
    router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });
    finishInit();
    const result = await loading.all;

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(router.resolve("/company/documents").meta[PLACEHOLDER_META_KEY]).toBeUndefined();
    expect(router.resolve("/company/documents").matched.at(-1)?.components?.default).toBe(Page);
  });

  it("still waits for a plugin that declared nothing", async () => {
    stubFetch(undefined);
    loadRemoteMock.mockResolvedValue({ init: vi.fn() });
    const { prepareFederatedModules } = await import("./index");

    const prepared = await prepareFederatedModules({ plugins: [plugin([])], conditionContext: context(true) });

    expect(prepared.blocking.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(prepared.deferred).toEqual([]);
  });

  it("withdraws a failed plugin's placeholder so its deep link ends on the host's not-found page", async () => {
    stubFetch(DECLARED);
    loadRemoteMock.mockRejectedValue(new Error("chunk 404"));
    const { prepareFederatedModules, loadPreparedModules } = await import("./index");
    const { usePluginsStatus } = await import("./contributions/status");

    const prepared = await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(true) });
    expect(router.hasRoute("SalesRepDocuments")).toBe(true);
    await loadPreparedModules(prepared).all;

    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    expect(usePluginsStatus().stateOf("sales-rep")).toBe("failed");
  });

  it("skips a plugin that lists contributions but does not serve them", async () => {
    stubFetch(DECLARED, { contributionsStatus: 404 });
    const { prepareFederatedModules } = await import("./index");

    const prepared = await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(true) });

    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(loadRemoteMock).not.toHaveBeenCalled();
  });

  it("skips a plugin whose contributions are in a format this host does not read", async () => {
    stubFetch({ ...DECLARED, format: 2 });
    const { prepareFederatedModules } = await import("./index");
    const { usePluginsStatus } = await import("./contributions/status");

    await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(true) });

    expect(usePluginsStatus().plugins.value[0]).toMatchObject({
      state: "skipped",
      reason: expect.stringContaining("format 2"),
    });
  });
});
