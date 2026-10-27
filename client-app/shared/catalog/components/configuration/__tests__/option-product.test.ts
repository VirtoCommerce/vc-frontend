import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { createI18n } from "@/i18n";
import { uiKit } from "@/ui-kit";
import uiKitMessages from "@/ui-kit/locales/en.json";
import enMessages from "../../../../../../locales/en.json";
import OptionProductNone from "../option-product-none.vue";
import OptionProduct from "../option-product.vue";
import type { Product } from "@/core/api/graphql/types";
import type { Component } from "vue";

enableAutoUnmount(afterEach);

function mountOption(component: Component, props: Record<string, unknown>) {
  const i18n = createI18n("en", "USD");
  i18n.global.setLocaleMessage("en", enMessages);
  i18n.global.mergeLocaleMessage("en", uiKitMessages);

  // The title, image and price parts only draw the card; the radio is the real VcRadioButton.
  return mount(component, {
    props,
    global: {
      plugins: [i18n, uiKit],
      stubs: {
        VcProductImage: true,
        VcProductTitle: true,
        VcProductPrice: true,
        VcProductTotal: true,
        VcAddToCart: true,
        VcPriceDisplay: true,
        VcProperty: true,
      },
    },
  });
}

describe("configuration option radios", () => {
  it("names a product option's radio after the product", () => {
    const product = { id: "p-1", slug: "chocolate-tier", name: "Chocolate tier", properties: [] } as unknown as Product;
    const wrapper = mountOption(OptionProduct, { product, name: "section-1" });

    expect(wrapper.get('input[type="radio"]').attributes("aria-label")).toBe("Chocolate tier");
  });

  it('names the None option\'s radio "None"', () => {
    const wrapper = mountOption(OptionProductNone, { name: "section-1" });

    expect(wrapper.get('input[type="radio"]').attributes("aria-label")).toBe("None");
  });
});
