import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { useBlockSettings } from "../composables/useBlockSettings";
import { WIDGET_DRAG_FILTER_SELECTOR, WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import LayoutRegion from "./layout-region.vue";
import LayoutWidget from "./layout-widget.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
  },
}));

// VcWidget and VcButton are registered globally by the ui-kit plugin, which no test boots. Both are
// real: the controls are VcButtons, and it is their placement in VcWidget's header that is under test.
// VcShape is only reachable through a `v-if` VcWidget never takes here, but the compiler hoists its
// resolution above that branch, so it warns unless stubbed.
const global = { components: { VcButton, VcWidget }, stubs: { VcIcon: true, VcShape: true } };

enableAutoUnmount(afterEach);

// The point of layout-widget.vue: the controls sit in the widget's own header, placed by VcWidget's
// padding rather than metrics copied outside it. A real VcWidget, because that placement is under test.
describe("LayoutBlock wrapping a real LayoutWidget", () => {
  function mountBlock(editing: boolean, widget: () => unknown, options: { attachTo?: HTMLElement } = {}) {
    return mount(LayoutRegion, {
      ...options,
      props: {
        scope: "dashboard" as const,
        entries: ["orders"],
        orientation: "vertical" as const,
        group: "test",
        editing,
      },
      slots: { default: widget },
      global,
    });
  }

  const titledWidget =
    (widgetSlots: Record<string, () => unknown> = {}) =>
    () =>
      h(LayoutWidget, { title: "Recent orders", size: "md" }, { default: () => "body", ...widgetSlots });

  it("renders both controls inside the widget's own header", () => {
    const wrapper = mountBlock(true, titledWidget());
    const header = wrapper.get(".vc-widget__header-container").element;

    expect(header.querySelector(".layout-widget__handle")).not.toBeNull();
    expect(header.querySelector(".layout-widget__hide")).not.toBeNull();
  });

  // The controls are VcButtons, so the keyboard route into reordering only exists as long as VcButton
  // lets `keydown` / `blur` fall through to the button it renders. Nothing else would notice if it stopped.
  it("carries the handle's keyboard events through VcButton to the list", async () => {
    const wrapper = mountBlock(true, titledWidget(), { attachTo: document.body });
    const handle = wrapper.get(".layout-widget__handle");

    // Sent to whatever has focus, as a real key is: the list ignores keys bubbling from inside the handle.
    (handle.element as HTMLElement).focus();
    document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await nextTick();

    expect(handle.attributes("aria-pressed")).toBe("true");
    expect(wrapper.get('[data-block-id="orders"]').classes()).toContain("vc-sortable__item--grabbed");

    await handle.trigger("blur");

    expect(handle.attributes("aria-pressed")).toBe("false");
  });

  it("renders an element matching the selector Sortable is configured with", () => {
    const wrapper = mountBlock(true, titledWidget());

    expect(wrapper.find(WIDGET_DRAG_HANDLE_SELECTOR).exists()).toBe(true);
  });

  // The button is inside the drag surface, so only Sortable's `filter` keeps ✕ from starting a drag.
  it("keeps the hide button matching the filter selector, inside the drag surface", () => {
    const wrapper = mountBlock(true, titledWidget());
    const hide = wrapper.get(WIDGET_DRAG_FILTER_SELECTOR).element;

    expect(hide.closest(WIDGET_DRAG_HANDLE_SELECTOR)).not.toBeNull();
  });

  it("renders no controls outside edit mode, so the widget keeps its own header", () => {
    const wrapper = mountBlock(false, titledWidget());

    expect(wrapper.find(".layout-widget__handle").exists()).toBe(false);
    expect(wrapper.find(".layout-widget__hide").exists()).toBe(false);
    expect(wrapper.find(".vc-widget__header-container").exists()).toBe(true);
  });

  // VcWidget renders no header without a title, and the controls live there — so a titleless widget
  // would be silently undraggable. It falls back to the registry name.
  it("still renders its controls when the widget sets no title of its own", () => {
    const wrapper = mountBlock(true, () => h(LayoutWidget, null, { default: () => "body" }));

    expect(wrapper.find(".layout-widget__handle").exists()).toBe(true);
    expect(wrapper.get(".vc-widget__title").text()).toBe("sales_rep.orders.title");
  });

  it("renders no second set of controls for a widget nested inside another", () => {
    const wrapper = mountBlock(true, () =>
      h(
        LayoutWidget,
        { title: "Outer" },
        { default: () => h(LayoutWidget, { title: "Inner" }, { default: () => "body" }) },
      ),
    );

    expect(wrapper.findAll(".layout-widget__handle")).toHaveLength(1);
    expect(wrapper.findAll(".layout-widget__hide")).toHaveLength(1);
    expect(wrapper.findAll(".layout-widget__rows")).toHaveLength(0);
  });

  it("gives an untitled widget nested inside another no title of the block's", () => {
    const wrapper = mountBlock(true, () =>
      h(LayoutWidget, { title: "Outer" }, { default: () => h(LayoutWidget, null, { default: () => "body" }) }),
    );

    expect(wrapper.findAll(".vc-widget__title").map((title) => title.text())).toEqual(["Outer"]);
  });

  it("offers the block's settings to no component nested inside its widget", () => {
    let nested: unknown = "unset";
    const Reader = defineComponent({
      setup() {
        nested = useBlockSettings();
        return () => h("span");
      },
    });

    mountBlock(true, () => h(LayoutWidget, { title: "Outer" }, { default: () => h(Reader) }));

    expect(nested).toBeUndefined();
  });

  // The orders widget puts a "View all" link in `#append`; the ✕ joins it rather than replacing it.
  it("keeps a widget's own header content alongside the hide button", () => {
    const wrapper = mountBlock(true, titledWidget({ append: () => h("a", { class: "view-all" }, "View all") }));
    const header = wrapper.get(".vc-widget__header-container").element;

    expect(header.querySelector(".view-all")).not.toBeNull();
    expect(header.querySelector(".layout-widget__hide")).not.toBeNull();
  });
});

// Nothing forces a LayoutWidget to be inside a region, and without one it has to stay usable.
describe("LayoutWidget outside a layout", () => {
  it("renders a plain widget with no controls", () => {
    const wrapper = mount(LayoutWidget, {
      props: { title: "Recent orders" },
      slots: { default: () => "body" },
      global,
    });

    expect(wrapper.find(".vc-widget__header-container").exists()).toBe(true);
    expect(wrapper.find(".layout-widget__handle").exists()).toBe(false);
    expect(wrapper.find(".vc-sortable__handle").exists()).toBe(false);
  });
});

// The pages render one generic `<component>` and take the heading from the slot, so a block whose
// title stopped arriving would render a widget with a blank header.
describe("LayoutRegion's slot payload", () => {
  it("hands each block its localized registry title alongside its id", () => {
    const seen: { id: string; title: string }[] = [];

    mount(LayoutRegion, {
      props: {
        scope: "dashboard" as const,
        entries: ["orders", "top_sellers"],
        orientation: "vertical" as const,
        group: "test",
      },
      slots: {
        default: (payload: { id: string; title: string }) => {
          seen.push({ ...payload });
          return h("div");
        },
      },
      global,
    });

    expect(seen).toEqual([
      { id: "orders", title: "sales_rep.orders.title" },
      { id: "top_sellers", title: "sales_rep.top_sellers.title" },
    ]);
  });
});
