import { afterEach, describe, expect, it } from "vitest";
import { ref } from "vue";
import { useCheckoutGuards } from "./useCheckoutGuards";

// Modules block Place order through guards (a terms checkbox, for one); the button reads `canPlaceOrder`.
describe("useCheckoutGuards", () => {
  const { registerGuard, unregisterGuard, canPlaceOrder } = useCheckoutGuards();

  afterEach(() => {
    unregisterGuard("a");
    unregisterGuard("b");
  });

  it("allows the order when no guard is registered", () => {
    expect(canPlaceOrder.value).toBe(true);
  });

  it("blocks while a guard says no, and follows its getter", () => {
    const accepted = ref(false);
    registerGuard("a", { canPlaceOrder: () => accepted.value });

    expect(canPlaceOrder.value).toBe(false);

    accepted.value = true;
    expect(canPlaceOrder.value).toBe(true);
  });

  it("allows the order again once the guard is unregistered", () => {
    const unregister = registerGuard("a", { canPlaceOrder: false });
    expect(canPlaceOrder.value).toBe(false);

    unregister();
    expect(canPlaceOrder.value).toBe(true);
  });

  it("needs every guard to allow the order", () => {
    const first = ref(true);
    const second = ref(false);
    registerGuard("a", { canPlaceOrder: first });
    registerGuard("b", { canPlaceOrder: second });

    expect(canPlaceOrder.value).toBe(false);

    second.value = true;
    expect(canPlaceOrder.value).toBe(true);

    first.value = false;
    expect(canPlaceOrder.value).toBe(false);
  });
});
