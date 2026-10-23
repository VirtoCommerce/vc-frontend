import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcPriceDisplay, VcProperty } from "@/ui-kit/components/atoms";
import { VcLineItem, VcProductPrice } from "@/ui-kit/components/molecules";
import type { MoneyType } from "@/core/api/graphql/types";

function money(amount: number): MoneyType {
  return { amount, formattedAmount: `$${amount}` } as MoneyType;
}

const LIST_PRICE = money(100);
const ACTUAL_PRICE = money(90);

const PROPERTY_PRICE_SELECTOR = ".vc-line-item__property-price .vc-property__value";
const WIDE_PRICE_SELECTOR = ".vc-line-item__price .vc-product-price__actual";

const createWrapper = createWrapperFactory(mount, VcLineItem, {
  global: {
    components: {
      VcProperty,
      VcProductPrice,
      VcPriceDisplay,
    },
    stubs: {
      VcCheckbox: true,
      VcImage: true,
      VcProductTitle: true,
      VcButton: true,
    },
  },
});

function mountLineItem(showPlacedPrice: boolean) {
  return createWrapper({
    props: {
      name: "Product",
      withPrice: true,
      listPrice: LIST_PRICE,
      actualPrice: ACTUAL_PRICE,
      showPlacedPrice,
    },
  });
}

describe("VcLineItem — price per item (VCST-6375)", () => {
  it("narrow 'Price per item' shows the list price when showPlacedPrice is false", () => {
    const wrapper = mountLineItem(false);

    expect(wrapper.find(PROPERTY_PRICE_SELECTOR).text()).toBe(LIST_PRICE.formattedAmount);
  });

  it("narrow 'Price per item' shows the actual price when showPlacedPrice is true", () => {
    const wrapper = mountLineItem(true);

    expect(wrapper.find(PROPERTY_PRICE_SELECTOR).text()).toBe(ACTUAL_PRICE.formattedAmount);
  });

  it.each([false, true])("narrow and wide price slots agree when showPlacedPrice is %s", (showPlacedPrice) => {
    const wrapper = mountLineItem(showPlacedPrice);

    expect(wrapper.find(PROPERTY_PRICE_SELECTOR).text()).toBe(wrapper.find(WIDE_PRICE_SELECTOR).text());
  });
});
