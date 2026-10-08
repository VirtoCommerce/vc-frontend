import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { evaluateResidual, isGloballyTrue, resolveGlobalTerms } from "./evaluate";
import {
  resetPluginStatuses,
  setPluginStatus,
  isPluginSettled,
  whenPluginSettled,
  usePluginsStatus,
  expirePendingAfter,
} from "./status";
import type { IConditionContextType } from "./evaluate";
import type { ConditionNodeType, IPluginContributionsType } from "./types";

const { loggerWarnMock, loggerErrorMock } = vi.hoisted(() => ({ loggerWarnMock: vi.fn(), loggerErrorMock: vi.fn() }));

vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Logger: { warn: loggerWarnMock, error: loggerErrorMock, info: vi.fn(), debug: vi.fn() },
}));

function context(overrides: Partial<IConditionContextType> = {}): IConditionContextType {
  const settings: Record<string, unknown> = { "SalesRep.Enabled": true, "Mode.Name": "on", "Off.Flag": false };
  const theme: Record<string, unknown> = { push_messages_enabled: true };
  const permissions = new Set(["sales-rep:access"]);
  return {
    setting: (key) => settings[key],
    themeSetting: (key) => theme[key],
    isAuthenticated: true,
    can: (permission) => permissions.has(permission),
    ...overrides,
  };
}

describe("resolveGlobalTerms", () => {
  it("decides every global key", () => {
    const ctx = context();

    expect(resolveGlobalTerms({ setting: "SalesRep.Enabled" }, ctx)).toBe(true);
    expect(resolveGlobalTerms({ setting: "Off.Flag" }, ctx)).toBe(false);
    expect(resolveGlobalTerms({ setting: "Missing" }, ctx)).toBe(false);
    expect(resolveGlobalTerms({ setting: "Mode.Name", eq: "on" }, ctx)).toBe(true);
    expect(resolveGlobalTerms({ setting: "Mode.Name", eq: "off" }, ctx)).toBe(false);
    expect(resolveGlobalTerms({ themeSetting: "push_messages_enabled" }, ctx)).toBe(true);
    expect(resolveGlobalTerms({ authenticated: true }, context({ isAuthenticated: false }))).toBe(false);
    expect(resolveGlobalTerms({ can: "sales-rep:access" }, ctx)).toBe(true);
    expect(resolveGlobalTerms({ can: "nope" }, ctx)).toBe(false);
  });

  it("reads a setting as the host's own isEnabled does: only `true` is on", () => {
    expect(resolveGlobalTerms({ setting: "X" }, context({ setting: () => "true" }))).toBe(false);
    expect(resolveGlobalTerms({ setting: "X" }, context({ setting: () => 1 }))).toBe(false);
  });

  it("leaves field terms standing and folds what the global terms decide", () => {
    const ctx = context();
    const field: ConditionNodeType = { field: "hasVariations" };

    expect(resolveGlobalTerms({ and: [{ setting: "SalesRep.Enabled" }, field] }, ctx)).toEqual(field);
    expect(resolveGlobalTerms({ and: [{ setting: "Off.Flag" }, field] }, ctx)).toBe(false);
    expect(resolveGlobalTerms({ or: [{ setting: "SalesRep.Enabled" }, field] }, ctx)).toBe(true);
    expect(resolveGlobalTerms({ or: [{ setting: "Off.Flag" }, field] }, ctx)).toEqual(field);
    expect(resolveGlobalTerms({ not: field }, ctx)).toEqual({ not: field });
    expect(resolveGlobalTerms({ and: [field, { field: "b" }] }, ctx)).toEqual({ and: [field, { field: "b" }] });
  });

  it("rejects an unknown key or a malformed node, also under `not`, rather than read it as false", () => {
    const unknown = { future: "x" } as unknown as ConditionNodeType;
    const malformed = { and: "x" } as unknown as ConditionNodeType;

    expect(() => resolveGlobalTerms(unknown, context())).toThrow(/unknown condition key "future"/);
    expect(() => resolveGlobalTerms({ not: unknown }, context())).toThrow(/unknown condition key "future"/);
    expect(() => resolveGlobalTerms({ not: malformed }, context())).toThrow(/malformed condition/);
    expect(() => resolveGlobalTerms({ not: null as unknown as ConditionNodeType }, context())).toThrow(
      /malformed condition/,
    );
  });
});

describe("evaluateResidual", () => {
  it("reads dot paths from the slot context", () => {
    const product = { hasVariations: false, availabilityData: { isInStock: false } };

    expect(evaluateResidual({ not: { field: "availabilityData.isInStock" } }, product)).toBe(true);
    expect(evaluateResidual({ field: "hasVariations" }, product)).toBe(false);
    expect(evaluateResidual({ field: "scope", eq: "Customer" }, { scope: "Customer" })).toBe(true);
    expect(evaluateResidual({ field: "scope", eq: "Customer" }, undefined)).toBe(false);
    expect(evaluateResidual({ field: "a.b.c" }, { a: null })).toBe(false);
    expect(evaluateResidual(true, undefined)).toBe(true);
  });
});

describe("isGloballyTrue", () => {
  it("does not gate on a field term it cannot decide", () => {
    expect(isGloballyTrue(undefined, context())).toBe(true);
    expect(isGloballyTrue({ field: "x" }, context())).toBe(true);
    expect(isGloballyTrue({ setting: "Off.Flag" }, context())).toBe(false);
  });
});

describe("plugin status", () => {
  beforeEach(() => {
    resetPluginStatuses();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("settles once, and a late outcome does not rewrite it", async () => {
    setPluginStatus("p", "pending");
    const settled = whenPluginSettled("p");
    expect(isPluginSettled("p")).toBe(false);

    setPluginStatus("p", "failed", "load timed out");
    setPluginStatus("p", "loaded");

    await expect(settled).resolves.toEqual({ name: "p", state: "failed", reason: "load timed out" });
    expect(usePluginsStatus().stateOf("p")).toBe("failed");
    expect(usePluginsStatus().plugins.value).toEqual([{ name: "p", state: "failed", reason: "load timed out" }]);
  });

  it("stops holding a pending plugin past its deadline without claiming it settled", async () => {
    vi.useFakeTimers();
    setPluginStatus("p", "pending");
    const settled = whenPluginSettled("p");
    expirePendingAfter("p", 1000);

    vi.advanceTimersByTime(1000);

    expect(isPluginSettled("p")).toBe(true);
    expect(usePluginsStatus().stateOf("p")).toBe("pending");
    await expect(settled).resolves.toMatchObject({ state: "pending" });
  });

  it("answers at once for a plugin the host never saw", async () => {
    expect(isPluginSettled("unknown")).toBe(true);
    await expect(whenPluginSettled("unknown")).resolves.toMatchObject({ state: "skipped" });
  });
});

describe("applyContributions / releaseContributions", () => {
  const Parent = { template: "<router-view />" };
  const Page = { template: "<div />" };

  async function setup() {
    vi.resetModules();
    const declare = await import("./declare");
    const status = await import("./status");
    const navigations = await import("@/core/composables/useNavigations");
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "Home", component: Page },
        { path: "/company", name: "Company", component: Parent, children: [] },
      ],
    });
    return { declare, status, navigations, router };
  }

  const salesRep: IPluginContributionsType = {
    format: 1,
    routes: [
      { path: "documents", parent: "Company", name: "SalesRepDocuments", when: { can: "sales-rep:access" } },
      { path: "hidden", parent: "Company", name: "Hidden", when: { can: "nope" } },
      // @ts-expect-error JSON from a plugin can name a parent this host does not have
      { path: "gone", parent: "Missing", name: "Orphan" },
      { path: "home", name: "Home" },
    ],
    menu: [
      { surface: "header", group: "corporate", id: "docs-link", title: "t", routeName: "SalesRepDocuments" },
      { surface: "header", group: "corporate", id: "dead-link", title: "t", routeName: "NotDeclared" },
      {
        surface: "account",
        id: "hub",
        title: "h",
        children: [{ id: "docs", title: "d", routeName: "SalesRepDocuments" }],
      },
    ],
    slots: [
      { at: "sharedList/provenance-note", policy: "reserve", when: { field: "scope", eq: "Customer" } },
      { at: "accountMenu/docs", policy: "reserve", when: { can: "nope" } },
      { at: "mobileMenu/docs", policy: "none" },
    ],
  };

  it("registers placeholders and menu entries whose `when` holds, and nothing else", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");

    const applied = declare.applyContributions("sales-rep", salesRep, context(), router);

    expect(applied.placeholderRoutes).toEqual(["SalesRepDocuments"]);
    expect(router.hasRoute("SalesRepDocuments")).toBe(true);
    expect(router.hasRoute("Hidden")).toBe(false);
    expect(router.hasRoute("Orphan")).toBe(false);
    expect(router.resolve("/company/documents").meta[declare.PLACEHOLDER_META_KEY]).toBe("sales-rep");
    expect(router.resolve("/").name).toBe("Home");
    expect(loggerWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('declares route "Home", which is already taken'),
    );
    expect(loggerWarnMock).toHaveBeenCalledWith(expect.stringContaining('menu link to "NotDeclared"'));

    const nav = navigations.useNavigations();
    expect(nav.desktopCorporateMenuItems.value?.children?.map((link) => link.id)).toContain("docs-link");
    expect(nav.registeredAccountSections.value.map((section) => section.id)).toEqual(["hub"]);
  });

  it("reserves a declared slot only while its plugin is pending and only where the field condition holds", async () => {
    const { declare, status, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    declare.applyContributions("sales-rep", salesRep, context(), router);

    expect(declare.reservationFor("sharedList", "provenance-note", { scope: "Customer" })).toBe("reserve");
    expect(declare.reservationFor("sharedList", "provenance-note", { scope: "Private" })).toBeUndefined();
    expect(declare.reservationFor("accountMenu", "docs", undefined)).toBeUndefined();
    expect(declare.reservationFor("mobileMenu", "docs", undefined)).toBeUndefined();
    expect(declare.pendingSlotNames("sharedList")).toEqual(["provenance-note"]);

    status.setPluginStatus("sales-rep", "loaded");

    expect(declare.reservationFor("sharedList", "provenance-note", { scope: "Customer" })).toBeUndefined();
    expect(declare.pendingSlotNames("sharedList")).toEqual([]);
  });

  it("keeps what the plugin claimed and withdraws what it did not, once it loaded", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    const applied = declare.applyContributions(
      "sales-rep",
      {
        ...salesRep,
        routes: [...(salesRep.routes ?? []), { path: "unclaimed", parent: "Company", name: "Unclaimed" }],
        menu: [
          ...(salesRep.menu ?? []),
          { surface: "header", group: "corporate", id: "unclaimed-link", title: "t", routeName: "Unclaimed" },
        ],
      },
      context(),
      router,
    );
    router.addRoute("Company", { path: "documents", name: "SalesRepDocuments", component: Page });

    declare.releaseContributions(applied, router, true);

    expect(router.resolve("/company/documents").meta[declare.PLACEHOLDER_META_KEY]).toBeUndefined();
    expect(router.hasRoute("Unclaimed")).toBe(false);
    const ids = navigations.useNavigations().desktopCorporateMenuItems.value?.children?.map((link) => link.id);
    expect(ids).toContain("docs-link");
    expect(ids).not.toContain("unclaimed-link");
  });

  it("withdraws every declared entry when the plugin failed", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    const applied = declare.applyContributions("sales-rep", salesRep, context(), router);

    declare.releaseContributions(applied, router, false);

    expect(router.hasRoute("SalesRepDocuments")).toBe(false);
    const nav = navigations.useNavigations();
    expect(nav.desktopCorporateMenuItems.value?.children?.map((link) => link.id) ?? []).not.toContain("docs-link");
    expect(nav.registeredAccountSections.value).toEqual([]);
  });

  it("lets the plugin's own registration replace a declared link and section instead of duplicating them", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    declare.applyContributions("sales-rep", salesRep, context(), router);
    const nav = navigations.useNavigations();

    nav.mergeMenuSchema({
      header: { desktop: { corporate: { children: [{ id: "docs-link", title: "real", route: { name: "Home" } }] } } },
    });
    nav.registerAccountSection({ id: "hub", title: "real hub", children: [] });

    const links = nav.desktopCorporateMenuItems.value?.children?.filter((link) => link.id === "docs-link");
    expect(links?.map((link) => link.route)).toEqual([{ name: "Home" }]);
    expect(nav.registeredAccountSections.value.map((section) => section.title)).toEqual(["real hub"]);
  });

  it("refuses a declared link or section id that is already taken, so withdrawing it cannot take another's", async () => {
    const { declare, status, navigations, router } = await setup();
    const nav = navigations.useNavigations();
    nav.mergeMenuSchema({
      header: { desktop: { corporate: { children: [{ id: "docs-link", title: "host", route: { name: "Home" } }] } } },
    });
    nav.registerAccountSection({ id: "hub", title: "host hub", children: [] });
    status.setPluginStatus("sales-rep", "pending");

    const applied = declare.applyContributions("sales-rep", salesRep, context(), router);
    declare.releaseContributions(applied, router, false);

    const links = nav.desktopCorporateMenuItems.value?.children?.filter((link) => link.id === "docs-link");
    expect(links?.map((link) => link.route)).toEqual([{ name: "Home" }]);
    expect(nav.registeredAccountSections.value.map((section) => section.title)).toEqual(["host hub"]);
  });

  it("keeps the first plugin's declared section when a second plugin declaring the same id fails", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    status.setPluginStatus("other", "pending");
    declare.applyContributions("sales-rep", salesRep, context(), router);

    const other = declare.applyContributions("other", { format: 1, menu: salesRep.menu }, context(), router);
    declare.releaseContributions(other, router, false);

    const nav = navigations.useNavigations();
    expect(nav.desktopCorporateMenuItems.value?.children?.map((link) => link.id)).toContain("docs-link");
    expect(nav.registeredAccountSections.value.map((section) => section.id)).toEqual(["hub"]);
  });

  it("declares one link id in several groups, and withdraws all of them when the plugin fails", async () => {
    const { declare, status, navigations, router } = await setup();
    status.setPluginStatus("sales-rep", "pending");
    const link = { surface: "header", id: "docs-link", title: "t", routeName: "SalesRepDocuments" } as const;

    const applied = declare.applyContributions(
      "sales-rep",
      {
        ...salesRep,
        menu: [
          { ...link, group: "corporate" },
          { ...link, group: "main" },
        ],
      },
      context(),
      router,
    );
    const nav = navigations.useNavigations();
    expect(nav.desktopCorporateMenuItems.value?.children?.map((item) => item.id)).toContain("docs-link");
    expect(nav.desktopMainMenuItems.value.map((item) => item.id)).toContain("docs-link");

    declare.releaseContributions(applied, router, false);

    expect(nav.desktopCorporateMenuItems.value?.children?.map((item) => item.id) ?? []).not.toContain("docs-link");
    expect(nav.desktopMainMenuItems.value.map((item) => item.id)).not.toContain("docs-link");
  });
});
