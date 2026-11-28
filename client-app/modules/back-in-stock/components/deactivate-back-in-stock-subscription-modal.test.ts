import { cleanup, configure, render } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { focusFirstElement } from "@/ui-kit/utilities/focus";
import DeactivateBackInStockSubscriptionModal from "./deactivate-back-in-stock-subscription-modal.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

configure({ testIdAttribute: "data-test-id" });

vi.mock("@/core/globals", () => ({ globals: { storeId: "store-1" } }));
vi.mock("../composables/useBackInStockSubscriptions", async () => {
  const { ref } = await import("vue");
  return { useBackInStockSubscriptions: () => ({ fetching: ref(false), deactivateSubscription: vi.fn() }) };
});

const VcModal = defineComponent({
  emits: { close: () => true },

  setup(_, { slots, emit }) {
    return () =>
      h("div", { "data-test-id": "modal" }, [slots.default?.(), slots.actions?.({ close: () => emit("close") })]);
  },
});

function renderModal() {
  return render(DeactivateBackInStockSubscriptionModal, {
    props: { productId: "product-1", productName: "Desk lamp" },
    global: {
      components: { VcModal, VcButton },
      mocks: { $t: (key: string) => key },
      stubs: { "i18n-t": true, VcIcon: true },
    },
  });
}

afterEach(() => {
  cleanup();
});

describe("DeactivateBackInStockSubscriptionModal", () => {
  it("opens on Cancel, not on the destructive button", () => {
    const { getByTestId } = renderModal();

    // `VcDialog` gives the initial focus through this helper.
    focusFirstElement(getByTestId("modal"), {});

    expect(document.activeElement).toBe(getByTestId("cancel-button"));
  });
});
