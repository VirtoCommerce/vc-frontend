import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ID_LOCAL_STORAGE } from "@/core/constants";
import PunchoutSessionPage from "./punchout-session.vue";

const authorizeWithGrant = vi.fn();
const startSession = vi.fn();
const endSession = vi.fn();
const emit = vi.fn(() => Promise.resolve());
const replace = vi.fn(() => Promise.resolve());

vi.mock("vue-router", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ authorizeWithGrant }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

vi.mock("@/shared/broadcast", () => ({
  TabsType: { ALL: "all", OTHERS: "others" },
  reloadAndOpenMainPage: "reload-and-open-main-page",
  useBroadcast: () => ({ emit }),
}));

vi.mock("../composables/usePunchoutSession", () => ({
  usePunchoutSession: () => ({ startSession, endSession }),
}));

function mountPage() {
  return mount(PunchoutSessionPage, {
    props: { sessionToken: "session-token" },
    global: { stubs: { VcLoaderOverlay: true } },
  });
}

enableAutoUnmount(afterEach);

describe("punchout session page", () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(USER_ID_LOCAL_STORAGE, "previous-user-id");
    Object.defineProperty(globalThis, "location", { value: { href: "" }, writable: true, configurable: true });
  });

  afterEach(() => {
    localStorage.clear();
    Object.defineProperty(globalThis, "location", { value: originalLocation, writable: true, configurable: true });
  });

  it("drops the previous user id and reloads the other tabs on a successful grant", async () => {
    authorizeWithGrant.mockResolvedValue({ access_token: "token", token_type: "Bearer", expires_in: 3600 });

    mountPage();
    await flushPromises();

    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBeNull();
    expect(startSession).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith("reload-and-open-main-page", null, "others");
    expect(globalThis.location.href).toBe("/");
    expect(replace).not.toHaveBeenCalled();
  });

  it("keeps the current user and the other tabs untouched and shows the no-access page when the grant fails", async () => {
    authorizeWithGrant.mockResolvedValue({ error: "invalid_grant" });

    mountPage();
    await flushPromises();

    expect(localStorage.getItem(USER_ID_LOCAL_STORAGE)).toBe("previous-user-id");
    expect(startSession).not.toHaveBeenCalled();
    expect(endSession).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
    expect(globalThis.location.href).toBe("");
    expect(replace).toHaveBeenCalledWith({ name: "NoAccess" });
  });
});
