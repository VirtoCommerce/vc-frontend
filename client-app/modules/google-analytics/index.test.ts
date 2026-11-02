import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { effectScope, nextTick } from "vue";
import type { EffectScope } from "vue";

type FakeUserType = {
  contact?: { id: string; organization?: { id: string; name?: string } };
  operator?: { userName: string };
  permissions?: string[];
};

const hoisted = vi.hoisted(() => ({
  settings: { trackId: "G-TEST", isEnabled: true, gtmContainerId: "" },
  hasModuleSettings: true,
  // Assigned by the mock factory below, which is where a real `ref` can be created.
  userRef: undefined as unknown as { value: FakeUserType | undefined },
  addTrackerMock: vi.fn(),
  useScriptTagMock: vi.fn(),
}));

// Partial: the rest of the package is pulled in transitively (the logger's `noop`, among others).
vi.mock("@vueuse/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@vueuse/core")>()),
  useScriptTag: hoisted.useScriptTagMock,
}));

vi.mock("@/core/composables", () => ({
  useCurrency: () => ({ currentCurrency: { value: { code: "USD" } } }),
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

vi.mock("@/core/globals", () => ({ globals: { cultureName: "en-US" } }));

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

vi.mock("./events", () => ({ events: {} }));

const { init } = await import("./index");
const { USER_PROPERTY_NAMES } = await import("./user-properties");
const { deferLogin } = await import("./pending-login");

const SIGNED_IN: FakeUserType = {
  contact: { id: "contact-1", organization: { id: "org-1", name: "Acme" } },
  permissions: ["sales-rep:access"],
};

// `window.gtag` pushes its raw `arguments` object, so a gtag call and a plain data-layer push are both
// entries in the same array — normalizing lets one assertion cover their relative order.
function layer(): unknown[][] {
  return window.dataLayer.map((entry) => (isArrayLike(entry) ? Array.from(entry) : [entry]));
}

function isArrayLike(value: unknown): value is ArrayLike<unknown> {
  return typeof value === "object" && value !== null && typeof (value as { length?: unknown }).length === "number";
}

function indexOfGtagCall(command: string, target?: string): number {
  return layer().findIndex(([first, second]) => first === command && (target === undefined || second === target));
}

function lastUserProperties(): Record<string, string | null> {
  const calls = layer().filter(([first, second]) => first === "set" && second === "user_properties");

  return calls[calls.length - 1][2] as Record<string, string | null>;
}

/**
 * A cleared property has to be *present* and null. An absent or `undefined` one is exactly the bug: gtag `set`
 * merges, and GA keeps the browser's most recent value, so the previous identity stays in place.
 */
function expectCleared(properties: Record<string, string | null>, name: string): void {
  expect(Object.prototype.hasOwnProperty.call(properties, name)).toBe(true);
  expect(properties[name]).toBeNull();
}

function loginEvents(): unknown[][] {
  return layer().filter(([first, second]) => first === "event" && second === "login");
}

describe("google-analytics init", () => {
  let scope: EffectScope;

  // The watcher lives for the app's lifetime by design, so tests own a scope to stop it — otherwise every
  // earlier test's watcher would still be reacting to the shared user ref.
  async function initInScope(): Promise<void> {
    let pending!: Promise<void>;
    scope.run(() => {
      pending = init();
    });
    await pending;
  }

  beforeEach(() => {
    scope = effectScope();
    hoisted.settings = { trackId: "G-TEST", isEnabled: true, gtmContainerId: "" };
    hoisted.hasModuleSettings = true;
    hoisted.userRef.value = SIGNED_IN;
    hoisted.addTrackerMock.mockReset();
    hoisted.useScriptTagMock.mockReset();
    window.dataLayer = [];
    sessionStorage.clear();
  });

  afterEach(() => {
    scope.stop();
  });

  it("sets the user properties before config, so the initial page_view carries them", async () => {
    await initInScope();

    const setIndex = indexOfGtagCall("set", "user_properties");
    const configIndex = indexOfGtagCall("config");

    expect(setIndex).toBeGreaterThanOrEqual(0);
    expect(configIndex).toBeGreaterThanOrEqual(0);
    expect(setIndex).toBeLessThan(configIndex);
  });

  it("sends the identity built from the signed-in user", async () => {
    await initInScope();

    const properties = lastUserProperties();

    expect(properties[USER_PROPERTY_NAMES.contactId]).toBe("contact-1");
    expect(properties[USER_PROPERTY_NAMES.organizationId]).toBe("org-1");
    expect(properties[USER_PROPERTY_NAMES.sessionKind]).toBe("self");
  });

  it("still sets — cleared — properties for an anonymous visitor", async () => {
    hoisted.userRef.value = undefined;

    await initInScope();

    expect(indexOfGtagCall("set", "user_properties")).toBeGreaterThanOrEqual(0);
    expectCleared(lastUserProperties(), USER_PROPERTY_NAMES.contactId);
    expect(lastUserProperties()[USER_PROPERTY_NAMES.sessionKind]).toBe("anonymous");
  });

  // The page a sign-in lands on sends its login: after `config`, under the identity it has just applied.
  it("sends a pending login after config, as the signed-in user", async () => {
    deferLogin("password", { success: true });

    await initInScope();

    const [login] = loginEvents();
    expect(login?.[2]).toEqual({ success: true, method: "password" });
    expect(layer().findIndex(([first, second]) => first === "event" && second === "login")).toBeGreaterThan(
      indexOfGtagCall("config"),
    );
  });

  it("sends nothing for a pending login when the page it lands on is signed out", async () => {
    deferLogin("password", { success: true });
    hoisted.userRef.value = undefined;

    await initInScope();
    hoisted.userRef.value = SIGNED_IN;
    await initInScope();

    expect(loginEvents()).toHaveLength(0);
  });

  it("clears the identity when another tab signs the user out", async () => {
    await initInScope();
    expect(lastUserProperties()[USER_PROPERTY_NAMES.contactId]).toBe("contact-1");

    hoisted.userRef.value = undefined;
    await nextTick();

    expectCleared(lastUserProperties(), USER_PROPERTY_NAMES.contactId);
    expectCleared(lastUserProperties(), USER_PROPERTY_NAMES.organizationId);
  });

  it("drops the previous organization when the next identity has none", async () => {
    await initInScope();

    hoisted.userRef.value = { contact: { id: "contact-2" }, permissions: [] };
    await nextTick();

    expect(lastUserProperties()[USER_PROPERTY_NAMES.contactId]).toBe("contact-2");
    expectCleared(lastUserProperties(), USER_PROPERTY_NAMES.organizationId);
  });

  it("pushes the identity to the data layer for a GTM-only store, which never reaches config", async () => {
    hoisted.settings = { trackId: "", isEnabled: true, gtmContainerId: "GTM-TEST" };

    await initInScope();

    expect(indexOfGtagCall("config")).toBe(-1);
    // A plain push, not a gtag call: GTM reads data-layer variables, not gtag's internal state.
    const pushed = (window.dataLayer as Record<string, string>[]).find(
      (entry) => entry?.[USER_PROPERTY_NAMES.contactId] === "contact-1",
    );
    expect(pushed?.[USER_PROPERTY_NAMES.organizationId]).toBe("org-1");
  });

  // GTM walks the data layer in order, and a tag firing on gtm.js reads only what came before it — so an
  // identity pushed after it left every landing page_view untagged.
  it("pushes the identity ahead of GTM's gtm.js entry", async () => {
    hoisted.settings = { trackId: "", isEnabled: true, gtmContainerId: "GTM-TEST" };

    await initInScope();

    const entries = window.dataLayer as Record<string, string>[];
    const identity = entries.findIndex((entry) => entry?.[USER_PROPERTY_NAMES.contactId] === "contact-1");
    const gtmJs = entries.findIndex((entry) => entry?.event === "gtm.js");

    expect(identity).toBeGreaterThanOrEqual(0);
    expect(gtmJs).toBeGreaterThan(identity);
  });

  it("does not push to the data layer when no GTM container is configured", async () => {
    await initInScope();

    const pushed = (window.dataLayer as Record<string, string>[]).find(
      (entry) => entry?.[USER_PROPERTY_NAMES.contactId] === "contact-1",
    );
    expect(pushed).toBeUndefined();
  });

  it("touches nothing at all when the module is disabled", async () => {
    hoisted.settings = { trackId: "G-TEST", isEnabled: false, gtmContainerId: "" };
    const sentinel = { untouched: true };
    window.dataLayer = [sentinel];

    await initInScope();

    expect(window.dataLayer).toEqual([sentinel]);
    expect(hoisted.addTrackerMock).not.toHaveBeenCalled();
  });
});
