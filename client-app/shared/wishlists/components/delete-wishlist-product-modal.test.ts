import { cleanup, configure, render } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { findFirstFocusableElement } from "@/ui-kit/utilities/focus";
import DeleteWishlistProductModal from "./delete-wishlist-product-modal.vue";
import type { LineItemType } from "@/core/api/graphql/types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

configure({ testIdAttribute: "data-test-id" });

vi.mock("../composables/useWishlists", () => ({
  useWishlists: () => ({ removeItemsFromWishlists: vi.fn() }),
}));

const VcModal = defineComponent({
  emits: { close: () => true },

  setup(_, { slots, emit }) {
    return () =>
      h("div", { "data-test-id": "modal" }, [slots.default?.(), slots.actions?.({ close: () => emit("close") })]);
  },
});

function renderModal() {
  return render(DeleteWishlistProductModal, {
    props: { listItem: { id: "item-1", name: "Desk lamp" } as LineItemType, listId: "list-1" },
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

describe("DeleteWishlistProductModal", () => {
  it("opens on Cancel, not on the destructive button", () => {
    const { getByTestId } = renderModal();

    // `VcDialog` gives the initial focus to the element this helper returns.
    expect(findFirstFocusableElement(getByTestId("modal"), {})).toBe(getByTestId("cancel-button"));
  });
});
