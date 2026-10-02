import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcMenuItem from "./vc-menu-item.vue";

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
