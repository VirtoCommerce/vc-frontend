import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import VcStatWidget from "./vc-stat-widget.vue";

const createWrapper = createWrapperFactory(mount, VcStatWidget, {
  global: {
    stubs: {
      VcIcon: true,
      VcLoaderOverlay: true,
    },
  },
});

// Every text distinct from the others, so finding one in the card can't be a match inside another.
const READY_PROPS = {
  label: "Orders in “New” status",
  value: "128",
  icon: "cart",
  sub: "$3,150.00 total",
  delta: "of 21 created in the last 7 days",
};

const ERROR_TEXT = "Couldn't load";

describe("VcStatWidget", () => {
  it("shows the value, sub and delta once the data has arrived", () => {
    const wrapper = createWrapper({ props: READY_PROPS });

    expect(wrapper.text()).toContain(READY_PROPS.value);
    expect(wrapper.text()).toContain(READY_PROPS.sub);
    expect(wrapper.text()).toContain(READY_PROPS.delta);
    expect(wrapper.find("output").text()).toBe("");
  });

  // The caller can't always tell "no data" from "not fetched yet", so the card owns the distinction.
  it("announces loading and hides every figure, so a pending metric never reads as 0", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, value: "0", loading: true } });

    expect(wrapper.find("output").text()).not.toBe("");
    expect(wrapper.findComponent({ name: "VcLoaderOverlay" }).exists()).toBe(true);
    expect(wrapper.text()).not.toContain("0");
    expect(wrapper.text()).not.toContain(READY_PROPS.sub);
    expect(wrapper.text()).not.toContain(READY_PROPS.delta);
  });

  it("announces the error instead of the figures when the data failed to load", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, errorText: ERROR_TEXT } });

    expect(wrapper.find("output").text()).toBe(ERROR_TEXT);
    expect(wrapper.text()).not.toContain(READY_PROPS.value);
    expect(wrapper.text()).not.toContain(READY_PROPS.sub);
    expect(wrapper.text()).not.toContain(READY_PROPS.delta);
  });

  it("prefers the loading state over a stale error while a retry is in flight", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, loading: true, errorText: ERROR_TEXT } });

    expect(wrapper.find("output").text()).not.toBe("");
    expect(wrapper.text()).not.toContain(ERROR_TEXT);
  });

  it("keeps the label visible in every state so a failed card is still identifiable", () => {
    const loading = createWrapper({ props: { ...READY_PROPS, loading: true } });
    const failed = createWrapper({ props: { ...READY_PROPS, errorText: ERROR_TEXT } });

    expect(loading.text()).toContain(READY_PROPS.label);
    expect(failed.text()).toContain(READY_PROPS.label);
  });

  // A region inserted together with its text is not reliably announced, so it must outlive every state.
  it("keeps the same status live region mounted across every state", async () => {
    const wrapper = createWrapper({ props: READY_PROPS });
    const region = wrapper.find("output").element;

    await wrapper.setProps({ loading: true });
    await wrapper.setProps({ loading: false, errorText: ERROR_TEXT });

    expect(wrapper.find("output").element).toBe(region);
  });
});
