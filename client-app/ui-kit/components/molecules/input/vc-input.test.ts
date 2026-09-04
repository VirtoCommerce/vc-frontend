import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails } from "@/ui-kit/components/atoms";
import VcDateInput from "../date-input/vc-date-input.vue";
import VcInput from "./vc-input.vue";

const stubs = { VcLabel: true, VcButton: true, VcIcon: true, VcTooltip: true };

const createInputWrapper = createWrapperFactory(mount, VcInput, {
  global: { components: { VcInputDetails }, stubs },
});

const createDateInputWrapper = createWrapperFactory(mount, VcDateInput, {
  global: { components: { VcInput, VcInputDetails }, stubs },
});

describe("VcInput hideDetails", () => {
  it("renders the details row by default", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "" } });
    expect(wrapper.findComponent({ name: "VcInputDetails" }).exists()).toBe(true);
  });

  it("does not render the details row when hideDetails is true", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", hideDetails: true } });
    expect(wrapper.findComponent({ name: "VcInputDetails" }).exists()).toBe(false);
  });
});

// VCST-5533: VcSelect depends on this too.
describe("VcInput aria-describedby", () => {
  it("omits aria-describedby when hideDetails is true", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", hideDetails: true, message: "x" } });
    expect(wrapper.find("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("keeps a forwarded aria-describedby when it renders no details row of its own", () => {
    const wrapper = createInputWrapper({
      props: { modelValue: "", hideDetails: true, message: "x", aria: { "aria-describedby": "outer-id" } },
    });
    expect(wrapper.find("input").attributes("aria-describedby")).toBe("outer-id");
  });

  it("keeps a consumer-supplied description id", () => {
    const wrapper = createInputWrapper({
      props: { aria: { "aria-describedby": "external-error" } },
    });

    expect(wrapper.get("input").attributes("aria-describedby")).toBe("external-error");
  });

  it("references the details element when only a message is set", () => {
    const wrapper = createInputWrapper({ props: { message: "Too short" } });

    const detailsId = wrapper.get(".vc-input-details").attributes("id");
    expect(wrapper.get("input").attributes("aria-describedby")).toBe(detailsId);
  });

  it("merges the consumer-supplied id with the internal details id", () => {
    const wrapper = createInputWrapper({
      props: { message: "Too short", aria: { "aria-describedby": "external-error" } },
    });

    const describedBy = wrapper.get("input").attributes("aria-describedby")!.split(" ");
    const detailsId = wrapper.get(".vc-input-details").attributes("id");

    expect(detailsId).toBeTruthy();
    expect(describedBy).toContain(detailsId);
    expect(describedBy).toContain("external-error");
  });

  it("is absent when there is nothing to describe", () => {
    const wrapper = createInputWrapper();

    expect(wrapper.get("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("every referenced id resolves to a rendered element", () => {
    const wrapper = createInputWrapper({
      props: { message: "Too short", counter: true, maxlength: 10 },
    });

    const describedBy = wrapper.get("input").attributes("aria-describedby")!.split(" ");
    describedBy.forEach((id) => {
      expect(wrapper.find(`#${id}`).exists()).toBe(true);
    });
  });
});

describe("VcInput clearable", () => {
  it("gives the clear button an accessible name", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "value", clearable: true } });
    expect(wrapper.find(".vc-input__clear").attributes("aria-label")).toBeTruthy();
  });
});

describe("VcInput seamless", () => {
  it("renders without the seamless modifier class by default", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "" } });
    expect(wrapper.classes()).not.toContain("vc-input--seamless");
  });

  it("adds vc-input--seamless when seamless is true", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", seamless: true } });
    expect(wrapper.classes()).toContain("vc-input--seamless");
  });
});

describe("VcDateInput passthrough props", () => {
  it("forwards hideDetails to VcInput", () => {
    const wrapper = createDateInputWrapper({ props: { modelValue: "", hideDetails: true } });
    expect(wrapper.findComponent({ name: "VcInputDetails" }).exists()).toBe(false);
  });

  it("forwards seamless to VcInput", () => {
    const wrapper = createDateInputWrapper({ props: { modelValue: "", seamless: true } });
    expect(wrapper.findComponent({ name: "VcInput" }).classes()).toContain("vc-input--seamless");
  });
});
