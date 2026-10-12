import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import { createWrapperFactory } from "@/core/utilities/tests";
import uiKitMessages from "@/ui-kit/locales/en.json";
import VcStatWidget from "./vc-stat-widget.vue";
import type { VueWrapper } from "@vue/test-utils";

// Real kit messages: the status text is built from them, and the label must reach it.
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

// Every text distinct from the others, so finding one in the card can't be a match inside another.
const READY_PROPS = {
  label: "Orders in “New” status",
  value: "128",
  icon: "cart",
  sub: "$3,150.00 total",
  delta: "of 21 created in the last 7 days",
};

const ERROR_TEXT = "Couldn't load";

// The status region is filled after mount, so wait a tick before reading it.
async function mountSettled(props: InstanceType<typeof VcStatWidget>["$props"]) {
  const wrapper = createWrapper({ props });
  await nextTick();
  return wrapper;
}

function statusOf(wrapper: VueWrapper) {
  return wrapper.find("output").text();
}

// Visible text screen readers must skip, because the status region already says it.
function hiddenText(wrapper: VueWrapper) {
  return wrapper
    .findAll('[aria-hidden="true"]')
    .map((node) => node.text())
    .join(" ");
}

describe("VcStatWidget", () => {
  it("shows the value, unit, sub and delta once the data has arrived", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, valueSuffix: "items" });

    expect(wrapper.text()).toContain(READY_PROPS.value);
    expect(wrapper.text()).toContain("items");
    expect(wrapper.text()).toContain(READY_PROPS.sub);
    expect(wrapper.text()).toContain(READY_PROPS.delta);
    expect(statusOf(wrapper)).toBe("");
  });

  // The caller can't always tell "no data" from "not fetched yet", so the card owns the distinction.
  it("announces loading for its own metric and hides every figure, so a pending metric never reads as 0", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, value: "0", loading: true });

    expect(statusOf(wrapper)).toContain(READY_PROPS.label);
    expect(wrapper.findComponent({ name: "VcLoaderOverlay" }).exists()).toBe(true);
    expect(hiddenText(wrapper)).toContain("—");
    expect(wrapper.text()).not.toContain(READY_PROPS.sub);
    expect(wrapper.text()).not.toContain(READY_PROPS.delta);
    expect(wrapper.text().replace(READY_PROPS.label, "")).not.toMatch(/\b0\b/);
  });

  it("announces the error with its metric instead of the figures, and the visible row is not read twice", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, errorText: ERROR_TEXT });

    expect(statusOf(wrapper)).toContain(READY_PROPS.label);
    expect(statusOf(wrapper)).toContain(ERROR_TEXT);
    expect(hiddenText(wrapper)).toContain(ERROR_TEXT);
    expect(wrapper.text()).not.toContain(READY_PROPS.value);
    expect(wrapper.text()).not.toContain(READY_PROPS.sub);
    expect(wrapper.text()).not.toContain(READY_PROPS.delta);
  });

  it("prefers the loading state over a stale error while a retry is in flight", async () => {
    const wrapper = await mountSettled({ ...READY_PROPS, loading: true, errorText: ERROR_TEXT });

    expect(statusOf(wrapper)).not.toContain(ERROR_TEXT);
    expect(wrapper.text()).not.toContain(ERROR_TEXT);
  });

  it("keeps the label visible in every state so a failed card is still identifiable", async () => {
    const loading = await mountSettled({ label: READY_PROPS.label, loading: true });
    const failed = await mountSettled({ label: READY_PROPS.label, errorText: ERROR_TEXT });

    expect(loading.text()).toContain(READY_PROPS.label);
    expect(failed.text()).toContain(READY_PROPS.label);
  });

  // A region that appears together with its text is not reliably announced.
  it("mounts the status region empty and fills it only after mount", async () => {
    const wrapper = createWrapper({ props: { ...READY_PROPS, errorText: ERROR_TEXT } });

    expect(statusOf(wrapper)).toBe("");

    await nextTick();

    expect(statusOf(wrapper)).toContain(ERROR_TEXT);
  });

  it("keeps the same status region mounted across every state", async () => {
    const wrapper = await mountSettled(READY_PROPS);
    const region = wrapper.find("output").element;

    await wrapper.setProps({ loading: true });
    await wrapper.setProps({ loading: false, errorText: ERROR_TEXT });

    expect(wrapper.find("output").element).toBe(region);
  });

  it("renders the prepend slot", async () => {
    const wrapper = createWrapper({
      props: READY_PROPS,
      slots: { prepend: '<span data-test-id="drag-handle"></span>' },
    });
    await nextTick();

    expect(wrapper.find('[data-test-id="drag-handle"]').exists()).toBe(true);
  });
});
