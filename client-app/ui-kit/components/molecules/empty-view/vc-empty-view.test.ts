import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcEmptyView from "./vc-empty-view.vue";

const VcIconStub = { name: "VcIcon", props: ["name"], template: "<span />" };
const VcEmptyIconStub = { name: "VcEmptyIcon", props: ["name"], template: "<span />" };

function mountEmptyView(props: InstanceType<typeof VcEmptyView>["$props"] = {}, slots = {}) {
  return mount(VcEmptyView, {
    props,
    slots,
    global: { stubs: { VcIcon: VcIconStub, VcEmptyIcon: VcEmptyIconStub } },
  });
}

describe("VcEmptyView", () => {
  it("renders the title, the description and the hint", () => {
    const wrapper = mountEmptyView({ text: "No orders yet", description: "Orders will appear here.", hint: "Code 1" });

    expect(wrapper.text()).toContain("No orders yet");
    expect(wrapper.text()).toContain("Orders will appear here.");
    expect(wrapper.text()).toContain("Code 1");
  });

  it("shows the entity glyph and drawn icon for a content reason", () => {
    const wrapper = mountEmptyView({ reason: "no-data", entity: "quotes" });

    expect(wrapper.findComponent(VcIconStub).props("name")).toBe("message-square-quote");
    expect(wrapper.findComponent(VcEmptyIconStub).props("name")).toBe("quotes");
  });

  it("does not render the drawn icon at the circle-only sizes", () => {
    for (const size of ["xs", "sm", "md"] as const) {
      expect(
        mountEmptyView({ reason: "no-data", entity: "quotes", size }).findComponent(VcEmptyIconStub).exists(),
      ).toBe(false);
    }
  });

  it("puts the tone and the size on the root", () => {
    const wrapper = mountEmptyView({ reason: "error", size: "xl" });

    expect(wrapper.classes()).toContain("vc-empty-view--tone--danger");
    expect(wrapper.classes()).toContain("vc-empty-view--size--xl");
  });

  it("keeps the legacy variant working", () => {
    expect(mountEmptyView({ variant: "search" }).classes()).toContain("vc-empty-view--reason--no-results");
  });

  it("renders the button slot", () => {
    const wrapper = mountEmptyView({ text: "Empty" }, { button: '<button data-test-id="cta-button">Go</button>' });

    expect(wrapper.find('[data-test-id="cta-button"]').exists()).toBe(true);
  });
});
