import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import SelectAddressMapList from "../select-address-map-list.vue";
import type { PickupLocationType } from "@/shared/checkout/composables";

const mockTranslate = (key: string) => key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
    d: String,
  }),
}));

const focusAddressRadioMock = vi.fn();

vi.mock("@/shared/checkout/composables", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/checkout/composables")>();
  return {
    ...actual,
    focusAddressRadio: (id: string) => focusAddressRadioMock(id),
  };
});

vi.mock("@/core/utilities/address", () => ({
  getAddressName: () => "address-name",
}));

const PickupAvailabilityInfoStub = defineComponent({
  name: "PickupAvailabilityInfo",
  setup: () => () => h("div"),
});

const VcScrollbarStub = defineComponent({
  name: "VcScrollbar",

  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  },
});

const VcRadioButtonStub = defineComponent({
  name: "VcRadioButton",

  setup(_props, { slots }) {
    return () => h("div", slots.default?.());
  },
});

function createAddress(id: string): PickupLocationType {
  return { id, name: `Location ${id}` };
}

function createComponent(addresses: PickupLocationType[]) {
  return mount(SelectAddressMapList, {
    props: { addresses },
    global: {
      stubs: {
        VcScrollbar: VcScrollbarStub,
        VcRadioButton: VcRadioButtonStub,
        VcButton: true,
        PickupAvailabilityInfo: PickupAvailabilityInfoStub,
      },
      mocks: { $t: mockTranslate },
    },
  });
}

// nextTick + requestAnimationFrame are awaited inside the watcher before focus is moved.
async function flushFocusTicks() {
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await nextTick();
}

describe("SelectAddressMapList focus watcher", () => {
  beforeEach(() => {
    focusAddressRadioMock.mockClear();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  it("moves focus to the first appended item on a true load-more append (prefix preserved, length grows)", async () => {
    const wrapper = createComponent([createAddress("a"), createAddress("b")]);

    await wrapper.setProps({
      addresses: [createAddress("a"), createAddress("b"), createAddress("c"), createAddress("d")],
    });
    await flushFocusTicks();

    expect(focusAddressRadioMock).toHaveBeenCalledTimes(1);
    expect(focusAddressRadioMock).toHaveBeenCalledWith("c");
  });

  it("does NOT move focus when a filter refetch replaces the set even though length grows", async () => {
    const wrapper = createComponent([createAddress("a"), createAddress("b")]);

    // Replacement: prefix is not preserved (different ids), but the list is longer than before.
    await wrapper.setProps({
      addresses: [createAddress("x"), createAddress("y"), createAddress("z")],
    });
    await flushFocusTicks();

    expect(focusAddressRadioMock).not.toHaveBeenCalled();
  });

  it("does NOT move focus when the set shrinks (filter narrowing)", async () => {
    const wrapper = createComponent([createAddress("a"), createAddress("b"), createAddress("c")]);

    await wrapper.setProps({ addresses: [createAddress("a")] });
    await flushFocusTicks();

    expect(focusAddressRadioMock).not.toHaveBeenCalled();
  });

  it("does NOT move focus when the prefix partially overlaps but diverges before the old length", async () => {
    const wrapper = createComponent([createAddress("a"), createAddress("b")]);

    // Shares the first id but diverges at index 1, so it is a replacement, not an append.
    await wrapper.setProps({
      addresses: [createAddress("a"), createAddress("c"), createAddress("d")],
    });
    await flushFocusTicks();

    expect(focusAddressRadioMock).not.toHaveBeenCalled();
  });

  it("does NOT move focus on the initial render (no previous list)", async () => {
    createComponent([createAddress("a"), createAddress("b")]);
    await flushFocusTicks();

    expect(focusAddressRadioMock).not.toHaveBeenCalled();
  });
});
