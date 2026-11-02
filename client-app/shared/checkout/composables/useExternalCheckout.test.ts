import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent, ref } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import { useExternalCheckout } from "./useExternalCheckout";

const DummyComponent = defineComponent({ name: "DummyComponent" });

describe("useExternalCheckout", () => {
  beforeEach(() => {
    useExtensionRegistry().unregister("checkout", EXTENSION_NAMES.checkout.placeOrder);
    useExternalCheckout().setSections({});
  });

  it("is false when no module takes over the place-order step", () => {
    const { isExternalCheckout } = useExternalCheckout();

    expect(isExternalCheckout.value).toBe(false);
  });

  it("follows the registered entry's condition", () => {
    const isActive = ref(false);
    useExtensionRegistry().register("checkout", EXTENSION_NAMES.checkout.placeOrder, {
      component: DummyComponent,
      condition: () => isActive.value,
    });

    const { isExternalCheckout } = useExternalCheckout();
    expect(isExternalCheckout.value).toBe(false);

    isActive.value = true;
    expect(isExternalCheckout.value).toBe(true);
  });

  it("keeps the sections the provider sets", () => {
    const { sections, setSections } = useExternalCheckout();

    setSections({ shipping: true, payment: false });

    expect(sections.value).toEqual({ shipping: true, payment: false });
  });
});
