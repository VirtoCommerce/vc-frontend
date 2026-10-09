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
      ["selectItem", PRODUCT, LIST_PROPERTIES],
    ]);
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
