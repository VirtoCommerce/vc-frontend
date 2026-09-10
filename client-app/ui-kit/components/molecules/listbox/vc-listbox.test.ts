import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import * as UIKitComponents from "@/ui-kit/components";
import VcListbox from "./vc-listbox.vue";

const mountListbox = createWrapperFactory(mount, VcListbox, {
  global: { components: UIKitComponents },
});

const option = (label: string) => h(UIKitComponents.VcMenuItem, { role: "option", tabindex: -1 }, () => label);

describe("VcListbox", () => {
  it("renders a labelled listbox around the default slot", () => {
    const wrapper = mountListbox({
      props: { listId: "my-list", listLabel: "Countries" },
      slots: { default: () => [option("Albania"), option("Belgium")] },
    });

    const list = wrapper.get('[role="listbox"]');

    expect(list.attributes("id")).toBe("my-list");
    expect(list.attributes("aria-label")).toBe("Countries");
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2);
  });

  it("sets aria-multiselectable only when asked", () => {
    const single = mountListbox({ slots: { default: () => option("Albania") } });
    const multi = mountListbox({
      props: { multiselectable: true },
      slots: { default: () => option("Albania") },
    });

    expect(single.get('[role="listbox"]').attributes("aria-multiselectable")).toBeUndefined();
    expect(multi.get('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
  });

  it("renders header and footer only when their slots are given", () => {
    const bare = mountListbox({ slots: { default: () => option("Albania") } });

    expect(bare.find(".vc-listbox__header").exists()).toBe(false);
    expect(bare.find(".vc-listbox__footer").exists()).toBe(false);

    const framed = mountListbox({
      slots: {
        default: () => option("Albania"),
        header: () => h("div", { class: "probe-header" }, "search"),
        footer: () => h("div", { class: "probe-footer" }, "more"),
      },
    });

    expect(framed.get(".vc-listbox__header .probe-header").text()).toBe("search");
    expect(framed.get(".vc-listbox__footer .probe-footer").text()).toBe("more");
  });

  it("carries dividers by default and drops them on request", () => {
    const withDividers = mountListbox({ slots: { default: () => option("Albania") } });
    const without = mountListbox({
      props: { dividers: false },
      slots: { default: () => option("Albania") },
    });

    expect(withDividers.get('[role="listbox"]').classes()).toContain("vc-listbox__list--dividers");
    expect(without.get('[role="listbox"]').classes()).not.toContain("vc-listbox__list--dividers");
  });

  it("forwards maxHeight as the height custom property", () => {
    const wrapper = mountListbox({
      props: { maxHeight: "20rem" },
      slots: { default: () => option("Albania") },
    });

    expect(wrapper.get('[role="listbox"]').attributes("style")).toContain("--props-max-height: 20rem");
  });
});
