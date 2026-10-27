import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcTileButton from "./vc-tile-button.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountTile(options: ComponentMountingOptions<typeof VcTileButton> = {}) {
  return mount(VcTileButton, {
    slots: { default: "Send email" },
    ...options,
    global: { stubs: { VcIcon: true, RouterLink: RouterLinkStub } },
  });
}

describe("VcTileButton", () => {
  it("renders a type=button with the icon and the slot label", () => {
    const wrapper = mountTile({ props: { icon: "mail" } });

    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.findComponent({ name: "VcIcon" }).attributes("name")).toBe("mail");
    expect(wrapper.text()).toBe("Send email");
  });

  it("renders no icon without the icon prop", () => {
    const wrapper = mountTile();

    expect(wrapper.findComponent({ name: "VcIcon" }).exists()).toBe(false);
  });

  it("renders the icon slot in place of the icon prop", () => {
    const wrapper = mountTile({
      props: { icon: "mail" },
      slots: { icon: '<img data-test-id="custom-icon" alt="" />' },
    });

    expect(wrapper.find('[data-test-id="custom-icon"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VcIcon" }).exists()).toBe(false);
  });

  it("defaults to the solid primary tile", () => {
    const wrapper = mountTile();

    expect(wrapper.classes()).toContain("vc-tile-button--solid--primary");
  });

  it("emits click", async () => {
    const wrapper = mountTile();

    await wrapper.trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mountTile({ props: { disabled: true } });

    // `trigger` skips disabled elements, so dispatch directly: the handler itself must refuse.
    wrapper.element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.classes()).toContain("vc-tile-button--disabled");
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  it("renders a router-link for to", () => {
    const wrapper = mountTile({ props: { to: "/quotes" } });

    expect(wrapper.findComponent(RouterLinkStub).props("to")).toBe("/quotes");
    expect(wrapper.attributes("type")).toBeUndefined();
    expect(wrapper.attributes("disabled")).toBeUndefined();
  });

  it("renders an anchor for externalLink and protects a new tab", () => {
    const wrapper = mountTile({ props: { externalLink: "https://example.com", target: "_blank" } });

    expect(wrapper.element.tagName).toBe("A");
    expect(wrapper.attributes("href")).toBe("https://example.com");
    expect(wrapper.attributes("target")).toBe("_blank");
    expect(wrapper.attributes("rel")).toBe("noopener noreferrer");
  });

  it.each([
    ["to", { to: "/quotes" }],
    ["externalLink", { externalLink: "https://example.com" }],
  ])("renders a disabled button instead of a %s link", (_, props) => {
    const wrapper = mountTile({ props: { ...props, disabled: true } });

    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.attributes("href")).toBeUndefined();
  });

  it("passes title and aria-label through to the control", () => {
    const wrapper = mountTile({ attrs: { title: "Coming soon", "aria-label": "Send email to ACME" } });

    expect(wrapper.attributes("title")).toBe("Coming soon");
    expect(wrapper.attributes("aria-label")).toBe("Send email to ACME");
  });
});
