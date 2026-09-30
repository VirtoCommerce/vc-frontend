import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
import ProductConfigurationChecklist from "../product-configuration-checklist.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";

const LOCALE_KEY_PREFIX = "shared.catalog.product_details.product_configuration.checklist";

const translations: Record<string, string> = {
  [`${LOCALE_KEY_PREFIX}.title`]: "Configuration checklist",
  [`${LOCALE_KEY_PREFIX}.done`]: "(completed)",
  [`${LOCALE_KEY_PREFIX}.selected`]: "{name} — {value}",
  [`${LOCALE_KEY_PREFIX}.required`]: "{name} — required",
  [`${LOCALE_KEY_PREFIX}.optional`]: "{name} — optional",
  [`${LOCALE_KEY_PREFIX}.fill_it_in`]: "Fill it in",
  [`${LOCALE_KEY_PREFIX}.upload_file`]: "Upload a file",
  [`${LOCALE_KEY_PREFIX}.check_it_out`]: "Check it out",
  [`${LOCALE_KEY_PREFIX}.review`]: "Review",
};

const mockTranslate = (key: string, params?: Record<string, string>) =>
  (translations[key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => params?.[name] ?? "");

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
  }),
}));

const mocks = vi.hoisted(() => ({
  configuration: undefined as unknown as { value: Partial<ConfigurationSectionType>[] },
  selectedConfiguration: undefined as unknown as {
    value: Record<string, { selectedOptionTextValue?: string } | undefined>;
  },
  hiddenSectionIds: new Set<string>(),
  navigateToSection: vi.fn(),
}));

vi.mock("@/shared/catalog/composables", async () => {
  const { getConfigurationSectionElementId } = await vi.importActual<
    typeof import("@/shared/catalog/composables/useConfigurationSectionNavigation")
  >("@/shared/catalog/composables/useConfigurationSectionNavigation");

  return {
    getConfigurationSectionElementId,
    useConfigurableProduct: () => ({
      configuration: mocks.configuration,
      selectedConfiguration: mocks.selectedConfiguration,
      isSectionVisible: (sectionId: string) => !mocks.hiddenSectionIds.has(sectionId),
    }),
    useConfigurationSectionNavigation: () => ({
      navigateToSection: mocks.navigateToSection,
    }),
  };
});

function createSection(section: Partial<ConfigurationSectionType>): Partial<ConfigurationSectionType> {
  return { isRequired: false, type: "Product", ...section };
}

function mountChecklist() {
  return mount(ProductConfigurationChecklist, {
    props: { productId: "configurable-product" },
    global: {
      stubs: { VcIcon: true },
      mocks: { $t: mockTranslate },
    },
  });
}

function getRows(wrapper: ReturnType<typeof mountChecklist>) {
  return wrapper.findAll('[data-test-id="configuration-checklist-item"]').map((item) => ({
    status: ["done", "required", "optional"].find((status) =>
      item.classes().includes(`product-configuration-checklist__item--${status}`),
    ),
    label: item.find('[data-test-id="configuration-checklist-label"]').text(),
    action: item.find('[data-test-id="configuration-checklist-link"]').exists()
      ? item.find('[data-test-id="configuration-checklist-link"]').text()
      : undefined,
  }));
}

describe("ProductConfigurationChecklist", () => {
  beforeEach(() => {
    mocks.configuration = ref([]);
    mocks.selectedConfiguration = ref({});
    mocks.hiddenSectionIds = new Set();
    mocks.navigateToSection.mockClear();
  });

  it("renders nothing when the product has no configuration", () => {
    const wrapper = mountChecklist();

    expect(wrapper.find('[data-test-id="configuration-checklist"]').exists()).toBe(false);
  });

  it("shows required sections in red with a type-specific action, in section order", () => {
    mocks.configuration.value = [
      createSection({ id: "filling", name: "Filling", type: "Product", isRequired: true }),
      createSection({ id: "text", name: "Text", type: "Text", isRequired: true }),
      createSection({ id: "photo", name: "Photo", type: "File", isRequired: true }),
    ];

    expect(getRows(mountChecklist())).toEqual([
      { status: "required", label: "Filling — required", action: "Check it out" },
      { status: "required", label: "Text — required", action: "Fill it in" },
      { status: "required", label: "Photo — required", action: "Upload a file" },
    ]);
  });

  it("shows each optional section separately with a Review action", () => {
    mocks.configuration.value = [
      createSection({ id: "icing", name: "Icing" }),
      createSection({ id: "message", name: "Message", type: "Text" }),
    ];

    expect(getRows(mountChecklist())).toEqual([
      { status: "optional", label: "Icing — optional", action: "Review" },
      { status: "optional", label: "Message — optional", action: "Review" },
    ]);
  });

  it("marks filled sections green: product with its value, text and file with the name only", () => {
    mocks.configuration.value = [
      createSection({ id: "layers", name: "Layers", type: "Product", isRequired: true }),
      createSection({ id: "text", name: "Text", type: "Text", isRequired: true }),
      createSection({ id: "photo", name: "Photo", type: "File", isRequired: true }),
      createSection({ id: "icing", name: "Icing", type: "Product" }),
    ];
    mocks.selectedConfiguration.value = {
      layers: { selectedOptionTextValue: "Top: Chocolate / Bottom: Chocolate" },
      text: { selectedOptionTextValue: "Happy birthday" },
      photo: { selectedOptionTextValue: "cake.png" },
      icing: { selectedOptionTextValue: "Vanilla" },
    };

    expect(getRows(mountChecklist())).toEqual([
      { status: "done", label: "Layers — Top: Chocolate / Bottom: Chocolate (completed)", action: undefined },
      { status: "done", label: "Text (completed)", action: undefined },
      { status: "done", label: "Photo (completed)", action: undefined },
      { status: "done", label: "Icing — Vanilla (completed)", action: undefined },
    ]);
  });

  it("turns a row green as soon as its section gets filled", async () => {
    mocks.configuration.value = [createSection({ id: "filling", name: "Filling", isRequired: true })];

    const wrapper = mountChecklist();
    expect(getRows(wrapper)).toEqual([{ status: "required", label: "Filling — required", action: "Check it out" }]);

    mocks.selectedConfiguration.value = { filling: { selectedOptionTextValue: "Strawberry" } };
    await nextTick();

    expect(getRows(wrapper)).toEqual([
      { status: "done", label: "Filling — Strawberry (completed)", action: undefined },
    ]);
  });

  it("skips sections hidden by their dependency", () => {
    mocks.configuration.value = [
      createSection({ id: "layers", name: "Layers", isRequired: true }),
      createSection({ id: "decoration", name: "Decoration", dependsOnSectionId: "layers" }),
    ];
    mocks.hiddenSectionIds = new Set(["decoration"]);

    expect(getRows(mountChecklist()).map(({ label }) => label)).toEqual(["Layers — required"]);
  });

  it("links to the section and asks the configuration to reveal it on click", async () => {
    mocks.configuration.value = [createSection({ id: "text", name: "Text", type: "Text", isRequired: true })];

    const wrapper = mountChecklist();
    const link = wrapper.find('[data-test-id="configuration-checklist-link"]');

    expect(link.attributes("href")).toBe("#product-configuration-section-text");
    expect(link.attributes("aria-describedby")).toBe(
      wrapper.get('[data-test-id="configuration-checklist-label"]').attributes("id"),
    );

    await link.trigger("click");

    expect(mocks.navigateToSection).toHaveBeenCalledWith("text");
  });
});
