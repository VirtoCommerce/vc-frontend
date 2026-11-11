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

function getNarrowPrice(wrapper: ReturnType<typeof mountLineItem>) {
  return wrapper.findComponent({ name: "VcProperty" }).findComponent({ name: "VcProductPrice" });
}

function getWidePrice(wrapper: ReturnType<typeof mountLineItem>) {
  const property = wrapper.findComponent({ name: "VcProperty" }).element;
  return wrapper.findAllComponents({ name: "VcProductPrice" }).filter((price) => !property.contains(price.element))[0];
}

describe("VcLineItem price per item", () => {
  it("shows the list price in the narrow slot when showPlacedPrice is false", () => {
    const wrapper = mountLineItem(false);

    expect(getNarrowPrice(wrapper).props("listPrice")).toEqual(LIST_PRICE);
  });

  it("shows the actual price in the narrow slot when showPlacedPrice is true", () => {
    const wrapper = mountLineItem(true);

    expect(getNarrowPrice(wrapper).props("listPrice")).toEqual(ACTUAL_PRICE);
  });

  it.each([false, true])(
    "shows the same price in the narrow and wide slots when showPlacedPrice is %s",
    (showPlacedPrice) => {
      const wrapper = mountLineItem(showPlacedPrice);

      expect(getNarrowPrice(wrapper).props("listPrice")).toEqual(getWidePrice(wrapper).props("actualPrice"));
    },
  );
});
