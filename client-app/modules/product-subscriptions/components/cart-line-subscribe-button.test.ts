import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import CartLineSubscribeButton from "./cart-line-subscribe-button.vue";
import type { PreparedLineItemType } from "@/core/types";

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ isAuthenticated: ref(true) }),
}));

vi.mock("../composables/useCartLineSubscription", () => ({
  useCartLineSubscription: () => ({
    offer: ref({ productId: "product-1" }),
    subscription: ref(undefined),
    openPurchaseOptions: vi.fn(),
  }),
}));

const lineItem = { id: "line-1", productId: "product-1" } as PreparedLineItemType;

function mountButton(props: { readonly?: boolean; disabled?: boolean; icons?: boolean } = {}) {
  return mount(CartLineSubscribeButton, {
    props: { lineItem, ...props },
    global: {
      stubs: { VcButton: { props: ["disabled"], template: "<button :disabled='disabled'><slot /></button>" } },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("CartLineSubscribeButton", () => {
  it("stays on a disabled line, disabled", () => {
    const button = mountButton({ disabled: true }).find("button");

    expect(button.exists()).toBe(true);
    expect(button.attributes("disabled")).toBeDefined();
  });

  it("is not shown on a read-only line", () => {
    expect(mountButton({ readonly: true }).find("button").exists()).toBe(false);
  });

  it("has its own test id in each of the line's two action rows", () => {
    expect(mountButton().get("button").attributes("data-test-id")).toBe("cart-line-subscribe-button-line-1");
    expect(mountButton({ icons: true }).get("button").attributes("data-test-id")).toBe(
      "cart-line-subscribe-icon-button-line-1",
    );
  });
});
