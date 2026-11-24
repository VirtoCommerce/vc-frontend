import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { startEngine } from "./engine";
import { vTrackItem } from "./registry";
import { rules } from "./rules";

const { analyticsMock } = vi.hoisted(() => ({ analyticsMock: vi.fn() }));

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ analytics: analyticsMock }),
}));

const PRODUCT = { id: "1", code: "ABC", name: "Laptop", price: { actual: { amount: 999.5 }, list: { amount: 999.5 } } };

const LIST_PROPERTIES = {
  item_list_id: "related_products",
  item_list_name: "Related",
  related_id: "P1",
  related_type: "product",
};

describe("dom-analytics rules", () => {
  let stop: (() => void) | undefined;

  beforeEach(() => {
    analyticsMock.mockClear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
  });

  it("sends viewItemList and selectItem for a product list built from attributes", async () => {
    document.body.innerHTML = `
    <div
      data-vc-track="product-list"
      data-list-id="related_products"
      data-list-name="Related"
      data-related-id="P1"
      data-related-type="product"
    >
      <div
        data-vc-track="product-card"
        data-product-id="1"
        data-product-sku="ABC"
        data-product-name="Laptop"
        data-product-price="999.5"
      >
        <a data-vc-track="product-link">Laptop</a>
      </div>
    </div>`;
    stop = startEngine(rules);
    await flushPromises();

    document.querySelector("a")?.click();

    expect(analyticsMock.mock.calls).toEqual([
      ["viewItemList", [PRODUCT], LIST_PROPERTIES],
      ["selectItem", PRODUCT, { ...LIST_PROPERTIES, index: 0 }],
    ]);
  });

  it("sends the clicked card's position in the list with selectItem", async () => {
    document.body.innerHTML = `
    <div data-vc-track="product-list" data-list-id="related_products">
      <div data-vc-track="product-card" data-product-sku="A"><a data-vc-track="product-link">A</a></div>
      <div data-vc-track="product-card" data-product-sku="B"><a data-vc-track="product-link">B</a></div>
      <div data-vc-track="product-list" data-list-id="nested">
        <div data-vc-track="product-card" data-product-sku="N"><a data-vc-track="product-link">N</a></div>
      </div>
      <div data-vc-track="product-card" data-product-sku="C"><a data-vc-track="product-link">C</a></div>
    </div>`;
    stop = startEngine(rules);
    await flushPromises();
    analyticsMock.mockClear();

    document.querySelectorAll("a")[3]?.click();
    document.querySelectorAll("a")[2]?.click();

    expect(analyticsMock.mock.calls).toEqual([
      ["selectItem", { code: "C" }, { item_list_id: "related_products", index: 2 }],
      ["selectItem", { code: "N" }, { item_list_id: "nested", index: 0 }],
    ]);
  });

  it("takes the position from the products array bound to the list", async () => {
    const products = [
      { id: "1", code: "A" },
      { id: "2", code: "B" },
      { id: "3", code: "C" },
    ];
    mount(
      defineComponent({
        directives: { trackItem: vTrackItem },
        setup: () => ({ products, shown: products.slice(1) }),

        template: `
          <div v-track-item="products" data-vc-track="product-list" data-list-id="carousel">
            <div v-for="product in shown" :key="product.id" v-track-item="product" data-vc-track="product-card">
              <a data-vc-track="product-link">{{ product.code }}</a>
            </div>
          </div>`,
      }),
      { attachTo: document.body },
    );
    stop = startEngine(rules);
    await flushPromises();
    analyticsMock.mockClear();

    document.querySelectorAll("a")[1]?.click();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("selectItem", products[2], {
      item_list_id: "carousel",
      index: 2,
    });
  });

  it("sends no selectItem from a list without list attributes, even though the position is known", async () => {
    document.body.innerHTML = `
    <div data-vc-track="product-list">
      <div data-vc-track="product-card" data-product-sku="A"><a data-vc-track="product-link">A</a></div>
    </div>`;
    stop = startEngine(rules);
    await flushPromises();

    document.querySelector("a")?.click();

    expect(analyticsMock).not.toHaveBeenCalled();
  });

  it("sends nothing for a card outside a product list", async () => {
    document.body.innerHTML = `
      <div data-vc-track="product-card" data-product-sku="ABC"><a data-vc-track="product-link">Laptop</a></div>`;
    stop = startEngine(rules);
    await flushPromises();

    document.querySelector("a")?.click();

    expect(analyticsMock).not.toHaveBeenCalled();
  });

  it("sends viewItem for the product bound to product-details", async () => {
    const product = { id: "1", code: "ABC" };
    const wrapper = mount(
      defineComponent({
        directives: { trackItem: vTrackItem },
        setup: () => ({ product }),
        template: `<div v-track-item="product" data-vc-track="product-details"></div>`,
      }),
      { attachTo: document.body },
    );
    stop = startEngine(rules);
    await flushPromises();

    expect(analyticsMock).toHaveBeenCalledExactlyOnceWith("viewItem", product);
    wrapper.unmount();
  });
});
