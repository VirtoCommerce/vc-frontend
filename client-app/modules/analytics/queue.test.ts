import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { COLLECT_ANONYMOUS_KEY, FLUSH_DELAY_MS, MAX_BATCH_SIZE } from "./constants";
import type { InputPushAnalyticsEvents } from "./api/graphql/types";

const hoisted = vi.hoisted(() => ({
  pushMock: vi.fn(),
  enabledKeys: new Set<string>(),
}));

const isAuthenticated = ref(true);
const organization = ref<{ id: string } | null>({ id: "org-1" });
const operator = ref<unknown>(null);

vi.mock("./api/graphql/mutations/pushAnalyticsEvents", () => ({
  pushAnalyticsEvents: hoisted.pushMock,
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({ isEnabled: (key: string) => hoisted.enabledKeys.has(key) }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-1", userId: "anonymous-1" },
}));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({
    isAuthenticated,
    user: ref({ id: "user-1", contact: { id: "contact-1" }, permissions: [] }),
    organization,
    operator,
  }),
}));

async function createQueue() {
  const { useAnalyticsQueue } = await import("./queue");
  return useAnalyticsQueue();
}

function sentCommands(): InputPushAnalyticsEvents[] {
  return hoisted.pushMock.mock.calls.map((args: unknown[]) => args[0] as InputPushAnalyticsEvents);
}

describe("useAnalyticsQueue", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    sessionStorage.clear();
    hoisted.pushMock.mockReset().mockResolvedValue(undefined);
    hoisted.enabledKeys.clear();
    isAuthenticated.value = true;
    organization.value = { id: "org-1" };
    operator.value = null;
    history.replaceState(null, "", "/search");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends a captured event after the delay, with who acted and where", async () => {
    const { capture } = await createQueue();

    capture("search", { search_term: "bolt", items_count: 3 });

    expect(hoisted.pushMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    const [command] = sentCommands();
    expect(command.storeId).toBe("store-1");
    expect(command.sessionId).toBeTruthy();
    expect(command.anonymousId).toBeUndefined();
    expect(command.events).toHaveLength(1);
    expect(command.events[0]).toMatchObject({ name: "search", userId: "user-1", organizationId: "org-1" });
    expect(command.events[0].id).toBeTruthy();
    expect(JSON.parse(command.events[0].properties ?? "")).toEqual({ search_term: "bolt", items_count: 3 });
    expect(JSON.parse(command.events[0].context ?? "")).toMatchObject({ path: "/search", landing_path: "/search" });
  });

  it("puts the events of one burst into one request", async () => {
    const { capture } = await createQueue();

    capture("$pageview", { page_type: "product" });
    capture("view_item", { items: [{ item_id: "A" }] });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    expect(hoisted.pushMock).toHaveBeenCalledTimes(1);
    expect(sentCommands()[0].events.map((event) => event.name)).toEqual(["$pageview", "view_item"]);
  });

  it("does not collect an event the platform does not store", async () => {
    const { capture } = await createQueue();

    capture("login", { method: "password", success: false });
    capture("view_item_list", { items: [] });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    expect(hoisted.pushMock).not.toHaveBeenCalled();
  });

  it("drops a signed-out visitor's event unless the store collects them", async () => {
    isAuthenticated.value = false;
    const { capture } = await createQueue();

    capture("search", { search_term: "bolt" });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    expect(hoisted.pushMock).not.toHaveBeenCalled();

    hoisted.enabledKeys.add(COLLECT_ANONYMOUS_KEY);
    capture("search", { search_term: "nut" });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    const [command] = sentCommands();
    expect(command.anonymousId).toBe("anonymous-1");
    expect(command.events[0]).toMatchObject({ userId: "", organizationId: "" });
  });

  it("reads the identity when the action happens, not when the batch leaves", async () => {
    const { capture } = await createQueue();

    capture("search", { search_term: "bolt" });
    organization.value = { id: "org-2" };
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    expect(sentCommands()[0].events[0].organizationId).toBe("org-1");
  });

  it("sends at once on flush and has nothing left to send afterwards", async () => {
    const { capture, flush } = await createQueue();

    capture("search", { search_term: "bolt" });
    flush();
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS * 3);

    expect(hoisted.pushMock).toHaveBeenCalledTimes(1);
  });

  it("splits a long queue into requests the backend reads whole", async () => {
    const { capture } = await createQueue();

    for (let i = 0; i < MAX_BATCH_SIZE + 5; i++) {
      capture("search", { search_term: `term ${i}` });
    }
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    expect(sentCommands().map((command) => command.events.length)).toEqual([MAX_BATCH_SIZE, 5]);
  });

  it("offers a failed batch once more under the same event ids, then drops it", async () => {
    hoisted.pushMock.mockRejectedValue(new Error("offline"));
    const { capture } = await createQueue();

    capture("search", { search_term: "bolt" });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS * 5);

    const ids = sentCommands().map((command) => command.events[0].id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });
});
