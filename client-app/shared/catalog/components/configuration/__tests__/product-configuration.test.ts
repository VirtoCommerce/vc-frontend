import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useConfigurationSectionNavigation } from "@/shared/catalog/composables/useConfigurationSectionNavigation";
import ProductConfiguration from "../product-configuration.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn(),
}));

vi.mock("@/shared/common", () => ({ SaveChangesModal: {} }));

vi.mock("@/shared/modal", () => ({
  useModal: () => ({ openModal: vi.fn() }),
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ info: vi.fn(), error: vi.fn(), clear: vi.fn() }),
}));

// The section navigation event bus stays real: it is the contract between the checklist and this component.
vi.mock("@/shared/catalog/composables", async () => {
  const { ref } = await import("vue");
  const navigation = await vi.importActual<
    typeof import("@/shared/catalog/composables/useConfigurationSectionNavigation")
  >("@/shared/catalog/composables/useConfigurationSectionNavigation");

  return {
    ...navigation,
    useConfigurableLineItemId: () => ({ configurableLineItemId: ref(undefined) }),
    useConfigurableProduct: () => ({
      fetchProductConfiguration: vi.fn(),
      selectSectionValue: vi.fn(),
      selectedConfiguration: ref({}),
      selectedConfigurationInput: ref([]),
      isConfigurationChanged: ref(false),
      validateSections: vi.fn(),
      changeCartConfiguredItem: vi.fn(),
      validationErrors: ref(new Map()),
      isRequiredConfigurationComplete: ref(false),
      loading: ref(false),
      updateWithPreselectedValues: vi.fn(),
      isSectionVisible: () => true,
    }),
  };
});

const configuration = ["layers", "filling", "icing"].map(
  (id) => ({ id, name: id, type: "Product", isRequired: false, options: [] }) as unknown as ConfigurationSectionType,
);

let mountedWrapper: { unmount: () => void } | undefined;

function mountConfiguration() {
  const wrapper = mount(ProductConfiguration, {
    props: { productId: "configurable-product", configuration },
    attachTo: document.body,
    global: {
      components: { VcWidget },
      stubs: { VcIcon: true, VcShape: true, OptionProductNone: true },
      mocks: { $t: (key: string) => key },
    },
  });
  mountedWrapper = wrapper;
  return wrapper;
}

function getSection(wrapper: ReturnType<typeof mountConfiguration>, sectionId: string) {
  return wrapper.get(`#product-configuration-section-${sectionId}`);
}

// Visibility of the section content (our own markup), not VcWidget internals
function isExpanded(wrapper: ReturnType<typeof mountConfiguration>, sectionId: string) {
  return getSection(wrapper, sectionId).get(".product-configuration__items").isVisible();
}

function getSectionHeader(wrapper: ReturnType<typeof mountConfiguration>, sectionId: string) {
  return getSection(wrapper, sectionId).get(".vc-widget__header-container");
}

describe("ProductConfiguration sections", () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    // Unmount so the previous test's navigation listener does not react to the next test's requests
    mountedWrapper?.unmount();
    mountedWrapper = undefined;
    document.body.innerHTML = "";
  });

  it("expands only the first section initially", () => {
    const wrapper = mountConfiguration();

    expect(["layers", "filling", "icing"].map((sectionId) => isExpanded(wrapper, sectionId))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("reveals a section on navigation request: expands it before scrolling, then focuses its header", async () => {
    const wrapper = mountConfiguration();
    const expandedAtScroll: boolean[] = [];
    scrollIntoView.mockImplementation(() => expandedAtScroll.push(isExpanded(wrapper, "icing")));

    useConfigurationSectionNavigation().navigateToSection("icing");
    await flushPromises();

    expect(expandedAtScroll).toEqual([true]);
    expect(scrollIntoView.mock.contexts).toEqual([getSection(wrapper, "icing").element]);
    expect(document.activeElement).toBe(getSectionHeader(wrapper, "icing").element);
  });

  it("keeps an already expanded section open on navigation request", async () => {
    const wrapper = mountConfiguration();

    useConfigurationSectionNavigation().navigateToSection("layers");
    await flushPromises();

    expect(isExpanded(wrapper, "layers")).toBe(true);
    expect(document.activeElement).toBe(getSectionHeader(wrapper, "layers").element);
  });

  it("expands again a section the user has collapsed", async () => {
    const wrapper = mountConfiguration();

    await getSectionHeader(wrapper, "layers").trigger("click");
    expect(isExpanded(wrapper, "layers")).toBe(false);

    useConfigurationSectionNavigation().navigateToSection("layers");
    await flushPromises();

    expect(isExpanded(wrapper, "layers")).toBe(true);
  });

  it("ignores a request for a section that is not rendered", async () => {
    mountConfiguration();

    useConfigurationSectionNavigation().navigateToSection("missing");
    await flushPromises();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("stops listening to navigation requests after unmount", async () => {
    mountConfiguration().unmount();
    const wrapper = mountConfiguration();

    useConfigurationSectionNavigation().navigateToSection("icing");
    await flushPromises();

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(isExpanded(wrapper, "icing")).toBe(true);
  });
});
