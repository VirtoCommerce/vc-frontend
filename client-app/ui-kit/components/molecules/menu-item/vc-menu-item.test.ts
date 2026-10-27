import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import VcMenuItem from "./vc-menu-item.vue";
import type { ComponentMountingOptions } from "@vue/test-utils";

function mountMenuItem(options: ComponentMountingOptions<typeof VcMenuItem> = {}) {
  return mount(VcMenuItem, {
    ...options,
    slots: { default: "Item" },
    global: {
      stubs: { VcIcon: true, RouterLink: RouterLinkStub },
    },
  });
}

describe("VcMenuItem", () => {
  it("adds rel to an external link opened in a new tab", () => {
    const wrapper = mountMenuItem({ props: { externalLink: "https://example.com", target: "_blank" } });

    expect(wrapper.find("a").attributes("rel")).toBe("noopener noreferrer");
  });

  it("adds rel to a router link opened in a new tab", () => {
    const wrapper = mountMenuItem({ props: { to: "/orders/1", target: "_blank" } });

    expect(wrapper.findComponent(RouterLinkStub).attributes("rel")).toBe("noopener noreferrer");
  });

  it("does not add rel to a link opened in the same tab", () => {
    const wrapper = mountMenuItem({ props: { externalLink: "https://example.com", target: "_self" } });

    expect(wrapper.find("a").attributes("rel")).toBeUndefined();
  });
});
