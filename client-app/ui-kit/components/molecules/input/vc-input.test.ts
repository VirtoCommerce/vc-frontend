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

describe("VcInput aria-describedby", () => {
  it("omits aria-describedby when hideDetails is true", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", hideDetails: true, message: "x" } });
    expect(wrapper.find("input").attributes("aria-describedby")).toBeUndefined();
  });

  it("sets aria-describedby when hideDetails is false and message is set", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", hideDetails: false, message: "x" } });
    expect(wrapper.find("input").attributes("aria-describedby")).toBeDefined();
  });

  it("keeps a forwarded aria-describedby when it renders no details row of its own", () => {
    const wrapper = createInputWrapper({
      props: { modelValue: "", hideDetails: true, message: "x", aria: { "aria-describedby": "outer-id" } },
    });
    expect(wrapper.find("input").attributes("aria-describedby")).toBe("outer-id");
  });

  it("joins its own details id with a forwarded one — aria-describedby is an id list", () => {
    const wrapper = createInputWrapper({
      props: { modelValue: "", message: "x", aria: { "aria-describedby": "outer-id" } },
    });
    const ownId = wrapper.findComponent({ name: "VcInputDetails" }).attributes("id");
    expect(ownId).toBeTruthy();
    expect(wrapper.find("input").attributes("aria-describedby")).toBe(`${ownId} outer-id`);
  });
});

describe("VcInput clearable", () => {
  it("gives the clear button an accessible name", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "value", clearable: true } });
    expect(wrapper.find(".vc-input__clear").attributes("aria-label")).toBeTruthy();
  });
});

describe("VcInput seamless/align", () => {
  it("renders without seamless/align modifier classes by default", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "" } });
    expect(wrapper.classes()).not.toContain("vc-input--seamless");
    expect(wrapper.classes()).toContain("vc-input--align--start");
  });

  it("adds vc-input--seamless when seamless is true", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", seamless: true } });
    expect(wrapper.classes()).toContain("vc-input--seamless");
  });

  it("adds vc-input--align--center when align is center", () => {
    const wrapper = createInputWrapper({ props: { modelValue: "", align: "center" } });
    expect(wrapper.classes()).toContain("vc-input--align--center");
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

  it("forwards align to VcInput", () => {
    const wrapper = createDateInputWrapper({ props: { modelValue: "", align: "center" } });
    expect(wrapper.findComponent({ name: "VcInput" }).classes()).toContain("vc-input--align--center");
  });
});
