import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { createWrapperFactory } from "@/ui-kit/test-mocks/wrapper-factory";
import VcMenuItem from "./vc-menu-item.vue";
import VcCheckbox from "@/ui-kit/components/atoms/checkbox/vc-checkbox.vue";

const createWrapper = createWrapperFactory(mount, VcMenuItem);

function inner(wrapper: ReturnType<typeof createWrapper>) {
  return wrapper.get(".vc-menu-item__inner");
}

describe("VcMenuItem highlight ring", () => {
  it("rings a highlighted item by default", () => {
    const wrapper = createWrapper({ props: { highlighted: true } });

    expect(inner(wrapper).classes()).toContain("vc-menu-item__inner--highlight-ring");
  });

  it("keeps the highlight but drops the ring when asked", () => {
    const wrapper = createWrapper({ props: { highlighted: true, highlightRing: false } });

    expect(inner(wrapper).classes()).toContain("vc-menu-item__inner--highlighted");
    expect(inner(wrapper).classes()).not.toContain("vc-menu-item__inner--highlight-ring");
  });

  it("does not ring an item that is not highlighted", () => {
    const wrapper = createWrapper();

    expect(inner(wrapper).classes()).not.toContain("vc-menu-item__inner--highlight-ring");
  });
});

describe("VcMenuItem divider", () => {
  it("draws a divider only with `with-divider`", () => {
    expect(createWrapper({ props: { withDivider: true } }).classes()).toContain("vc-menu-item--with-divider");
    expect(createWrapper().classes()).not.toContain("vc-menu-item--with-divider");
  });
});

describe("VcMenuItem tab order", () => {
  it.each([-1, "-1"] as const)("puts tabindex %j on the inner element and takes it without a warning", (tabindex) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const wrapper = createWrapper({ props: { tabindex } });

    expect(inner(wrapper).attributes("tabindex")).toBe("-1");
    expect(wrapper.attributes("tabindex")).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it.each([
    ["a router link", { to: "/somewhere" }],
    ["an external link", { externalLink: "https://example.com" }],
  ])("puts tabindex on the inner element of %s", (_label, link) => {
    const wrapper = createWrapper({ props: { tabindex: -1, ...link }, global: { stubs: { RouterLink: true } } });

    expect(inner(wrapper).attributes("tabindex")).toBe("-1");
  });
});

describe("VcMenuItem as an interactive parent", () => {
  it.each([
    ["a clickable item", {}, false],
    ["a link", { externalLink: "https://example.com" }, false],
    ["an item that is not clickable", { clickable: false }, true],
  ])(
    "renders the input of a checkbox in %s only when the item is not itself a control",
    (_label, props, rendersInput) => {
      const wrapper = mount(VcMenuItem, {
        props,
        slots: { default: () => h(VcCheckbox, { ariaLabel: "Pick" }) },
        global: { stubs: { VcTooltip: true, VcInputDetails: true } },
      });

      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(rendersInput);
    },
  );
});
