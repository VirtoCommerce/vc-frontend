import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import LayoutBlock from "./layout-block.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

// Both sides of the drag-handle seam: the selector Sortable is given, and the element a real VcWidget
// renders. Either drifting breaks header drags silently — the overlaid handle still works.
describe("LayoutBlock wrapping a real VcWidget", () => {
  function mountBlock(editing: boolean) {
    return mount(LayoutBlock, {
      props: { blockId: "orders", title: "Recent orders", editing },
      slots: { default: () => h(VcWidget, { title: "Recent orders", size: "md" }, () => "body") },
      global: { stubs: { VcIcon: true } },
    });
  }

  it("renders an element matching the selector Sortable is configured with", () => {
    const wrapper = mountBlock(true);
    const matches = wrapper.element.querySelectorAll(WIDGET_DRAG_HANDLE_SELECTOR);

    // The header and the overlaid handle button — both clauses of the selector have to land.
    expect([...matches].map((el) => el.className.split(" ")[0])).toEqual([
      "layout-block__handle",
      "vc-widget__header-container",
    ]);
  });

  // Overlaid on the header, so it must stay a sibling — inside `.vc-widget` its padding would displace it.
  it("keeps the chrome outside the widget it overlays", () => {
    const wrapper = mountBlock(true);
    const chrome = wrapper.find(".layout-block__chrome");

    expect(chrome.exists()).toBe(true);
    expect(chrome.element.closest(".vc-widget")).toBeNull();
  });

  it("renders no chrome outside edit mode, so the widget keeps its own header", () => {
    const wrapper = mountBlock(false);

    expect(wrapper.find(".layout-block__chrome").exists()).toBe(false);
    expect(wrapper.find(".vc-widget__header-container").exists()).toBe(true);
  });
});
