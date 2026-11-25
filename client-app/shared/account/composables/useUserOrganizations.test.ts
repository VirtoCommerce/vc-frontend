import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

type RequestType = {
  args: { after?: string; searchPhrase?: string };
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

// requests: sent and not yet taken by takeRequest(), oldest first.
const hoisted = vi.hoisted(() => ({
  requests: [] as RequestType[],
}));

vi.mock("@/core/api/graphql/account", () => ({
  getOrganizations: vi.fn(
    (args: RequestType["args"]) =>
      new Promise((resolve, reject) => {
        hoisted.requests.push({ args, resolve, reject });
      }),
  ),
}));

vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  Logger: { error: vi.fn() },
}));

// Rows from..from + count - 1; a cursor means another page follows.
function page(from: number, count: number, totalCount: number, endCursor?: string) {
  return {
    items: Array.from({ length: count }, (_, i) => ({ id: `org-${from + i}`, name: `Org ${from + i}` })),
    pageInfo: { hasNextPage: !!endCursor, endCursor },
    totalCount,
  };
}

function takeRequest(): RequestType {
  const request = hoisted.requests.shift();
  if (!request) {
    throw new Error("No request was sent");
  }
  return request;
}

// The composable loads on mount, so it starts inside a component, with the first page on its way.
async function start() {
  const { useUserOrganizations } = await import("./useUserOrganizations");
  const Host = defineComponent({
    setup() {
      useUserOrganizations();
      return () => null;
    },
  });

  mount(Host);
  await flushPromises();
  return useUserOrganizations();
}

// 30 of 60 rows shown, the next page behind cursor "c1".
async function startWithFirstPage() {
  const state = await start();
  takeRequest().resolve(page(0, 30, 60, "c1"));
  await flushPromises();
  return state;
}

beforeEach(() => {
  // useUserOrganizations is session state: each case starts with a fresh one.
  vi.resetModules();
  hoisted.requests.length = 0;
});

describe("useUserOrganizations: answers nobody waits for", () => {
  // The panel opened again while the previous open's next page was on its way.
  it("drops a next page that lands after the same phrase was searched again", async () => {
    const state = await startWithFirstPage();
    void state.loadOrganizations();
    const nextPage = takeRequest();
    expect(nextPage.args.after).toBe("c1");

    void state.search();
    nextPage.resolve(page(30, 30, 60));
    await flushPromises();

    expect(state.organizations.value).toHaveLength(0);
    const firstPage = takeRequest();
    expect(firstPage.args).toMatchObject({ after: undefined, searchPhrase: "" });

    firstPage.resolve(page(0, 30, 60, "c1"));
    await flushPromises();

    expect(state.organizations.value.map((item) => item.id)).toEqual(page(0, 30, 60).items.map((item) => item.id));
    expect(state.hasNextPage.value).toBe(true);
  });

  it("keeps loading until the latest request answers", async () => {
    const state = await startWithFirstPage();
    void state.search();
    const superseded = takeRequest();

    state.reset();
    void state.search();
    const latest = takeRequest();

    superseded.resolve(page(0, 30, 60, "c1"));
    await flushPromises();
    expect(state.loading.value).toBe(true);
    expect(state.organizations.value).toHaveLength(0);

    latest.resolve(page(0, 15, 15));
    await flushPromises();
    expect(state.loading.value).toBe(false);
    expect(state.organizations.value).toHaveLength(15);
  });

  it("swallows the failure of a superseded request", async () => {
    const state = await startWithFirstPage();
    const supersededCall = state.search();
    const superseded = takeRequest();

    state.reset();
    void state.search();
    takeRequest();

    superseded.reject(new Error("network"));

    await expect(supersededCall).resolves.toBeUndefined();
    expect(state.loading.value).toBe(true);
  });

  it("rethrows the failure of the current request and stops loading", async () => {
    const state = await startWithFirstPage();
    const call = state.search();
    const error = new Error("network");

    takeRequest().reject(error);

    await expect(call).rejects.toBe(error);
    expect(state.loading.value).toBe(false);
  });
});

describe("useUserOrganizations: the field changes while a page loads", () => {
  it("asks the next page for the phrase of the list it continues", async () => {
    const state = await startWithFirstPage();
    state.searchPhrase.value = "Merc";

    void state.loadOrganizations();

    expect(takeRequest().args).toMatchObject({ after: "c1", searchPhrase: "" });
  });

  it("counts all organizations from an answer for no phrase", async () => {
    const state = await start();
    state.searchPhrase.value = "Merc";

    takeRequest().resolve(page(0, 15, 15));
    await flushPromises();

    expect(state.totalOrganizations.value).toBe(15);
    expect(state.isShowSearch.value).toBe(true);
  });
});
