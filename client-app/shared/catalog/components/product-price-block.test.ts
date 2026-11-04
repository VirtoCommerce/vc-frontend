import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { applyContributions, resetDeclaredSlots } from "@/core/federation/contributions/declare";
import { resetPluginStatuses, setPluginStatus } from "@/core/federation/contributions/status";
import ProductPriceBlock from "./product-price-block.vue";
import type { ConfigurationSectionInput, Product } from "@/core/api/graphql/types";
import type { Component } from "vue";
import ExtensionPointList from "@/shared/common/components/extension-point-list.vue";
import ExtensionPoint from "@/shared/common/components/extension-point.vue";

type EntryType = { component?: Component; condition?: (product: Product) => boolean };

const h = vi.hoisted(
  (): {
    entries: Record<string, Record<string, EntryType>>;
    selectedConfigurationInput: ConfigurationSectionInput[];
  } => ({ entries: {}, selectedConfigurationInput: [] }),
);

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({
    getComponent: (category: string, name: string) => h.entries[category]?.[name]?.component ?? null,
    getContribution: () => undefined,
    getEntries: (category: string) => h.entries[category] ?? {},
    getProps: () => undefined,
    isRegistered: (category: string, name: string) => Boolean(h.entries[category]?.[name]?.component),
    passesCondition: (category: string, name: string, product: Product) =>
      h.entries[category]?.[name]?.condition?.(product) ?? true,
  }),
}));

vi.mock("@/shared/catalog/composables", () => ({
  useConfigurableLineItemId: () => ({ configurableLineItemId: ref() }),
  useConfigurableProduct: () => ({ selectedConfigurationInput: ref(h.selectedConfigurationInput) }),
}));

vi.mock("@/shared/wishlists", () => ({
  AddToList: { name: "AddToList", template: "<button type='button'>list</button>" },
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock("./product-price.vue", () => ({ default: { name: "ProductPrice", render: () => null } }));
vi.mock("./configuration/product-configuration-checklist.vue", () => ({
  default: { name: "ProductConfigurationChecklist", render: () => null },
}));

const RESERVE = "[data-test-id='extension-point-reserve-section']";

const PRODUCT = { id: "drill", name: "Drill", isConfigurable: true } as Product;

const TEXT_SECTION: ConfigurationSectionInput = { sectionId: "engraving", type: "Text", customText: "Hi" };
const PRODUCT_SECTION: ConfigurationSectionInput = {
  sectionId: "battery",
  type: "Product",
  option: { productId: "battery-2ah", quantity: 1 },
};
const FILE_SECTION: ConfigurationSectionInput = { sectionId: "logo", type: "File", fileUrls: ["/files/logo.png"] };

const ProductAction = defineComponent({
  name: "ProductAction",

  props: {
    product: { type: Object, required: true },
    configurationSections: { type: Array, default: undefined },
  },

  template: "<button type='button'>compare</button>",
});

const VcWidgetStub = { name: "VcWidget", template: "<div><slot /><slot name='footer-container' /></div>" };
const VcPopoverStub = { name: "VcPopover", template: "<div />" };

function register(entry: EntryType) {
  h.entries = { productActions: { compare: entry } };
}

function declareReserve() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { template: "<div />" } }],
  });
  const context = { setting: () => true, themeSetting: () => undefined, isAuthenticated: true, can: () => true };
  setPluginStatus("product-comparison", "pending");
  applyContributions(
    "product-comparison",
    { format: 1, slots: [{ at: "productActions/compare", policy: "reserve" }] },
    context,
    router,
  );
}

function mountPriceBlock(product: Product = PRODUCT) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { render: () => null } }],
  });

  return mount(ProductPriceBlock, {
    props: { product },
    global: {
      plugins: [router],
      components: { ExtensionPoint, ExtensionPointList },
      stubs: {
        VcWidget: VcWidgetStub,
        VcPopover: VcPopoverStub,
        VcIcon: true,
        VcImage: true,
        VcLink: true,
        VcLoader: true,
      },
      mocks: { $t: (key: string) => key, $cfg: { social_sharing_services: [] } },
    },
  });
}

beforeEach(() => {
  h.entries = {};
  h.selectedConfigurationInput = [TEXT_SECTION, FILE_SECTION, PRODUCT_SECTION];
  resetPluginStatuses();
  resetDeclaredSlots();
});

describe("ProductPriceBlock product actions", () => {
  it("renders a registered action right after Add to list, with the product and the selection minus File sections", () => {
    register({ component: ProductAction });

    const wrapper = mountPriceBlock();
    const action = wrapper.getComponent(ProductAction);

    expect(action.props("product")).toEqual(PRODUCT);
    expect(action.props("configurationSections")).toEqual([TEXT_SECTION, PRODUCT_SECTION]);
    expect(action.classes()).toContain("product-price-block__action");
    expect(wrapper.getComponent({ name: "AddToList" }).element.nextElementSibling).toBe(action.element);
  });

  it("leaves the row to the host's own actions when nothing is registered", () => {
    const wrapper = mountPriceBlock();

    expect(wrapper.getComponent({ name: "AddToList" }).element.nextElementSibling).toBe(
      wrapper.getComponent(VcPopoverStub).element,
    );
  });

  it("shows an action only for a product its condition accepts", () => {
    register({ component: ProductAction, condition: (product) => !product.isConfigurable });

    expect(
      mountPriceBlock({ ...PRODUCT, isConfigurable: false })
        .findComponent(ProductAction)
        .exists(),
    ).toBe(true);
    expect(mountPriceBlock().findComponent(ProductAction).exists()).toBe(false);
  });

  it("holds a declared action's place in the row while its plugin loads, then shows the action", async () => {
    declareReserve();
    register({ component: ProductAction });

    const wrapper = mountPriceBlock();
    const reserve = wrapper.get(RESERVE);

    expect(reserve.attributes("data-slot")).toBe("productActions/compare");
    expect(reserve.classes()).toContain("product-price-block__action");
    expect(wrapper.getComponent({ name: "AddToList" }).element.nextElementSibling).toBe(reserve.element);
    expect(wrapper.findComponent(ProductAction).exists()).toBe(false);

    setPluginStatus("product-comparison", "loaded");
    await flushPromises();

    expect(wrapper.find(RESERVE).exists()).toBe(false);
    expect(wrapper.findComponent(ProductAction).exists()).toBe(true);
  });
});
