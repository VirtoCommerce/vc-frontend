import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { ENABLED_KEY, SESSION_START_EVENT, SESSION_STORAGE_KEY, TRACKER_NAME } from "./constants";
import type { TrackerType } from "@/core/types/analytics";
import type { Router } from "vue-router";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
  flushMock: vi.fn(),
  setPagePathResolverMock: vi.fn(),
  addTrackerMock: vi.fn(),
  trackPageViewsMock: vi.fn(),
  enabledKeys: new Set<string>(),
  isDevelopment: false,
}));

const isAuthenticated = ref(false);
const organization = ref<{ id: string } | null>(null);

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({
    isAuthenticated,
    user: ref({ id: "user-1", contact: { id: "contact-1" }, permissions: [] }),
    organization,
    operator: ref(null),
  }),
}));

vi.mock("./composables/useAnalyticsQueue", () => ({
  useAnalyticsQueue: () => ({
    capture: hoisted.captureMock,
    flush: hoisted.flushMock,
    setPagePathResolver: hoisted.setPagePathResolverMock,
  }),
}));

vi.mock("./page-views", () => ({
  trackPageViews: hoisted.trackPageViewsMock,
}));

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ addTracker: hoisted.addTrackerMock }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ isEnabled: (key: string) => hoisted.enabledKeys.has(key) }),
}));

vi.mock("@/core/constants", () => ({
  get IS_DEVELOPMENT() {
    return hoisted.isDevelopment;
  },
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ currentCurrency: { value: { code: "USD" } } }),
}));

vi.mock("@/core/globals", () => ({
  globals: { currencyCode: "USD" },
}));

const { init: initModule } = await import("./index");

let scope = effectScope();

/** In a scope, so the page listeners of one case are gone before the next one counts its own. */
function init(router: Router): void {
  scope.run(() => initModule(router));
}

function buildRouter() {
  return createRouter({ history: createMemoryHistory(), routes: [{ path: "/", component: { template: "<div />" } }] });
}

function registeredTracker(): TrackerType {
  return hoisted.addTrackerMock.mock.calls[0][0] as TrackerType;
}

describe("init", () => {
  beforeEach(() => {
    scope = effectScope();
    sessionStorage.clear();
    hoisted.captureMock.mockReset();
    hoisted.flushMock.mockReset();
    hoisted.addTrackerMock.mockReset();
    hoisted.trackPageViewsMock.mockReset();
    hoisted.enabledKeys.clear();
    hoisted.enabledKeys.add(ENABLED_KEY);
    hoisted.isDevelopment = false;
    isAuthenticated.value = false;
    organization.value = null;
  });

  afterEach(() => {
    scope.stop();
  });

  it("registers nothing while the store has analytics off", () => {
    hoisted.enabledKeys.clear();

    init(buildRouter());

    expect(hoisted.addTrackerMock).not.toHaveBeenCalled();
    expect(hoisted.trackPageViewsMock).not.toHaveBeenCalled();
    expect(hoisted.captureMock).not.toHaveBeenCalled();
  });

  it("registers nothing in development mode", () => {
    hoisted.isDevelopment = true;

    init(buildRouter());

    expect(hoisted.addTrackerMock).not.toHaveBeenCalled();
  });

  it("joins the bus and follows the router when the store has analytics on", () => {
    const router = buildRouter();

    init(router);

    expect(registeredTracker().meta?.name).toBe(TRACKER_NAME);
    expect(hoisted.trackPageViewsMock).toHaveBeenCalledWith(router, hoisted.captureMock);
  });

  function sessionStarts(): number {
    return hoisted.captureMock.mock.calls.filter(([name]) => name === SESSION_START_EVENT).length;
  }

  // Later the landing page, the referrer and the campaign are gone; a visitor who signs in must still have them.
  it("reads how the visit started on the landing page, even for a visitor whose events are not collected", () => {
    history.replaceState(null, "", "/shared-list/3f9c-secret?utm_source=newsletter");

    init(
      createRouter({
        history: createMemoryHistory(),
        routes: [{ path: "/shared-list/:sharingKey", component: { template: "<div />" } }],
      }),
    );
    history.replaceState(null, "", "/");

    expect(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "null")).toMatchObject({
      landing_path: "/shared-list/:sharingKey",
      utm_source: "newsletter",
    });
  });

  it("reports the start of a session once for the same visitor", () => {
    init(buildRouter());
    init(buildRouter());

    expect(sessionStarts()).toBe(1);
  });

  it("reports it again for the customer once they sign in, and for each organization they act for", async () => {
    init(buildRouter());

    isAuthenticated.value = true;
    organization.value = { id: "org-1" };
    await nextTick();

    expect(sessionStarts()).toBe(2);

    organization.value = { id: "org-2" };
    await nextTick();

    expect(sessionStarts()).toBe(3);
  });

  it("passes bus events on under their GA4 names", () => {
    init(buildRouter());
    hoisted.captureMock.mockReset();

    void registeredTracker().events.search?.("bolt", [{ code: "A" }], 3);

    expect(hoisted.captureMock).toHaveBeenCalledWith("search", {
      search_term: "bolt",
      items_count: 3,
      visible_items: "A",
    });
  });

  it("leaves a successful sign-in to the platform", () => {
    init(buildRouter());
    hoisted.captureMock.mockReset();

    void registeredTracker().events.login?.("password", { success: true });

    expect(hoisted.captureMock).not.toHaveBeenCalled();
  });

  it("sends what is queued when the page is hidden or left", () => {
    init(buildRouter());

    window.dispatchEvent(new Event("pagehide"));

    expect(hoisted.flushMock).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(hoisted.flushMock).toHaveBeenCalledTimes(2);

    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(hoisted.flushMock).toHaveBeenCalledTimes(2);
  });
});
