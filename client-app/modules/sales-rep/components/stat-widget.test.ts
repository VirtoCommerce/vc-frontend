import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import StatWidget from "./stat-widget.vue";

const createWrapper = createWrapperFactory(mount, StatWidget, {
  global: {
    stubs: {
      VcIcon: true,
      VcLoaderOverlay: true,
    },
  },
});

const READY_PROPS = {
  label: "New orders",
  value: "0",
  icon: "cart",
  sub: "$0.00 total",
  delta: "0 placed today",
};

describe("StatWidget", () => {
  it("shows the value, sub and delta once the statistics have arrived", () => {
    const wrapper = createWrapper({ props: READY_PROPS });

    expect(wrapper.find(".stat-widget__value").text()).toBe("0");
    expect(wrapper.find(".stat-widget__sub").text()).toBe("$0.00 total");
    expect(wrapper.find(".stat-widget__delta").text()).toBe("0 placed today");
    expect(wrapper.find(".stat-widget__error").exists()).toBe(false);
  });

  // VCST-5586: the mappers can't tell "no data" from "not fetched yet", so the card owns the distinction.
  it("replaces the value with a placeholder while loading so a pending metric never reads as 0", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, loading: true } });

    expect(wrapper.find("vc-loader-overlay-stub").exists()).toBe(true);
    expect(wrapper.find(".stat-widget__value--pending").exists()).toBe(true);
    expect(wrapper.find(".stat-widget__value").text()).not.toBe("0");
    expect(wrapper.find(".stat-widget__sub").exists()).toBe(false);
    expect(wrapper.find(".stat-widget__delta").exists()).toBe(false);
  });

  it("shows the error state instead of the figures when the statistics query failed", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, errorText: "Couldn't load" } });

    expect(wrapper.find(".stat-widget__error").text()).toBe("Couldn't load");
    expect(wrapper.find(".stat-widget__value").exists()).toBe(false);
    expect(wrapper.find(".stat-widget__sub").exists()).toBe(false);
    expect(wrapper.find(".stat-widget__delta").exists()).toBe(false);
  });

  it("prefers the loading placeholder over a stale error while a retry is in flight", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, loading: true, errorText: "Couldn't load" } });

    expect(wrapper.find(".stat-widget__value--pending").exists()).toBe(true);
    expect(wrapper.find(".stat-widget__error").exists()).toBe(false);
  });

  it("keeps the label visible in every state so a failed card is still identifiable", () => {
    const loading = createWrapper({ props: { ...READY_PROPS, loading: true } });
    const failed = createWrapper({ props: { ...READY_PROPS, errorText: "Couldn't load" } });

    expect(loading.find(".stat-widget__label").text()).toBe("New orders");
    expect(failed.find(".stat-widget__label").text()).toBe("New orders");
  });
});
