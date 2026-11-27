import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { COLLECT_ANONYMOUS_KEY, FLUSH_DELAY_MS, MAX_BATCH_SIZE, MAX_PROPERTIES_LENGTH } from "../constants";
import type { InputPushAnalyticsEvents } from "../api/graphql/types";

const hoisted = vi.hoisted(() => ({
  pushMock: vi.fn(),
  enabledKeys: new Set<string>(),
}));

const isAuthenticated = ref(true);
const organization = ref<{ id: string } | null>({ id: "org-1" });
const operator = ref<unknown>(null);

vi.mock("../api/graphql/mutations/pushAnalyticsEvents", () => ({
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
  const { useAnalyticsQueue } = await import("./useAnalyticsQueue");
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
    const context = JSON.parse(command.events[0].context ?? "") as Record<string, unknown>;
    expect(context).toMatchObject({ path: "/search", landing_path: "/search" });
    expect(context).not.toHaveProperty("id");
  });

  it("takes the page path from the module's resolver, and from the caller when the action is reported later", async () => {
    const { capture, setPagePathResolver } = await createQueue();
    setPagePathResolver(() => "/shared-list/:sharingKey");
    const viewedAt = new Date("2026-11-24T10:00:00.000Z");

    capture("search", { search_term: "bolt" });
    capture("$pageview", { page_type: "product" }, { path: "/bolts/carriage-bolt", occurredAt: viewedAt });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    const [search, pageView] = sentCommands()[0].events;
    expect(JSON.parse(search.context ?? "")).toMatchObject({ path: "/shared-list/:sharingKey" });
    expect(JSON.parse(pageView.context ?? "")).toMatchObject({ path: "/bolts/carriage-bolt" });
    expect(pageView.occurredAt).toBe(viewedAt.toISOString());
  });

  it("sends an event too long for the backend without its item list, and skips one that is still too long", async () => {
    const { capture } = await createQueue();
    const items = Array.from({ length: 400 }, (_, i) => ({
      item_id: `SKU-${i}`,
      item_name: "A product with a long name",
    }));

    capture("add_to_cart", { value: 120, items_count: items.length, items });
    capture("search", { search_term: "x".repeat(MAX_PROPERTIES_LENGTH) });
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS);

    const { events } = sentCommands()[0];
    expect(events).toHaveLength(1);
    expect(JSON.parse(events[0].properties ?? "")).toEqual({ value: 120, items_count: 400 });
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

    expect(hoisted.pushMock).toHaveBeenCalledTimes(1);

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

  it("sends a failed batch again ahead of what was captured meanwhile, in requests of the allowed size", async () => {
    hoisted.pushMock.mockRejectedValueOnce(new Error("offline"));
    const { capture, flush } = await createQueue();

    for (let i = 0; i < MAX_BATCH_SIZE; i++) {
      capture("search", { search_term: `first ${i}` });
    }
    capture("search", { search_term: "later" });
    await vi.advanceTimersByTimeAsync(0);
    flush();
    await vi.advanceTimersByTimeAsync(FLUSH_DELAY_MS * 2);

    const [failed, retried, rest] = sentCommands();
    expect(retried.events.map((event) => event.id)).toEqual(failed.events.map((event) => event.id));
    expect(rest.events.map((event) => JSON.parse(event.properties ?? "") as unknown)).toEqual([
      { search_term: "later" },
    ]);
  });
});
