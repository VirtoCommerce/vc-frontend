import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import VcCheckbox from "./vc-checkbox.vue";

function mountCheckbox(props = {}) {
  return mount(VcCheckbox, {
    props: { name: "terms", ...props },
    global: {
      components: { VcInputDetails },
      stubs: { VcTooltip: true, VcIcon: true },
      directives: { "html-safe": {} },
    },
  });
}

describe("VcCheckbox error state", () => {
  it("marks the input invalid and points it at the rendered message", () => {
    const wrapper = mountCheckbox({ error: true, message: "Accept the terms to continue" });
    const input = wrapper.get("input");
    const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(detailsId).toBeTruthy();
    expect(input.attributes("aria-describedby")).toBe(detailsId);
  });

  it("sets neither attribute without an error or a message", () => {
    const input = mountCheckbox().get("input");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("describes the input with a hint that is not an error", () => {
    const wrapper = mountCheckbox({ message: "Pick a branch first" });
    const input = wrapper.get("input");
    const detailsId = wrapper.findComponent(VcInputDetails).attributes("id");

    expect(input.attributes("aria-invalid")).toBeUndefined();
    expect(detailsId).toBeTruthy();
    expect(input.attributes("aria-describedby")).toBe(detailsId);
  });

  it("does not point at an empty details row", () => {
    const input = mountCheckbox({ error: true }).get("input");

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBeUndefined();
  });

  it("gives every instance its own details id", () => {
    const first = mountCheckbox({ message: "First" }).get("input").attributes("aria-describedby");
    const second = mountCheckbox({ message: "Second" }).get("input").attributes("aria-describedby");

    expect(first).not.toBe(second);
  });
});
