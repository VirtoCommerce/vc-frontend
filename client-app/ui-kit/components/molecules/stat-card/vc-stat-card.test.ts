import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcStatCard } from "@/ui-kit/components/molecules";

const createWrapper = createWrapperFactory(mount, VcStatCard, {
  global: {
    stubs: {
      VcIcon: true,
      VcLoaderOverlay: true,
    },
  },
});

const READY_PROPS = {
  label: "Orders in “New” status",
  value: "0",
  icon: "cart",
  sub: "$0.00 total",
  delta: "of 0 created in the last 7 days",
};

describe("VcStatCard", () => {
  it("shows the value, sub and delta once the figures have arrived", () => {
    const wrapper = createWrapper({ props: READY_PROPS });

    expect(wrapper.find(".vc-stat-card__value").text()).toBe("0");
    expect(wrapper.find(".vc-stat-card__sub").text()).toBe("$0.00 total");
    expect(wrapper.find(".vc-stat-card__delta").text()).toBe("of 0 created in the last 7 days");
    expect(wrapper.find(".vc-stat-card__error").exists()).toBe(false);
  });

  // VCST-5586: a mapper can't tell "no data" from "not fetched yet", so the card owns the distinction.
  it("replaces the value with a placeholder while loading so a pending metric never reads as 0", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, loading: true } });

    expect(wrapper.find("vc-loader-overlay-stub").exists()).toBe(true);
    expect(wrapper.find(".vc-stat-card__value--pending").exists()).toBe(true);
    expect(wrapper.find(".vc-stat-card__value").text()).not.toBe("0");
    expect(wrapper.find(".vc-stat-card__sub").exists()).toBe(false);
    expect(wrapper.find(".vc-stat-card__delta").exists()).toBe(false);
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it("shows the error state instead of the figures when the figure could not be fetched", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, errorText: "Couldn't load" } });

    expect(wrapper.find(".vc-stat-card__error").text()).toBe("Couldn't load");
    expect(wrapper.find(".vc-stat-card__value").exists()).toBe(false);
    expect(wrapper.find(".vc-stat-card__sub").exists()).toBe(false);
    expect(wrapper.find(".vc-stat-card__delta").exists()).toBe(false);
  });

  it("prefers the loading placeholder over a stale error while a retry is in flight", () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, loading: true, errorText: "Couldn't load" } });

    expect(wrapper.find(".vc-stat-card__value--pending").exists()).toBe(true);
    expect(wrapper.find(".vc-stat-card__error").exists()).toBe(false);
  });

  it("keeps the label visible in every state so a failed card is still identifiable", () => {
    const loading = createWrapper({ props: { ...READY_PROPS, loading: true } });
    const failed = createWrapper({ props: { ...READY_PROPS, errorText: "Couldn't load" } });

    expect(loading.find(".vc-stat-card__label").text()).toBe("Orders in “New” status");
    expect(failed.find(".vc-stat-card__label").text()).toBe("Orders in “New” status");
  });

  // The color names the class that sets `--vc-stat-card-accent`; neutral is the default.
  it("takes its accent from the color, neutral unless told otherwise", () => {
    expect(createWrapper({ props: READY_PROPS }).classes()).toContain("vc-stat-card--color--neutral");
    expect(createWrapper({ props: { ...READY_PROPS, color: "info" } }).classes()).toContain(
      "vc-stat-card--color--info",
    );
  });

  it("colors the delta by its tone, positive unless told otherwise", () => {
    expect(createWrapper({ props: READY_PROPS }).find(".vc-stat-card__delta--positive").exists()).toBe(true);
    expect(
      createWrapper({ props: { ...READY_PROPS, deltaTone: "negative" } })
        .find(".vc-stat-card__delta--negative")
        .exists(),
    ).toBe(true);
  });

  it("renders the leading slot ahead of the icon and the label", () => {
    const wrapper = createWrapper({
      props: READY_PROPS,
      slots: { leading: '<span class="handle" />' },
    });

    const head = wrapper.get(".vc-stat-card__head").element;
    expect(head.firstElementChild?.classList.contains("handle")).toBe(true);
  });

  // The ai-tools regression suites (Frontend/sales-rep) select on the tile's classes from before it moved into
  // the kit; every one must stay beside its `vc-stat-card` counterpart until the suites move over.
  it("keeps the legacy stat-widget classes beside their vc-stat-card counterparts", () => {
    const ready = createWrapper({
      props: { ...READY_PROPS, color: "info", valueSuffix: "items", deltaTone: "negative" },
    });
    const failed = createWrapper({ props: { ...READY_PROPS, errorText: "Couldn't load" } });
    const loading = createWrapper({ props: { ...READY_PROPS, loading: true } });

    expect(ready.classes()).toEqual(expect.arrayContaining(["stat-widget", "stat-widget--info"]));
    for (const part of ["head", "label", "value", "unit", "sub", "delta", "delta--negative"]) {
      expect(ready.find(`.vc-stat-card__${part}.stat-widget__${part}`).exists(), part).toBe(true);
    }
    expect(ready.find(".vc-stat-card__icon.stat-widget__icon").exists()).toBe(true);
    expect(failed.find(".vc-stat-card__error.stat-widget__error").exists()).toBe(true);
    expect(loading.find(".vc-stat-card__value--pending.stat-widget__value--pending").exists()).toBe(true);
  });

  // Skeleton mode: the box and a bar per line, so the placeholder is as tall as the card it stands in for.
  it("draws a bar per line and nothing else in placeholder mode", () => {
    const wrapper = createWrapper({ props: { placeholder: true } });

    expect(wrapper.classes()).toContain("vc-stat-card--placeholder");
    expect(wrapper.classes()).toEqual(expect.arrayContaining(["stat-widget", "stat-widget--neutral"]));
    expect(wrapper.findAll(".vc-stat-card__bar")).toHaveLength(4);
    for (const part of ["label", "value", "sub", "delta"]) {
      expect(wrapper.find(`.vc-stat-card__bar.stat-widget__${part}`).exists(), part).toBe(true);
    }
    expect(wrapper.find(".vc-stat-card__head").exists()).toBe(false);
    expect(wrapper.find("vc-loader-overlay-stub").exists()).toBe(false);
  });
});
