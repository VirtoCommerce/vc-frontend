import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { installThemeSnapshotNavigation, startThemeSnapshot, THEME_SNAPSHOT_REFETCH_TIMEOUT_MS } from "./boot";
import { THEME_SNAPSHOT_GLOBAL } from "./query";
import { useThemeSnapshot } from "./useThemeSnapshot";

const enabled = vi.hoisted(() => ({ value: true }));

vi.mock("./enabled", () => ({ isNewPageBuilderEnabled: () => enabled.value }));

const STORE_ID = "B2B-store";

function snapshotResponse(overrides: { storeId?: string; cultureName?: string; publication?: number } = {}) {
  const cultureName = overrides.cultureName ?? "en-US";
  const publication = overrides.publication ?? 3;

  return {
    data: {
      themeSnapshot: {
        storeId: overrides.storeId ?? STORE_ID,
        cultureName,
        publication,
        content: JSON.stringify({ format: 1, publication, cultureName, templates: {}, brand: {} }),
        menus: [{ name: "main", items: [{ title: "Shoes", url: "/shoes" }] }],
      },
    },
  };
}

function leaveBootRequest(response: Promise<unknown>, cultureName?: string): void {
  (window as unknown as Record<string, unknown>)[THEME_SNAPSHOT_GLOBAL] = {
    variables: { domain: "localhost", cultureName },
    response,
  };
}

/** A router whose first navigation, the application's own, is done. */
async function startRouter() {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: "/:path(.*)", component: {} }] });
  installThemeSnapshotNavigation(router, () => ({ storeId: STORE_ID, cultureName: "en-US" }));
  await router.push("/");
  return router;
}

/** Lets the boot request's chain settle, as it does long before pageContext returns. */
function flushRequests(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

function mockFetch(...bodies: unknown[]) {
  const fetchMock = vi.fn();
  bodies.forEach((body) => fetchMock.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(body) }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("startThemeSnapshot", () => {
  beforeEach(() => {
    enabled.value = true;
    useThemeSnapshot().setPublished(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>)[THEME_SNAPSHOT_GLOBAL];
  });

  it("sends nothing without new_page_builder_enabled", () => {
    enabled.value = false;
    const fetchMock = mockFetch();

    expect(startThemeSnapshot({ domain: "localhost" })).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts the snapshot the inline script requested for the resolved store and language", async () => {
    const fetchMock = mockFetch();
    leaveBootRequest(Promise.resolve(snapshotResponse()));

    const boot = startThemeSnapshot({ domain: "localhost" });
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useThemeSnapshot().published.value?.publication).toBe(3);
    expect(useThemeSnapshot().theme.value?.menus[0].name).toBe("main");
  });

  it("sends the request itself when the inline script did not", async () => {
    const fetchMock = mockFetch(snapshotResponse());

    const boot = startThemeSnapshot({ domain: "localhost", cultureName: "en" });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });

    expect(useThemeSnapshot().published.value?.storeId).toBe(STORE_ID);
  });

  it("asks once more in the language pageContext resolved", async () => {
    const fetchMock = mockFetch(snapshotResponse({ cultureName: "de-DE", publication: 4 }));
    leaveBootRequest(Promise.resolve(snapshotResponse({ cultureName: "en-US" })));

    const boot = startThemeSnapshot({ domain: "localhost" });
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "de-DE" });

    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body) as { variables: unknown };
    expect(body.variables).toEqual({ storeId: STORE_ID, cultureName: "de-DE" });
    expect(useThemeSnapshot().published.value?.cultureName).toBe("de-DE");
  });

  it("asks once more as soon as the context is known, and only once", async () => {
    const fetchMock = mockFetch(snapshotResponse({ cultureName: "de-DE", publication: 4 }));
    leaveBootRequest(Promise.resolve(snapshotResponse({ cultureName: "en-US" })));
    const context = { storeId: STORE_ID, cultureName: "de-DE" };

    const boot = startThemeSnapshot({ domain: "localhost" });
    boot?.prepare(context);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await boot?.settle(context);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(useThemeSnapshot().published.value?.cultureName).toBe("de-DE");
  });

  it("does not ask again when prepared for the language the boot snapshot is in", async () => {
    const fetchMock = mockFetch();
    leaveBootRequest(Promise.resolve(snapshotResponse({ cultureName: "en-US" })));

    const boot = startThemeSnapshot({ domain: "localhost" });
    boot?.prepare({ storeId: STORE_ID, cultureName: "en-US" });
    await flushRequests();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not ask again when the language it asked for is served in the store default language", async () => {
    const fetchMock = mockFetch();
    leaveBootRequest(Promise.resolve(snapshotResponse({ cultureName: "en-US" })), "fr");

    const boot = startThemeSnapshot({ domain: "localhost" });
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "fr-FR" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useThemeSnapshot().published.value?.cultureName).toBe("en-US");
  });

  it("renders the built-in templates when the store has no theme", async () => {
    leaveBootRequest(Promise.resolve({ data: { themeSnapshot: null } }));

    const boot = startThemeSnapshot({ domain: "localhost" });
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });

    expect(useThemeSnapshot().theme.value).toBeUndefined();
    expect(useThemeSnapshot().hasFailed.value).toBe(false);
  });

  it("keeps a late snapshot for the next navigation and retries a failed request on it", async () => {
    let resolveLate: (value: unknown) => void = () => {};
    leaveBootRequest(new Promise((resolve) => (resolveLate = resolve)));
    const router = await startRouter();

    const boot = startThemeSnapshot({ domain: "localhost" });
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });
    resolveLate(snapshotResponse({ publication: 7 }));
    await vi.waitFor(() => expect(useThemeSnapshot().theme.value).toBeUndefined());
    await flushRequests();

    expect(useThemeSnapshot().published.value).toBeUndefined();
    await router.push("/next");
    expect(useThemeSnapshot().published.value?.publication).toBe(7);
  });

  it("asks again on the next navigation after a failure", async () => {
    leaveBootRequest(Promise.reject(new Error("offline")));
    const fetchMock = mockFetch(snapshotResponse({ publication: 9 }));

    const boot = startThemeSnapshot({ domain: "localhost" });
    await flushRequests();
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });
    expect(useThemeSnapshot().hasFailed.value).toBe(true);
    const router = await startRouter();
    expect(fetchMock).not.toHaveBeenCalled();

    await router.push("/a");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await flushRequests();
    await router.push("/b");

    expect(useThemeSnapshot().published.value?.publication).toBe(9);
  });

  it("does not re-render the page when a navigation is cancelled", async () => {
    let resolveLate: (value: unknown) => void = () => {};
    leaveBootRequest(new Promise((resolve) => (resolveLate = resolve)));
    const router = await startRouter();
    router.beforeEach((to) => to.path !== "/blocked");

    const boot = startThemeSnapshot({ domain: "localhost" });
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });
    resolveLate(snapshotResponse({ publication: 7 }));
    await flushRequests();

    await router.push("/blocked");
    expect(useThemeSnapshot().published.value).toBeUndefined();

    await router.push("/next");
    expect(useThemeSnapshot().published.value?.publication).toBe(7);
  });

  it("does not re-render the page when only its query or hash changes", async () => {
    let resolveLate: (value: unknown) => void = () => {};
    leaveBootRequest(new Promise((resolve) => (resolveLate = resolve)));
    const router = await startRouter();
    await router.push("/category");

    const boot = startThemeSnapshot({ domain: "localhost" });
    await boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });
    resolveLate(snapshotResponse({ publication: 7 }));
    await flushRequests();

    await router.replace({ path: "/category", query: { sort: "price" } });
    await router.push({ path: "/category", query: { sort: "price" }, hash: "#reviews" });
    expect(useThemeSnapshot().published.value).toBeUndefined();

    await router.push("/next");
    expect(useThemeSnapshot().published.value?.publication).toBe(7);
  });

  it("does not hold boot longer than the refetch timeout", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    leaveBootRequest(Promise.resolve(snapshotResponse({ storeId: "other-store" })));

    const boot = startThemeSnapshot({ domain: "localhost" });
    await vi.advanceTimersByTimeAsync(0);
    const settled = boot?.settle({ storeId: STORE_ID, cultureName: "en-US" });
    await vi.advanceTimersByTimeAsync(THEME_SNAPSHOT_REFETCH_TIMEOUT_MS);
    await settled;

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(useThemeSnapshot().published.value).toBeUndefined();
  });
});
