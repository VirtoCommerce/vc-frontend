import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcAddToCart, VcQuantityStepper } from "@/ui-kit/components/organisms";
import QuoteLineItems from "./quote-line-items.vue";
import type { QuoteItemType } from "../api/graphql/types";

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

function createWrapper(mode: "stepper" | "button") {
  return createWrapperFactory(mount, QuoteLineItems, {
    global: {
      components: { VcQuantityStepper, VcAddToCart, VcInput, VcInputDetails, VcButton },
      mocks: { $cfg: { product_quantity_control: mode } },
      stubs: {
        VcLineItems: { template: "<div><slot name='line-items' /></div>" },
        VcLineItem: { template: "<div><slot /></div>" },
        VcAlert: true,
        VcLabel: true,
        VcIcon: true,
        VcTooltip: { template: '<div><slot name="trigger" /></div>' },
        ConfigurationItems: true,
      },
    },
  })({ props: { items: [{ id: "quote-item-1", productId: "product-1" } as QuoteItemType] } });
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("QuoteLineItems quantity without a tier quantity", () => {
  it("announces the invalid state with the text that explains it", async () => {
    const wrapper = createWrapper("stepper");
    await settle();

    const input = wrapper.get("input");
    const describedBy = input.attributes("aria-describedby");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(describedBy).toBeTruthy();
    expect(wrapper.get(`#${describedBy}`).text()).not.toBe("");
  });

  it("does not mark the button-mode field invalid without a message to describe it", async () => {
    const wrapper = createWrapper("button");
    await settle();

    expect(wrapper.get("input").attributes("aria-invalid")).toBeUndefined();
  });
});
