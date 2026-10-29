import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import type { EffectScope } from "vue";
import type { Router } from "vue-router";

type FakeUserType = {
  id: string;
  contact?: { id: string; organization?: { id: string } };
  operator?: { userName: string };
  permissions?: string[];
};

type SettingsType = Record<string, string | boolean | undefined>;

const hoisted = vi.hoisted(() => {
  const settings: SettingsType = {};

  return {
    settings,
    hasModuleSettings: true,
    // Assigned by the mock factory below, which is where a real `ref` can be created.
    userRef: undefined as unknown as { value: FakeUserType | undefined },
    addTrackerMock: vi.fn(),
    posthog: {
      init: vi.fn(),
      capture: vi.fn(),
      identify: vi.fn(),
      group: vi.fn(),
      reset: vi.fn(),
    },
    failSdkImport: false,
  };
});

// A getter, so one registry serves both outcomes: the mocked module is cached across `vi.resetModules()`.
vi.mock("posthog-js", () => ({
  get default() {
    if (hoisted.failSdkImport) {
      throw new Error("Failed to fetch dynamically imported module");
    }
    return hoisted.posthog;
  },
}));

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ addTracker: hoisted.addTrackerMock }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({
    getModuleSettings: () => hoisted.settings,
    hasModuleSettings: {
      get value() {
        return hoisted.hasModuleSettings;
      },
    },
  }),
}));

// Real refs, not stubs: the watcher under test only fires if these track. `user` throws while empty,
// mirroring the composable it stands in for.
vi.mock("@/shared/account", async () => {
  const { ref, computed } = await import("vue");
  const user = ref<FakeUserType | undefined>(undefined);
  hoisted.userRef = user;

  return {
    useUser: () => ({
      isAuthenticated: computed(() => Boolean(user.value)),
      user: computed(() => {
        if (!user.value) {
          throw new Error("User is missing.");
        }
        return user.value;
      }),
      organization: computed(() => user.value?.contact?.organization ?? null),
      operator: computed(() => user.value?.operator ?? null),
    }),
  };
});

vi.mock("./events", () => ({ events: { viewItem: () => undefined } }));

const { init } = await import("./index");
const { setClient } = await import("./client");
const { deferLogin } = await import("./pending-login");

const SIGNED_IN: FakeUserType = {
  id: "user-1",
  contact: { id: "contact-1", organization: { id: "org-1" } },
  permissions: [],
};

function enabledSettings(overrides: SettingsType = {}): SettingsType {
  return { isEnabled: true, projectToken: "phc_test", ...overrides };
}

function buildRouter(): Router {
  return {
    afterEach: vi.fn(),
    isReady: () => Promise.resolve(),
    currentRoute: { value: { name: "Home", path: "/" } },
  } as unknown as Router;
}

function initOptions(): Record<string, unknown> {
  return hoisted.posthog.init.mock.calls[0][1] as Record<string, unknown>;
}

describe("posthog init", () => {
  let scope: EffectScope;

  // The watcher lives for the app's lifetime by design, so tests own a scope to stop it — otherwise every
  // earlier test's watcher would still be reacting to the shared user ref.
  async function initInScope(router: Router = buildRouter()): Promise<void> {
    let pending!: Promise<void>;
    scope.run(() => {
      pending = init(router);
    });
    await pending;
  }

  beforeEach(() => {
    scope = effectScope();
    hoisted.settings = enabledSettings();
    hasModuleSettings(true);
    hoisted.userRef.value = SIGNED_IN;
    hoisted.addTrackerMock.mockReset();
    Object.values(hoisted.posthog).forEach((fn) => fn.mockReset());
    sessionStorage.clear();
    localStorage.clear();
    setClient(undefined);
  });

  afterEach(() => {
    scope.stop();
  });

  function hasModuleSettings(value: boolean): void {
    hoisted.hasModuleSettings = value;
  }

  it("initializes the SDK with the token and the pilot defaults", async () => {
    await initInScope();

    expect(hoisted.posthog.init).toHaveBeenCalledWith("phc_test", expect.anything());
    expect(initOptions()).toMatchObject({
      api_host: "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      person_profiles: "identified_only",
      disable_session_recording: true,
    });
  });

  it("applies the host, autocapture and recording settings", async () => {
    hoisted.settings = enabledSettings({
      apiHost: "https://eu.i.posthog.com",
      isAutocaptureEnabled: true,
      isSessionRecordingEnabled: true,
    });

    await initInScope();

    expect(initOptions()).toMatchObject({
      api_host: "https://eu.i.posthog.com",
      autocapture: true,
      disable_session_recording: false,
    });
  });

  it("registers the tracker with the module events and the extension", async () => {
    const extra = (): undefined => undefined;

    await init(buildRouter(), { extendEvents: () => ({ search: extra }) });

    expect(hoisted.addTrackerMock).toHaveBeenCalledTimes(1);
    const [tracker] = hoisted.addTrackerMock.mock.calls[0];
    expect(tracker.meta.name).toBe("posthog");
    expect(tracker.events.viewItem).toBeTypeOf("function");
    expect(tracker.events.search).toBe(extra);
  });

  it("identifies the signed-in user before the first page view", async () => {
    await initInScope();

    expect(hoisted.posthog.identify).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ contact_id: "contact-1" }),
    );
    expect(hoisted.posthog.group).toHaveBeenCalledWith("organization", "org-1");
    expect(hoisted.posthog.identify.mock.invocationCallOrder[0]).toBeLessThan(
      hoisted.posthog.capture.mock.invocationCallOrder[0],
    );
    expect(hoisted.posthog.capture).toHaveBeenCalledWith("$pageview", { route_name: "Home" });
  });

  it("re-identifies when another tab signs in as someone else", async () => {
    await initInScope();

    hoisted.userRef.value = { id: "user-2", contact: { id: "contact-2" } };
    await nextTick();

    expect(hoisted.posthog.identify).toHaveBeenLastCalledWith(
      "user-2",
      expect.objectContaining({ contact_id: "contact-2" }),
    );
  });

  // The page a sign-in lands on sends its login, under the identity it has just applied.
  it("sends a pending login after identifying", async () => {
    deferLogin("password", { success: true });

    await initInScope();

    expect(hoisted.posthog.capture).toHaveBeenCalledWith("login", { success: true, method: "password" });
    const loginOrder =
      hoisted.posthog.capture.mock.invocationCallOrder[
        hoisted.posthog.capture.mock.calls.findIndex(([name]) => name === "login")
      ];
    expect(hoisted.posthog.identify.mock.invocationCallOrder[0]).toBeLessThan(loginOrder);
  });

  it("drops a pending login when the page it lands on is signed out", async () => {
    deferLogin("password", { success: true });
    hoisted.userRef.value = undefined;

    await initInScope();

    expect(hoisted.posthog.capture).not.toHaveBeenCalledWith("login", expect.anything());
  });

  it("resets a signed-out page that was identified before", async () => {
    hoisted.userRef.value = undefined;
    localStorage.setItem("vc-posthog-identified", "1");

    await initInScope();

    expect(hoisted.posthog.reset).toHaveBeenCalledTimes(1);
    expect(hoisted.posthog.identify).not.toHaveBeenCalled();
  });

  it.each([
    ["the module is disabled", () => (hoisted.settings = enabledSettings({ isEnabled: false }))],
    ["the store has no module settings", () => hasModuleSettings(false)],
    ["the token is missing", () => (hoisted.settings = enabledSettings({ projectToken: "" }))],
  ])("does nothing when %s", async (_name, arrange) => {
    arrange();

    await initInScope();

    expect(hoisted.posthog.init).not.toHaveBeenCalled();
    expect(hoisted.addTrackerMock).not.toHaveBeenCalled();
  });

  it("degrades to no tracking when the SDK chunk fails to load", async () => {
    hoisted.failSdkImport = true;

    try {
      await expect(initInScope()).resolves.toBeUndefined();
    } finally {
      hoisted.failSdkImport = false;
    }

    expect(hoisted.posthog.init).not.toHaveBeenCalled();
    expect(hoisted.addTrackerMock).not.toHaveBeenCalled();
  });
});
