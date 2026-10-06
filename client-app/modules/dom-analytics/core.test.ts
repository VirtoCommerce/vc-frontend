import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { startEngine } from "./core";
import { vTrackItem } from "./registry";
import type { RuleType } from "./types";

const { analyticsMock } = vi.hoisted(() => ({ analyticsMock: vi.fn() }));

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ analytics: analyticsMock }),
}));

const LIST_PARAMS = {
  source: "object",
  from: "product-list",
  optional: true,
  fields: { item_list_id: { attr: "listId" }, item_list_name: { attr: "listName" } },
} as const;

const SELECT_ITEM: RuleType = {
  event: "selectItem",
  trigger: "click",
  target: "product-link",
  args: [{ source: "item", from: "product-card" }, LIST_PARAMS],
};

const VIEW_ITEM_LIST: RuleType = {
  event: "viewItemList",
  trigger: "appear",
  target: "product-list",
  args: [{ source: "collect", target: "product-card" }, LIST_PARAMS],
};

const ProductList = defineComponent({
  directives: { trackItem: vTrackItem },
  props: { products: { type: Array as () => { code: string }[], required: true } },

  template: `
    <div data-name="product-list" data-list-id="related" data-list-name="Related">
      <div v-for="product in products" :key="product.code" v-track-item="product" data-name="product-card">
        <a data-name="product-link" :data-test-id="product.code"><span>{{ product.code }}</span></a>
      </div>
    </div>
  `,
});

async function flush(): Promise<void> {
  await nextTick();
  await Promise.resolve();
}

describe("dom-analytics engine", () => {
  let stop: (() => void) | undefined;

  beforeEach(() => {
    analyticsMock.mockClear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
  });

  it("sends selectItem with the card object and list params on a nested click", async () => {
    const a = { code: "A" };
    const wrapper = mount(ProductList, { props: { products: [a] }, attachTo: document.body });
    stop = startEngine([SELECT_ITEM]);

    await wrapper.find("[data-test-id='A'] span").trigger("click");

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("selectItem", a, {
      item_list_id: "related",
      item_list_name: "Related",
    });
    wrapper.unmount();
  });

  it("does not send when a required argument is missing", () => {
    document.body.innerHTML = `<div data-name="product-card"><a data-name="product-link">x</a></div>`;
    stop = startEngine([SELECT_ITEM]);

    document.querySelector("a")?.click();

    expect(analyticsMock).not.toHaveBeenCalled();
  });

  it("builds the item from attributes when no object is bound", () => {
    document.body.innerHTML = `
      <div data-name="product-card" data-sku="ABC" data-price="9.5">
        <a data-name="product-link">x</a>
      </div>`;
    stop = startEngine([
      {
        event: "selectItem",
        trigger: "click",
        target: "product-link",
        args: [
          {
            source: "item",
            from: "product-card",
            fallback: {
              source: "object",
              fields: { code: { attr: "sku" }, "price.actual.amount": { attr: "price", type: "number" } },
            },
          },
        ],
      },
    ]);

    document.querySelector("a")?.click();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("selectItem", {
      code: "ABC",
      price: { actual: { amount: 9.5 } },
    });
  });

  it("walks up past an ancestor whose rule does not resolve", () => {
    document.body.innerHTML = `
      <div data-name="banner" data-promo="summer">
        <div data-name="product-card"><a data-name="product-link">x</a></div>
      </div>`;
    stop = startEngine([
      SELECT_ITEM,
      { event: "search", trigger: "click", target: "banner", args: [{ source: "attr", attr: "promo" }] },
    ]);

    document.querySelector("a")?.click();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("search", "summer");
  });

  it("sends viewItemList once per distinct products array", async () => {
    const a = { code: "A" };
    const b = { code: "B" };
    const products = ref([a]);
    const wrapper = mount(
      defineComponent({
        components: { ProductList },
        setup: () => ({ products }),
        template: `<ProductList :products="products" />`,
      }),
      { attachTo: document.body },
    );
    stop = startEngine([VIEW_ITEM_LIST]);
    await flush();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("viewItemList", [a], {
      item_list_id: "related",
      item_list_name: "Related",
    });

    products.value = [a];
    await flush();
    expect(analyticsMock).toHaveBeenCalledTimes(1);

    products.value = [a, b];
    await flush();
    expect(analyticsMock).toHaveBeenCalledTimes(2);
    expect(analyticsMock).toHaveBeenLastCalledWith("viewItemList", [a, b], expect.any(Object));
    wrapper.unmount();
  });

  it("sends appear again only when the bound entity changes on the same element", async () => {
    const product = ref({ id: "1", code: "A" });
    const wrapper = mount(
      defineComponent({
        directives: { trackItem: vTrackItem },
        setup: () => ({ product }),
        template: `<div v-track-item="product" data-name="product-details">{{ product.code }}</div>`,
      }),
      { attachTo: document.body },
    );
    stop = startEngine([
      { event: "viewItem", trigger: "appear", target: "product-details", args: [{ source: "item" }] },
    ]);
    await flush();

    product.value = { id: "1", code: "A" };
    await flush();
    product.value = { id: "2", code: "B" };
    await flush();

    expect(analyticsMock.mock.calls).toEqual([
      ["viewItem", { id: "1", code: "A" }],
      ["viewItem", { id: "2", code: "B" }],
    ]);
    wrapper.unmount();
  });

  it("stops listening after dispose", async () => {
    document.body.innerHTML = `<div data-name="product-card" data-sku="A"><a data-name="product-link">x</a></div>`;
    startEngine([
      {
        event: "selectItem",
        trigger: "click",
        target: "product-link",
        args: [{ source: "attr", from: "product-card", attr: "sku" }],
      },
    ])();

    document.querySelector("a")?.click();
    await flush();

    expect(analyticsMock).not.toHaveBeenCalled();
  });
});
