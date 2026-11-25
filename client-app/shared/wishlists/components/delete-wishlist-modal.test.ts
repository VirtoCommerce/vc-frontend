import { cleanup, configure, render } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { focusFirstElement } from "@/ui-kit/utilities/focus";
import DeleteWishlistModal from "./delete-wishlist-modal.vue";
import type { WishlistType } from "@/core/api/graphql/types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

configure({ testIdAttribute: "data-test-id" });

vi.mock("../composables", async () => {
  const { ref } = await import("vue");
  return { useWishlists: () => ({ loading: ref(false), removeWishlist: vi.fn() }) };
});

const VcModal = defineComponent({
  emits: { close: () => true },

  setup(_, { slots, emit }) {
    return () =>
      h("div", { "data-test-id": "modal" }, [slots.default?.(), slots.actions?.({ close: () => emit("close") })]);
  },
});

function renderModal() {
  return render(DeleteWishlistModal, {
    props: { list: { id: "list-1", name: "Spring assortment" } as WishlistType },
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

describe("DeleteWishlistModal", () => {
  it("opens on Cancel, not on the destructive button", () => {
    const { getByTestId } = renderModal();

    // `VcDialog` gives the initial focus through this helper.
    focusFirstElement(getByTestId("modal"), {});

    expect(document.activeElement).toBe(getByTestId("cancel-button"));
  });
});
