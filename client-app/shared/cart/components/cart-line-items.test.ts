import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcQuantityStepper } from "@/ui-kit/components/organisms";
import CartLineItems from "./cart-line-items.vue";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

const createWrapper = createWrapperFactory(mount, CartLineItems, {
  global: {
    components: { VcQuantityStepper, VcInput, VcInputDetails, VcButton },
    mocks: { $cfg: { product_quantity_control: "stepper" } },
    stubs: {
      VcLineItems: {
        props: ["items"],
        template: `<div><div v-for="item in items" :key="item.id"><slot :item="item" /><slot name="after-content" :item="item" /></div></div>`,
      },
      VcAlert: { template: "<div class='alert'><slot /></div>" },
      VcAddToCart: true,
      VcLabel: true,
      VcIcon: true,
      VcTooltip: true,
      InStock: true,
      ConfigurationItems: true,
      CartItemActions: true,
    },
  },
});

const item = {
  id: "line-1",
  quantity: 1,
  product: { id: "product-1", minQuantity: 2, maxQuantity: 5 },
} as unknown as LineItemType;

function lineError(errorCode: string, errorMessage: string): ValidationErrorType {
  return { objectId: "line-1", objectType: "LineItem", errorCode, errorMessage };
}

async function mountWith(validationErrors: ValidationErrorType[]) {
  const wrapper = createWrapper({ props: { items: [item], validationErrors } });
  await nextTick();
  return wrapper;
}

// VCST-5990: the cart sends the typed quantity and the server explains it, but the field was never
// tied to that explanation, so assistive tech heard neither that it was wrong nor why.
describe("CartLineItems quantity errors", () => {
  it("marks the quantity invalid and describes it with the server message", async () => {
    const wrapper = await mountWith([lineError("PRODUCT_MIN_MAX_QTY", "You can order from 2 to 5 items")]);
    const input = wrapper.get("input");
    const describedBy = input.attributes("aria-describedby");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).toContain("You can order from 2 to 5 items");
  });

  it("describes but does not invalidate the quantity for a line error about something else", async () => {
    const wrapper = await mountWith([lineError("PRODUCT_PRICE_INVALID", "Price is invalid")]);
    const input = wrapper.get("input");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(wrapper.get(`#${input.attributes("aria-describedby")}`).text()).toContain("Price is invalid");
  });

  it("does not invalidate a line for a quantity error that belongs to another object", async () => {
    const wrapper = await mountWith([
      lineError("PRODUCT_PRICE_INVALID", "Price is invalid"),
      { ...lineError("PRODUCT_MIN_QTY", "Product quantity 1 is less than minimum 2"), objectId: "product-1" },
    ]);

    expect(wrapper.get("input").attributes("aria-invalid")).toBeUndefined();
  });

  it("leaves the quantity unmarked without line errors", async () => {
    const input = (await mountWith([])).get("input");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });
});
