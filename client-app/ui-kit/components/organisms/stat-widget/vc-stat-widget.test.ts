import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory } from "@/core/utilities/tests";
import uiKitMessages from "@/ui-kit/locales/en.json";
import VcStatWidget from "./vc-stat-widget.vue";
import type { VueWrapper } from "@vue/test-utils";

const i18n = createI18n({ locale: "en", legacy: false, messages: { en: uiKitMessages }, missingWarn: false });

const createWrapper = createWrapperFactory(mount, VcStatWidget, {
  global: {
    plugins: [i18n],
    stubs: {
      VcIcon: true,
      VcLoaderOverlay: true,
    },
  },
});

type PropsType = InstanceType<typeof VcStatWidget>["$props"];

const LABEL = "Orders in “New” status";
const ERROR_TEXT = "Couldn't load";

const READY_PROPS = {
  label: LABEL,
  value: "128",
  icon: "cart",
  description: "$3,150.00 total",
  delta: "of 21 created in the last 7 days",
};

async function mountSettled(props: PropsType, slots?: Record<string, string>) {
  const wrapper = createWrapper({ props, slots });
  await nextTick();
  return wrapper;
}

function statusOf(wrapper: VueWrapper) {
  return wrapper.find("output").text();
}

function visibleText(wrapper: VueWrapper) {
  return wrapper.text().replace(statusOf(wrapper), "");
}

function hiddenText(wrapper: VueWrapper) {
  return wrapper
    .findAll('[aria-hidden="true"]')
    .map((node) => node.text())
    .join(" ");
}

function iconNames(wrapper: VueWrapper) {
  return wrapper.findAllComponents({ name: "VcIcon" }).map((icon) => icon.attributes("name"));
}

function hasLoader(wrapper: VueWrapper) {
  return wrapper.findComponent({ name: "VcLoaderOverlay" }).exists();
}

describe("VcStatWidget", () => {
  it("shows every figure once the data has arrived, with no spinner and an empty status", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, valueSuffix: "items", deltaIcon: "chevron-up" });

    expect(visibleText(wrapper)).toContain(READY_PROPS.value);
    expect(visibleText(wrapper)).toContain("items");
    expect(visibleText(wrapper)).toContain(READY_PROPS.description);
    expect(visibleText(wrapper)).toContain(READY_PROPS.delta);
    expect(iconNames(wrapper)).toEqual(["cart", "chevron-up"]);
    expect(hasLoader(wrapper)).toBe(false);
    expect(statusOf(wrapper)).toBe("");
  });

  it("renders only the label and value when every optional prop is left out", async () => {
    const wrapper = await mountSettled({ label: LABEL, value: "128" });

    expect(visibleText(wrapper).replace(/\s+/g, "")).toBe(`${LABEL}128`.replace(/\s+/g, ""));
    expect(iconNames(wrapper)).toEqual([]);
  });

  it("announces loading for its own metric and hides every figure, so a pending metric never reads as 0", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, value: "0", loading: true });

    expect(statusOf(wrapper)).toBe(`${LABEL}: loading`);
    expect(hasLoader(wrapper)).toBe(true);
    expect(hiddenText(wrapper)).toContain("—");
    expect(visibleText(wrapper)).not.toMatch(/\b0\b/);
    expect(visibleText(wrapper)).not.toContain(READY_PROPS.description);
    expect(visibleText(wrapper)).not.toContain(READY_PROPS.delta);
  });

  it("announces the error with its metric instead of the figures, and the visible row is not read twice", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, errorText: ERROR_TEXT });

    expect(statusOf(wrapper)).toBe(`${LABEL}: ${ERROR_TEXT}`);
    expect(hiddenText(wrapper)).toContain(ERROR_TEXT);
    expect(iconNames(wrapper)).toEqual(["cart", "exclamation-circle"]);
    expect(hasLoader(wrapper)).toBe(false);
    expect(visibleText(wrapper)).not.toContain(READY_PROPS.value);
    expect(visibleText(wrapper)).not.toContain(READY_PROPS.description);
    expect(visibleText(wrapper)).not.toContain(READY_PROPS.delta);
  });

  it("prefers the loading state over a stale error while a retry is in flight", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, loading: true, errorText: ERROR_TEXT });

    expect(statusOf(wrapper)).toBe(`${LABEL}: loading`);
    expect(wrapper.text()).not.toContain(ERROR_TEXT);
  });

  it("keeps the label visible in every state so a failed card is still identifiable", async () => {
    const ready = await mountSettled(READY_PROPS);
    const loading = await mountSettled({ label: LABEL, loading: true });
    const failed = await mountSettled({ label: LABEL, errorText: ERROR_TEXT });

    expect(visibleText(ready)).toContain(LABEL);
    expect(visibleText(loading)).toContain(LABEL);
    expect(visibleText(failed)).toContain(LABEL);
  });

  it("shows the placeholder dash instead of a blank figure when a ready card has no value", async () => {
    const missing = await mountSettled({ label: LABEL, valueSuffix: "items" });
    const empty = await mountSettled({ label: LABEL, value: "", valueSuffix: "items" });
    const blank = await mountSettled({ label: LABEL, value: " ", valueSuffix: "items" });
    const zero = await mountSettled({ label: LABEL, value: "0" });

    for (const wrapper of [missing, empty, blank]) {
      expect(hiddenText(wrapper)).toBe("—");
      expect(visibleText(wrapper)).not.toContain("items");
    }
    expect(visibleText(zero)).toContain("0");
    expect(hiddenText(zero)).toBe("");
  });

  it("treats a blank error text as no error and keeps showing the figures", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, errorText: " " });

    expect(statusOf(wrapper)).toBe("");
    expect(iconNames(wrapper)).not.toContain("exclamation-circle");
    expect(visibleText(wrapper)).toContain(READY_PROPS.value);
  });

  it("keeps the same status region mounted across every state", async () => {
    const wrapper = await mountSettled(READY_PROPS);
    const region = wrapper.find("output").element;

    await wrapper.setProps({ loading: true });
    await wrapper.setProps({ loading: false, errorText: ERROR_TEXT });

    expect(wrapper.find("output").element).toBe(region);
  });

  it("applies the accent and delta colors, neutral by default", async () => {
    const neutral = await mountSettled(READY_PROPS);
    const colored = await mountSettled({ ...READY_PROPS, color: "info", deltaColor: "danger" });
    const deltaOf = (wrapper: VueWrapper) =>
      wrapper.findAll("div").find((node) => node.text().trim() === READY_PROPS.delta);

    expect(neutral.classes()).toContain("vc-stat-widget--color--neutral");
    expect(deltaOf(neutral)?.classes()).toContain("vc-stat-widget__delta--color--neutral");
    expect(colored.classes()).toContain("vc-stat-widget--color--info");
    expect(deltaOf(colored)?.classes()).toContain("vc-stat-widget__delta--color--danger");
  });

  it("renders the prepend slot next to the icon, not instead of it", async () => {
    const wrapper = await mountSettled(READY_PROPS, { prepend: '<span data-test-id="drag-handle"></span>' });

    expect(wrapper.find('[data-test-id="drag-handle"]').exists()).toBe(true);
    expect(iconNames(wrapper)).toContain("cart");
  });
});
