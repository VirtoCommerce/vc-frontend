import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { rescan, startEngine } from "./engine";
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

const SELECT_BY_SKU: RuleType = {
  event: "selectItem",
  trigger: "click",
  target: "product-link",
  args: [{ source: "attr", from: "product-card", attr: "sku" }, LIST_PARAMS],
};

const ProductList = defineComponent({
  directives: { trackItem: vTrackItem },
  props: { products: { type: Array as () => { id?: string; code: string }[], required: true } },

  template: `
    <div data-name="product-list" data-list-id="related" data-list-name="Related">
      <div v-for="product in products" :key="product.code" v-track-item="product" data-name="product-card">
        <a data-name="product-link" :data-test-id="product.code"><span>{{ product.code }}</span></a>
      </div>
    </div>
  `,
});

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
    const c = { code: "C" };
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
    await flushPromises();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("viewItemList", [a], {
      item_list_id: "related",
      item_list_name: "Related",
    });

    document.body.append(document.createElement("i"));
    await flushPromises();
    expect(analyticsMock).toHaveBeenCalledTimes(1);

    products.value = [a, b];
    await flushPromises();
    expect(analyticsMock).toHaveBeenCalledTimes(2);
    expect(analyticsMock).toHaveBeenLastCalledWith("viewItemList", [a, b], expect.any(Object));

    products.value = [a, c];
    await flushPromises();
    expect(analyticsMock).toHaveBeenCalledTimes(3);
    expect(analyticsMock).toHaveBeenLastCalledWith("viewItemList", [a, c], expect.any(Object));

    document.querySelector<HTMLElement>("[data-name='product-list']")?.setAttribute("data-list-id", "similar");
    document.body.append(document.createElement("i"));
    await flushPromises();
    expect(analyticsMock).toHaveBeenCalledTimes(4);
    expect(analyticsMock).toHaveBeenLastCalledWith("viewItemList", [a, c], {
      item_list_id: "similar",
      item_list_name: "Related",
    });
    wrapper.unmount();
  });

  it("does not resend viewItemList for a refetched list with the same ids", async () => {
    stop = startEngine([VIEW_ITEM_LIST]);
    const wrapper = mount(ProductList, { props: { products: [{ id: "1", code: "A" }] }, attachTo: document.body });
    await flushPromises();

    await wrapper.setProps({ products: [{ id: "1", code: "A" }] });
    await flushPromises();

    expect(analyticsMock.mock.calls.filter(([event]) => event === "viewItemList")).toHaveLength(1);
    wrapper.unmount();
  });

  it("applies rules added after start", async () => {
    document.body.innerHTML = `
      <div data-name="promo" data-term="sale"></div>
      <div data-name="product-card" data-sku="A"><button data-name="product-link">x</button></div>`;
    const rules: RuleType[] = [];
    stop = startEngine(rules);
    await flushPromises();

    rules.push(SELECT_BY_SKU, {
      event: "search",
      trigger: "appear",
      target: "promo",
      args: [{ source: "attr", attr: "term" }],
    });
    rescan();
    await flushPromises();
    document.querySelector("button")?.click();

    expect(analyticsMock.mock.calls).toEqual([
      ["search", "sale"],
      ["selectItem", "A", undefined],
    ]);
  });

  it("sends appear again only when the bound entity changes on the same element", async () => {
    const product = ref({ id: "1", code: "A", price: { amount: 1 } });
    const wrapper = mount(
      defineComponent({
        directives: { trackItem: vTrackItem },
        setup: () => ({ product }),
        // No text bound to the product: only the directive update can trigger a rescan
        template: `<div v-track-item="product" data-name="product-details"></div>`,
      }),
      { attachTo: document.body },
    );
    stop = startEngine([
      { event: "viewItem", trigger: "appear", target: "product-details", args: [{ source: "item" }] },
    ]);
    await flushPromises();

    product.value = { id: "1", code: "A", price: { amount: 1 } };
    await flushPromises();
    product.value = { id: "2", code: "B", price: { amount: 2 } };
    await flushPromises();

    expect(analyticsMock.mock.calls).toEqual([
      ["viewItem", { id: "1", code: "A", price: { amount: 1 } }],
      ["viewItem", { id: "2", code: "B", price: { amount: 2 } }],
    ]);
    wrapper.unmount();
  });

  it("ignores a click on the role element outside its link", () => {
    document.body.innerHTML = `
      <div data-name="product-card" data-sku="A">
        <div data-name="product-link"><a>x</a><span data-test-id="gap">gap</span></div>
      </div>`;
    stop = startEngine([SELECT_BY_SKU]);

    document.querySelector<HTMLElement>("[data-test-id='gap']")?.click();
    expect(analyticsMock).not.toHaveBeenCalled();

    document.querySelector("a")?.click();
    expect(analyticsMock).toHaveBeenCalledOnce();
  });

  it("sends even when the link stops propagation", () => {
    document.body.innerHTML = `<div data-name="product-card" data-sku="A"><a data-name="product-link">x</a></div>`;
    document.querySelector("a")?.addEventListener("click", (e) => e.stopPropagation());
    stop = startEngine([SELECT_BY_SKU]);

    document.querySelector("a")?.click();

    expect(analyticsMock).toHaveBeenCalledOnce();
  });

  it("sends only for the innermost matching role", () => {
    document.body.innerHTML = `
      <div data-name="banner" data-promo="summer">
        <div data-name="product-card" data-sku="A"><a data-name="product-link">x</a></div>
      </div>`;
    stop = startEngine([
      SELECT_BY_SKU,
      { event: "search", trigger: "click", target: "banner", args: [{ source: "attr", attr: "promo" }] },
    ]);

    document.querySelector("a")?.click();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("selectItem", "A", undefined);
  });

  it("drops attributes that are empty or not a number", () => {
    document.body.innerHTML = `
      <div data-name="product-card" data-sku="A" data-price="abc" data-vendor="" data-stock="">
        <a data-name="product-link">x</a>
      </div>`;
    stop = startEngine([
      {
        event: "selectItem",
        trigger: "click",
        target: "product-link",
        args: [
          {
            source: "object",
            from: "product-card",
            fields: {
              code: { attr: "sku" },
              price: { attr: "price", type: "number" },
              vendor: { attr: "vendor" },
              stock: { attr: "stock", type: "number" },
            },
          },
        ],
      },
    ]);

    document.querySelector("a")?.click();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("selectItem", { code: "A" });
  });

  it("collects only the cards that resolve to an item", async () => {
    document.body.innerHTML = `
      <div data-name="product-list" data-list-id="related">
        <div data-name="product-card" data-sku="A"></div>
        <div data-name="product-card"></div>
      </div>`;
    stop = startEngine([
      {
        event: "viewItemList",
        trigger: "appear",
        target: "product-list",
        args: [
          {
            source: "collect",
            target: "product-card",
            fallback: { source: "object", fields: { code: { attr: "sku" } } },
          },
        ],
      },
    ]);
    await flushPromises();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("viewItemList", [{ code: "A" }]);
  });

  it("does not send viewItemList for a list without cards", async () => {
    document.body.innerHTML = `<div data-name="product-list" data-list-id="related"></div>`;
    stop = startEngine([VIEW_ITEM_LIST]);
    await flushPromises();

    expect(analyticsMock).not.toHaveBeenCalled();
  });

  it("stops appear tracking after dispose", async () => {
    startEngine([{ event: "search", trigger: "appear", target: "promo", args: [{ source: "attr", attr: "term" }] }])();

    document.body.innerHTML = `<div data-name="promo" data-term="sale"></div>`;
    await flushPromises();

    expect(analyticsMock).not.toHaveBeenCalled();
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
    await flushPromises();

    expect(analyticsMock).not.toHaveBeenCalled();
  });
});
