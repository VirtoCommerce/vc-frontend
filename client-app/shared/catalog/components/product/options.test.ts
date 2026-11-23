import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { PropertyType, PropertyValueTypes } from "@/core/api/graphql/types";
import Options from "./options.vue";
import type { Product, Property } from "@/core/api/graphql/types";
import VcTooltip from "@/ui-kit/components/atoms/tooltip/vc-tooltip.vue";
import VcPopover from "@/ui-kit/components/molecules/popover/vc-popover.vue";
import VcVariantPicker from "@/ui-kit/components/molecules/variant-picker/vc-variant-picker.vue";
import VcVariantPickerGroup from "@/ui-kit/components/molecules/variant-picker-group/vc-variant-picker-group.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/globals", () => ({
  globals: {
    i18n: { global: { t: (key: string) => key, d: String, n: String } },
    cultureName: "en-US",
  },
}));

const ProductTitledBlockStub = defineComponent({
  name: "ProductTitledBlock",

  setup(_, { slots }) {
    return () => h("div", slots.default?.());
  },
});

function createVariation(id: string, color: string, size: string): Product {
  const property = (name: string, value: string): Property => ({
    id: `${name}-${value}`,
    name,
    value,
    label: name,
    propertyType: PropertyType.Variation,
    propertyValueType: PropertyValueTypes.ShortText,
    hidden: false,
    multivalue: false,
  });

  return { id, properties: [property("Color", color), property("Size", size)] } as unknown as Product;
}

// Blue comes in S and M only, so choosing L also picks Red. The options sort by value: Blue, Red and L, M, S.
const VARIATIONS = [
  createVariation("1", "Red", "S"),
  createVariation("2", "Red", "M"),
  createVariation("3", "Red", "L"),
  createVariation("4", "Blue", "S"),
  createVariation("5", "Blue", "M"),
];

function mountOptions() {
  return mount(Options, {
    props: { model: { title: "Options" }, variations: VARIATIONS },
    global: {
      components: { VcVariantPickerGroup, VcVariantPicker, VcTooltip, VcPopover },
      stubs: { ProductTitledBlock: ProductTitledBlockStub, VcIcon: true },
      mocks: { $t: (key: string) => key },
    },
    attachTo: document.body,
  });
}

function triggersIn(property: string): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `[data-test-id="variant-picker-group--${property}"] .vc-variant-picker__trigger`,
    ),
  );
}

function press(key: string): void {
  document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("product options with the keyboard", () => {
  it("moves the focus with an arrow without dropping a choice; Space and Enter select and keep the focus", async () => {
    const wrapper = mountOptions();

    await flushPromises();

    const sizes = triggersIn("Size");
    const colors = triggersIn("Color");
    const checked = (triggers: HTMLElement[]) => triggers.map((trigger) => trigger.getAttribute("aria-checked"));

    colors[0].focus();
    press(" ");
    await flushPromises();
    sizes[1].focus();
    press(" ");
    await flushPromises();

    expect(checked(colors)).toEqual(["true", "false"]);
    expect(checked(sizes)).toEqual(["false", "true", "false"]);

    press("ArrowLeft");
    await flushPromises();

    expect(document.activeElement).toBe(sizes[0]);
    expect(checked(colors)).toEqual(["true", "false"]);
    expect(checked(sizes)).toEqual(["false", "true", "false"]);
    expect(sizes.map((trigger) => trigger.tabIndex)).toEqual([0, -1, -1]);

    press("Enter");
    await flushPromises();

    expect(triggersIn("Size").every((trigger, i) => trigger === sizes[i])).toBe(true);
    expect(document.activeElement).toBe(sizes[0]);
    expect(checked(sizes)).toEqual(["true", "false", "false"]);
    expect(checked(colors)).toEqual(["false", "true"]);
    expect(colors.map((trigger) => trigger.tabIndex)).toEqual([-1, 0]);

    wrapper.unmount();
  });
});
