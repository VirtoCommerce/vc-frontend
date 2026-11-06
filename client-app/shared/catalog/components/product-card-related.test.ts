import { shallowMount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { vTrackItem } from "@/core/plugins/dom-analytics/registry";
import { createI18n } from "@/i18n";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { uiKit } from "@/ui-kit";
import ProductCardRelated from "./product-card-related.vue";
import type { Product } from "@/core/api/graphql/types";
import ExtensionPointList from "@/shared/common/components/extension-point-list.vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

const PRODUCT = {
  id: "drill",
  name: "Drill",
  slug: "drill",
  hasVariations: false,
  isConfigurable: false,
  images: [],
  price: { actual: { amount: 10 }, list: { amount: 10 } },
} as unknown as Product;

const ProductAction = defineComponent({
  name: "ProductAction",
  props: { product: { type: Object, required: true } },
  template: "<button type='button'>compare</button>",
});

/** The action row sits in the media slot, which a stubbed card shell would not render. */
const ProductCardStub = defineComponent({
  name: "VcProductCard",

  setup(_props, { slots }) {
    return () => h("div", [slots.media?.(), slots.default?.()]);
  },
});

function mountCard() {
  return shallowMount(ProductCardRelated, {
    props: { product: PRODUCT },
    global: {
      plugins: [createI18n("en", "USD"), uiKit],
      directives: { trackItem: vTrackItem },
      components: { ExtensionPoint, ExtensionPointList },
      stubs: { VcProductCard: ProductCardStub, ExtensionPoint: false, ExtensionPointList: false },
      renderStubDefaultSlot: true,
    },
  });
}

afterEach(() => {
  useExtensionRegistry().unregister("productActions", "compare");
});

describe("ProductCardRelated", () => {
  it("renders a product action right after Add to list, for the card's product", () => {
    useExtensionRegistry().register("productActions", "compare", {
      component: ProductAction,
      condition: (product) => product.id === PRODUCT.id,
    });

    const wrapper = mountCard();
    const action = wrapper.getComponent(ProductAction);

    expect(action.props("product")).toEqual(PRODUCT);
    expect(wrapper.getComponent({ name: "AddToList" }).element.nextElementSibling).toBe(action.element);
  });
});
