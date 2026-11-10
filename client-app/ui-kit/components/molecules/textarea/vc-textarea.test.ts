import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails, VcLabel } from "@/ui-kit/components/atoms";
import VcTextarea from "./vc-textarea.vue";

// VcLabel is real: the element it renders is what this suite asserts.
const createWrapper = createWrapperFactory(mount, VcTextarea, {
  global: {
    components: { VcInputDetails, VcLabel },
    stubs: { VcTooltip: true, VcIcon: true },
    directives: { "html-safe": {} },
  },
});

describe("VcTextarea accessible name", () => {
  it("renders a real label bound to the field", () => {
    const wrapper = createWrapper({ props: { label: "Delivery notes" } });
    const label = wrapper.get(".vc-label");

    expect(label.element.tagName).toBe("LABEL");
    expect(label.attributes("for")).toBe(wrapper.get("textarea").attributes("id"));
    expect(wrapper.get("textarea").attributes("aria-label")).toBeUndefined();
  });

  it("never points the field at itself", () => {
    const wrapper = createWrapper({ props: { label: "Delivery notes" } });
    const textarea = wrapper.get("textarea");

    expect(textarea.attributes("id")).toBeTruthy();
    expect(textarea.attributes("aria-labelledby")).toBeUndefined();
  });

  it("keeps ariaLabel when there is no label", () => {
    const wrapper = createWrapper({ props: { ariaLabel: "Order comment" } });

    expect(wrapper.find(".vc-label").exists()).toBe(false);
    expect(wrapper.get("textarea").attributes("aria-label")).toBe("Order comment");
  });
});

describe("VcTextarea required", () => {
  it("keeps the asterisk out of the accessible name and exposes required on the field", () => {
    const wrapper = createWrapper({ props: { label: "Comment", required: true } });

    expect(wrapper.get(".vc-label__asterisk").attributes("aria-hidden")).toBe("true");
    expect(wrapper.get("textarea").attributes("required")).toBeDefined();
  });
});

describe("VcTextarea error state", () => {
  it("marks the field invalid and points it at the rendered message", () => {
    const wrapper = createWrapper({ props: { label: "Comment", error: true, message: "Comment is too long" } });
    const textarea = wrapper.get("textarea");
    const detailsId = wrapper.findComponent({ name: "VcInputDetails" }).attributes("id");

    expect(textarea.attributes("aria-invalid")).toBe("true");
    expect(detailsId).toBeTruthy();
    expect(textarea.attributes("aria-describedby")).toBe(detailsId);
  });

  it("sets neither attribute without an error or anything to describe", () => {
    const textarea = createWrapper({ props: { label: "Comment" } }).get("textarea");

    expect(textarea.attributes("aria-invalid")).toBeUndefined();
    expect(textarea.attributes("aria-describedby")).toBeUndefined();
  });

  it("describes the field with its counter", () => {
    const wrapper = createWrapper({ props: { label: "Comment", counter: true, maxLength: 10, modelValue: "abc" } });
    const textarea = wrapper.get("textarea");
    const detailsId = wrapper.findComponent({ name: "VcInputDetails" }).attributes("id");

    expect(textarea.attributes("aria-invalid")).toBeUndefined();
    expect(detailsId).toBeTruthy();
    expect(textarea.attributes("aria-describedby")).toBe(detailsId);
  });

  it("does not point at an empty details row", () => {
    const textarea = createWrapper({ props: { label: "Comment", error: true } }).get("textarea");

    expect(textarea.attributes("aria-invalid")).toBe("true");
    expect(textarea.attributes("aria-describedby")).toBeUndefined();
  });
});
