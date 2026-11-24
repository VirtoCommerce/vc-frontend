import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { ENABLED_KEY, SESSION_START_EVENT, TRACKER_NAME } from "./constants";
import type { TrackerType } from "@/core/types/analytics";
import type { Router } from "vue-router";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
  flushMock: vi.fn(),
  addTrackerMock: vi.fn(),
  trackPageViewsMock: vi.fn(),
  enabledKeys: new Set<string>(),
  isDevelopment: false,
}));

vi.mock("./queue", () => ({
  useAnalyticsQueue: () => ({ capture: hoisted.captureMock, flush: hoisted.flushMock }),
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

  it("reports the start of a session once per tab", () => {
    init(buildRouter());
    init(buildRouter());

    expect(hoisted.captureMock.mock.calls.filter(([name]) => name === SESSION_START_EVENT)).toHaveLength(1);
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
