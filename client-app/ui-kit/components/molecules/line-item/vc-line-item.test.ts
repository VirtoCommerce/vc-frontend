import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcLineItem from "./vc-line-item.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountLineItem(options: ComponentMountingOptions<typeof VcLineItem> = {}) {
  return mount(VcLineItem, {
    ...options,
    props: { name: "MacBook Air", ...options.props },
    global: {
      stubs: {
        VcImage: true,
        VcProductTitle: true,
        VcProperty: true,
        VcProductPrice: true,
        VcButton: true,
        VcCheckbox: true,
        VcMenuItem: true,
        VcIcon: true,
        VcDropdownMenu: { template: '<div data-test-id="menu"><slot name="content" :close="() => {}" /></div>' },
      },
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
        $n: (value: number) => `n(${value})`,
      },
    },
  });
}

// The template starts with a comment, so the wrapper is a fragment: read the modifiers off the root element.
function rootClasses(wrapper: ReturnType<typeof mountLineItem>): string[] {
  return wrapper.get("div").classes();
}

describe("VcLineItem", () => {
  it("renders the ⋮ menu for menu slot content even when the line is not removable", () => {
    const wrapper = mountLineItem({ slots: { menu: '<span data-test-id="save-for-later">Save</span>' } });

    expect(wrapper.find('[data-test-id="menu"]').exists()).toBe(true);
    expect(wrapper.find('[data-test-id="save-for-later"]').exists()).toBe(true);
  });

  it("does not render the ⋮ menu without menu content or remove action", () => {
    expect(mountLineItem().find('[data-test-id="menu"]').exists()).toBe(false);
  });

  it("renders the badges slot", () => {
    const wrapper = mountLineItem({ slots: { badges: '<span data-test-id="in-stock">999</span>' } });

    expect(wrapper.find('[data-test-id="in-stock"]').exists()).toBe(true);
  });

  it("shows the quantity of a read-only line next to the unit price", () => {
    const wrapper = mountLineItem({ props: { name: "MacBook Air", withPrice: true, quantity: 2 } });

    expect(wrapper.text()).toContain('ui_kit.labels.quantity_times:{"quantity":"n(2)"}');
  });

  it("does not show a quantity for an editable line", () => {
    const wrapper = mountLineItem({ props: { name: "MacBook Air", withPrice: true } });

    expect(wrapper.text()).not.toContain("ui_kit.labels.quantity_times");
  });

  it("keeps Remove in the ⋮ menu after the menu slot content", () => {
    const wrapper = mountLineItem({
      props: { name: "MacBook Air", removable: true },
      slots: { menu: '<span data-test-id="save-for-later">Save</span>' },
    });
    const menu = wrapper.find('[data-test-id="menu"]');

    expect(menu.find('[data-test-id="save-for-later"]').exists()).toBe(true);
    expect(menu.find('[data-test-id="line-item-remove-menu-item"]').exists()).toBe(true);
  });

  it("shows the Total line of an editable line on the meta line", () => {
    const wrapper = mountLineItem({ props: { name: "MacBook Air", withTotal: true } });

    expect(rootClasses(wrapper)).toEqual(
      expect.arrayContaining(["vc-line-item--with-total", "vc-line-item--with-meta"]),
    );
    expect(rootClasses(wrapper)).not.toContain("vc-line-item--readonly");
  });

  it("moves the total of a read-only line next to its quantity instead of a Total line", () => {
    const wrapper = mountLineItem({ props: { name: "MacBook Air", withTotal: true, quantity: 2 } });

    expect(rootClasses(wrapper)).toContain("vc-line-item--readonly");
    expect(rootClasses(wrapper)).not.toContain("vc-line-item--with-total");
    expect(rootClasses(wrapper)).not.toContain("vc-line-item--with-meta");
  });

  it("draws the meta line for badges alone", () => {
    const wrapper = mountLineItem({ slots: { badges: "<span>999</span>" } });

    expect(rootClasses(wrapper)).toContain("vc-line-item--with-meta");
  });
});
