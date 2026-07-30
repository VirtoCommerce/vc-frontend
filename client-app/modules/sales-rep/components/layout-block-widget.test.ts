import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { WIDGET_DRAG_FILTER_SELECTOR, WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import LayoutBlock from "./layout-block.vue";
import LayoutRegion from "./layout-region.vue";
import LayoutWidget from "./layout-widget.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
  },
}));

// VcWidget is registered globally by the ui-kit plugin, which no test boots.
// VcShape is only reachable through a `v-if` VcWidget never takes here, but the compiler hoists its
// resolution above that branch, so it warns unless stubbed.
const global = { components: { VcWidget }, stubs: { VcIcon: true, VcShape: true } };

// The point of layout-widget.vue: the controls sit in the widget's own header, placed by VcWidget's
// padding rather than metrics copied outside it. A real VcWidget, because that placement is under test.
describe("LayoutBlock wrapping a real LayoutWidget", () => {
  function mountBlock(editing: boolean, widgetSlots: Record<string, () => unknown> = {}) {
    return mount(LayoutBlock, {
      props: { blockId: "orders", title: "Recent orders", editing },
      slots: {
        default: () =>
          h(LayoutWidget, { title: "Recent orders", size: "md" }, { default: () => "body", ...widgetSlots }),
      },
      global,
    });
  }

  it("renders both controls inside the widget's own header", () => {
    const wrapper = mountBlock(true);
    const header = wrapper.get(".vc-widget__header-container").element;

    expect(header.querySelector(".layout-widget__handle")).not.toBeNull();
    expect(header.querySelector(".layout-widget__hide")).not.toBeNull();
  });

  it("renders an element matching the selector Sortable is configured with", () => {
    const wrapper = mountBlock(true);

    expect(wrapper.find(WIDGET_DRAG_HANDLE_SELECTOR).exists()).toBe(true);
  });

  // The button is inside the drag surface, so only Sortable's `filter` keeps ✕ from starting a drag.
  it("keeps the hide button matching the filter selector, inside the drag surface", () => {
    const wrapper = mountBlock(true);
    const hide = wrapper.get(WIDGET_DRAG_FILTER_SELECTOR).element;

    expect(hide.closest(WIDGET_DRAG_HANDLE_SELECTOR)).not.toBeNull();
  });

  it("renders no controls outside edit mode, so the widget keeps its own header", () => {
    const wrapper = mountBlock(false);

    expect(wrapper.find(".layout-widget__handle").exists()).toBe(false);
    expect(wrapper.find(".layout-widget__hide").exists()).toBe(false);
    expect(wrapper.find(".vc-widget__header-container").exists()).toBe(true);
  });

  // VcWidget renders no header without a title, and the controls live there — so a titleless widget
  // would be silently undraggable. It falls back to the registry name.
  it("still renders its controls when the widget sets no title of its own", () => {
    const wrapper = mount(LayoutBlock, {
      props: { blockId: "orders", title: "Recent orders", editing: true },
      slots: { default: () => h(LayoutWidget, null, { default: () => "body" }) },
      global,
    });

    expect(wrapper.find(".layout-widget__handle").exists()).toBe(true);
    expect(wrapper.get(".vc-widget__title").text()).toBe("Recent orders");
  });

  // The orders widget puts a "View all" link in `#append`; the ✕ joins it rather than replacing it.
  it("keeps a widget's own header content alongside the hide button", () => {
    const wrapper = mountBlock(true, { append: () => h("a", { class: "view-all" }, "View all") });
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
    expect(wrapper.find(".layout-widget--draggable").exists()).toBe(false);
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
