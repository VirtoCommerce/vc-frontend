import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { Logger } from "@/core/utilities";
import { PLACEHOLDER_META_KEY, resetDeclaredSlots } from "./contributions/declare";
import { resetPluginStatuses, usePluginsStatus } from "./contributions/status";
import { loadPreparedModules, prepareFederatedModules } from "./index";
import type { IPlatformPlugin } from "./index";
import type { Router } from "vue-router";

const { loadRemoteMock, registerRemotesMock, globalsMock } = vi.hoisted(() => {
  const hostGlobals: { router?: Router } = {};
  return { loadRemoteMock: vi.fn(), registerRemotesMock: vi.fn(), globalsMock: hostGlobals };
});

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

function plugin(contributions?: unknown): IPlatformPlugin {
  return {
    id: "VirtoCommerce.SalesRep",
    entry: { type: "script", path: `${BASE}/remoteEntry.js`, hash: "E1" },
    contentFiles: [],
    remote: { name: "sales-rep", exposed: "./plugin" },
    contributions: contributions === undefined ? undefined : JSON.stringify(contributions),
  };
}

function otherPlugin(): IPlatformPlugin {
  return {
    ...plugin(),
    id: "VirtoCommerce.Other",
    entry: { type: "script", path: "/modules/$(VirtoCommerce.Other)/plugins/vc-frontend/remoteEntry.js", hash: "E2" },
    remote: { name: "other", exposed: "./plugin" },
  };
}

const DECLARED = {
  format: 1,
  when: { setting: "SalesRep.Enabled" },
  routes: [{ path: "documents", parent: "Company", name: "SalesRepDocuments" }],
};

function stubFetch() {
  const fetchMock = vi.fn((requested: string) =>
    Promise.resolve({
      ok: true,
      status: 200,
      url: requested,
      json: () => Promise.resolve({ metaData: { requiredHostVersion: "^1.0.0" } }),
    }),
  );
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

  beforeEach(() => {
    vi.clearAllMocks();
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: "/company", name: "Company", component: { template: "<router-view />" }, children: [] }],
    });
    globalsMock.router = router;
    resetPluginStatuses();
    resetDeclaredSlots();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches nothing of a plugin whose declared `when` is false, and reports why", async () => {
    const fetchMock = stubFetch();

    const prepared = await prepareFederatedModules({ plugins: [plugin(DECLARED)], conditionContext: context(false) });
    await loadPreparedModules(prepared).all;

    expect(fetchMock).not.toHaveBeenCalled();
    expect(loadRemoteMock).not.toHaveBeenCalled();
    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(usePluginsStatus().plugins.value).toEqual([
      { name: "sales-rep", state: "skipped", reason: expect.stringContaining("declared `when` is false") },
    ]);
  });

  it("does not declare anything of a plugin the user may not run", async () => {
    stubFetch();

    const prepared = await prepareFederatedModules({
      plugins: [{ ...plugin(DECLARED), permission: "sales-rep:access" }],
      hasPermission: () => false,
      conditionContext: context(true),
    });

    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
  });

  it("declares a plugin's routes before its code loads and does not make boot wait for it", async () => {
    stubFetch();
    let finishInit!: () => void;
    loadRemoteMock.mockResolvedValue({
      init: () => {
        router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });
        return new Promise<void>((resolve) => {
          finishInit = resolve;
        });
      },
    });

    const prepared = await prepareFederatedModules({ plugins: [plugin(DECLARED)], conditionContext: context(true) });

    expect(prepared.deferred.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(prepared.blocking).toEqual([]);
    expect(router.resolve("/company/documents").meta[PLACEHOLDER_META_KEY]).toBe("sales-rep");

    const loading = loadPreparedModules(prepared);
    await expect(loading.blocking).resolves.toBeUndefined();
    await flushPromises();

    finishInit();
    const result = await loading.all;

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(router.resolve("/company/documents").meta[PLACEHOLDER_META_KEY]).toBeUndefined();
    expect(router.resolve("/company/documents").matched.at(-1)?.components?.default).toBe(Page);
  });

  it("refuses one plugin's claim on a route another plugin declared, and lets the declaring plugin take it", async () => {
    stubFetch();
    const Intruder = { template: "<p />" };
    let releaseOwner!: () => void;
    const intruderDone = new Promise<void>((resolve) => {
      releaseOwner = resolve;
    });
    loadRemoteMock.mockImplementation(async (id: string) => {
      if (id.startsWith("other/")) {
        return {
          init: () => {
            router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Intruder });
            releaseOwner();
          },
        };
      }
      await intruderDone;
      return {
        init: () => {
          router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });
        },
      };
    });

    const prepared = await prepareFederatedModules({
      plugins: [otherPlugin(), plugin(DECLARED)],
      conditionContext: context(true),
    });
    const result = await loadPreparedModules(prepared).all;

    expect(result.loaded).toEqual(expect.arrayContaining(["other", "sales-rep"]));
    expect(router.resolve("/company/documents").matched.at(-1)?.components?.default).toBe(Page);
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('"other" tried to take the route "SalesRepDocuments" declared by "sales-rep"'),
    );
  });

  it("refuses a declared route its own plugin adds after an await in init, and withdraws the placeholder", async () => {
    stubFetch();
    loadRemoteMock.mockResolvedValue({
      init: async () => {
        await Promise.resolve();
        router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });
      },
    });

    const prepared = await prepareFederatedModules({ plugins: [plugin(DECLARED)], conditionContext: context(true) });
    const result = await loadPreparedModules(prepared).all;

    expect(result.loaded).toEqual(["sales-rep"]);
    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('a plugin tried to take the route "SalesRepDocuments" declared by "sales-rep"'),
    );
  });

  it("does not make boot wait for a plugin that declared nothing", async () => {
    stubFetch();

    const prepared = await prepareFederatedModules({ plugins: [plugin()], conditionContext: context(true) });

    expect(prepared.deferred.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(prepared.blocking).toEqual([]);
  });

  it("makes boot wait for a plugin that asks for it, whatever else it declares", async () => {
    stubFetch();

    const prepared = await prepareFederatedModules({
      plugins: [plugin({ format: 1, blocksBoot: true })],
      conditionContext: context(true),
    });

    expect(prepared.blocking.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(prepared.deferred).toEqual([]);
  });

  it("withdraws a failed plugin's placeholder so its deep link ends on the host's not-found page", async () => {
    stubFetch();
    loadRemoteMock.mockRejectedValue(new Error("chunk 404"));

    const prepared = await prepareFederatedModules({ plugins: [plugin(DECLARED)], conditionContext: context(true) });
    expect(router.hasRoute("SalesRepDocuments")).toBe(true);
    await loadPreparedModules(prepared).all;

    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    expect(usePluginsStatus().stateOf("sales-rep")).toBe("failed");
  });

  it("reads no contributions.json a platform plugin lists in contentFiles: only the inline declaration counts", async () => {
    const fetchMock = stubFetch();

    const prepared = await prepareFederatedModules({
      plugins: [{ ...plugin(), contentFiles: [{ path: `${BASE}/contributions.json`, hash: "C1" }] }],
      conditionContext: context(true),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(prepared.deferred).toEqual([{ remote: expect.objectContaining({ name: "sales-rep" }), applied: undefined }]);
    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
  });

  it.each([
    [200, "sales-rep"],
    [404, undefined],
  ] as const)(
    "reads an env remote's declaration from the plugin.json beside its manifest; a missing one declares nothing (HTTP %i)",
    async (status, placeholderOwner) => {
      vi.stubEnv(
        "APP_MODULES_FEDERATION_REMOTES",
        JSON.stringify({ "sales-rep": "http://localhost:3001/mf-manifest.json" }),
      );
      const fetchMock = vi.fn((requested: string) =>
        Promise.resolve({
          ok: status < 400,
          status,
          url: requested,
          json: () => Promise.resolve({ id: "p", contributions: DECLARED }),
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const prepared = await prepareFederatedModules({ conditionContext: context(true) });

      expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["http://localhost:3001/plugin.json"]);
      expect(prepared.deferred.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
      expect(router.resolve("/company/documents").meta[PLACEHOLDER_META_KEY]).toBe(placeholderOwner);
    },
  );

  it("skips a plugin whose inline declaration is not valid JSON, rather than guess at it", async () => {
    const fetchMock = stubFetch();

    const prepared = await prepareFederatedModules({
      plugins: [{ ...plugin(), contributions: "{ not json" }],
      conditionContext: context(true),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(usePluginsStatus().plugins.value[0]).toMatchObject({
      reason: "its inline contributions are not valid JSON",
    });
  });

  it.each([
    ["the router rejects", { path: "oops", name: "Oops" }],
    ["is malformed", null],
  ])("skips only the plugin whose declaration %s, leaving none of its entries behind", async (_, badRoute) => {
    const fetchMock = stubFetch();
    const broken = {
      ...plugin(),
      id: "Broken",
      remote: { name: "broken", exposed: "./plugin" },
      contributions: JSON.stringify({
        format: 1,
        routes: [{ path: "/broken", name: "BrokenPage" }, badRoute],
      }),
    };

    const prepared = await prepareFederatedModules({
      plugins: [broken, plugin(DECLARED)],
      conditionContext: context(true),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(prepared.result.skipped).toEqual(["broken"]);
    expect(usePluginsStatus().stateOf("broken")).toBe("skipped");
    expect(router.hasRoute("BrokenPage")).toBe(false);
    expect(prepared.deferred.map((entry) => entry.remote.name)).toEqual(["sales-rep"]);
    expect(router.hasRoute("SalesRepDocuments")).toBe(true);
  });

  it("skips a plugin whose condition this host cannot read, instead of running it", async () => {
    stubFetch();

    const prepared = await prepareFederatedModules({
      plugins: [plugin({ format: 1, when: { not: { future: "x" } } })],
      conditionContext: context(true),
    });

    expect(prepared.result.skipped).toEqual(["sales-rep"]);
    expect(usePluginsStatus().plugins.value[0]).toMatchObject({ reason: expect.stringContaining('"future"') });
  });

  it("skips a plugin whose contributions are in a format this host does not read", async () => {
    stubFetch();

    await prepareFederatedModules({ plugins: [plugin({ ...DECLARED, format: 2 })], conditionContext: context(true) });

    expect(usePluginsStatus().plugins.value[0]).toMatchObject({
      state: "skipped",
      reason: expect.stringContaining("format 2"),
    });
  });
});
