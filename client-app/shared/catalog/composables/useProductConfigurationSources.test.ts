import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import {
  registerProductConfigurationSource,
  resetProductConfigurationSources,
  useProductConfigurationSources,
} from "./useProductConfigurationSources";
import type { ConfigurationSectionInput } from "@/core/api/graphql/types";
import type { LocalConfigurationItemType } from "@/shared/catalog/types";
import type { Ref } from "vue";

const logger = vi.hoisted(() => ({ error: vi.fn() }));

vi.mock("@/core/utilities", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/utilities")>()),
  Logger: logger,
}));

const PARAM = "compareItemId";

const SECTIONS: ConfigurationSectionInput[] = [
  { sectionId: "color", type: "Product", option: { productId: "red", quantity: 2 } },
  { sectionId: "engraving", type: "Text", customText: "Hi" },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

async function openProductPage(query: Record<string, string>, productId: Ref<string> = ref("p1")) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/product/:productId", component: { render: () => null } }],
  });
  await router.push({ path: `/product/${productId.value}`, query });

  let initialConfiguration!: Readonly<Ref<LocalConfigurationItemType[] | undefined>>;
  const Page = defineComponent({
    setup() {
      ({ initialConfiguration } = useProductConfigurationSources(productId));
      return () => null;
    },
  });
  mount(Page, { global: { plugins: [router] } });
  await flushPromises();

  return { router, productId, preselected: () => initialConfiguration.value };
}

// The sources are app-wide, so a page left mounted would answer the next test's registrations too.
enableAutoUnmount(afterEach);

beforeEach(() => {
  resetProductConfigurationSources();
  logger.error.mockReset();
});

describe("useProductConfigurationSources", () => {
  it("asks a source registered after the page opened, and preselects its sections in the configurator's shape", async () => {
    const page = await openProductPage({ [PARAM]: "item-1" });
    expect(page.preselected()).toBeUndefined();

    const resolve = vi.fn(() => Promise.resolve(SECTIONS));
    registerProductConfigurationSource(PARAM, resolve);
    await flushPromises();

    expect(resolve).toHaveBeenCalledExactlyOnceWith("item-1", "p1");
    expect(page.preselected()).toEqual([
      { ...SECTIONS[0], productId: "red", quantity: 2, id: "color" },
      { ...SECTIONS[1], id: "engraving" },
    ]);
  });

  it("keeps the defaults when the source has nothing for the value", async () => {
    const resolve = vi.fn((value: string) => Promise.resolve(value === "item-1" ? SECTIONS : undefined));
    registerProductConfigurationSource(PARAM, resolve);

    const page = await openProductPage({ [PARAM]: "unknown" });

    expect(resolve).toHaveBeenCalledExactlyOnceWith("unknown", "p1");
    expect(page.preselected()).toBeUndefined();
  });

  it("asks again for another product, and drops the answer still on its way for the previous one", async () => {
    const forFirst = deferred<ConfigurationSectionInput[] | undefined>();
    const forSecond = deferred<ConfigurationSectionInput[] | undefined>();
    const resolve = vi.fn((_value: string, productId: string) =>
      productId === "p1" ? forFirst.promise : forSecond.promise,
    );
    registerProductConfigurationSource(PARAM, resolve);

    const page = await openProductPage({ [PARAM]: "item-1" });
    page.productId.value = "p2";
    await flushPromises();
    forFirst.resolve(SECTIONS);
    await flushPromises();

    expect(resolve).toHaveBeenLastCalledWith("item-1", "p2");
    expect(page.preselected()).toBeUndefined();

    forSecond.resolve([SECTIONS[1]]);
    await flushPromises();

    expect(page.preselected()).toEqual([{ ...SECTIONS[1], id: "engraving" }]);
  });

  it("does not ask again when another query parameter changes, so the buyer's selection stays", async () => {
    const resolve = vi.fn(() => Promise.resolve(SECTIONS));
    registerProductConfigurationSource(PARAM, resolve);
    const page = await openProductPage({ [PARAM]: "item-1" });

    await page.router.replace({ query: { [PARAM]: "item-1", lineItemId: "line-1" } });
    await flushPromises();

    expect(resolve).toHaveBeenCalledOnce();
  });

  it("uses the source registered last for a parameter", async () => {
    const first = vi.fn(() => Promise.resolve(SECTIONS));
    const second = vi.fn(() => Promise.resolve([SECTIONS[0]]));
    registerProductConfigurationSource(PARAM, first);
    registerProductConfigurationSource(PARAM, second);

    const page = await openProductPage({ [PARAM]: "item-1" });

    expect(first).not.toHaveBeenCalled();
    expect(page.preselected()).toEqual([{ ...SECTIONS[0], productId: "red", quantity: 2, id: "color" }]);
  });

  it("asks nothing when the URL carries no parameter a source claims", async () => {
    const resolve = vi.fn(() => Promise.resolve(SECTIONS));
    registerProductConfigurationSource(PARAM, resolve);

    const page = await openProductPage({ configuration: "item-1" });

    expect(resolve).not.toHaveBeenCalled();
    expect(page.preselected()).toBeUndefined();
  });

  it("logs a failing source and keeps the defaults", async () => {
    registerProductConfigurationSource(PARAM, () => Promise.reject(new Error("offline")));

    const page = await openProductPage({ [PARAM]: "item-1" });

    expect(page.preselected()).toBeUndefined();
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
