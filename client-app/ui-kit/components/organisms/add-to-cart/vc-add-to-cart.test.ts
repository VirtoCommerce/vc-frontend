import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails, VcPopover, VcTooltip } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcAddToCart } from "@/ui-kit/components/organisms";

const createWrapper = createWrapperFactory(VcAddToCart, {
  global: {
    components: {
      VcInput: VcInput,
      VcInputDetails: VcInputDetails,
      VcButton: VcButton,
      VcTooltip: VcTooltip,
      VcPopover: VcPopover,
    },
    stubs: {
      VcLabel: true,
      VcIcon: true,
    },
  },
});

describe("AddToCart", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("renders with default add to cart text", () => {
    const wrapper = createWrapper({
      props: { modelValue: 1 },
    });
    expect(wrapper.html()).toContain("ui_kit.buttons.add_to_cart");
  });

  it("displays the quantity input with initial modelValue", () => {
    const wrapper = createWrapper({
      props: { modelValue: 3 },
    });
    const input = wrapper.find("input[type='number']");
    expect(input.exists()).toBe(true);
    expect((input.element as HTMLInputElement).value).toBe("3");
  });

  it("updates the displayed quantity when modelValue changes", async () => {
    const wrapper = createWrapper({
      props: { modelValue: 2 },
    });
    const input = wrapper.find("input[type='number']");
    await wrapper.setProps({ modelValue: 5 });
    expect((input.element as HTMLInputElement).value).toBe("5");
  });

  it("emits 'update:cartItemQuantity' event with current quantity when button is clicked", async () => {
    const wrapper = createWrapper({
      props: { modelValue: 2, isActive: true, isAvailable: true, isBuyable: true, isInStock: true },
    });
    const button = wrapper.find(".vc-add-to-cart__icon-button, .vc-add-to-cart__text-button");
    await button.trigger("click");
    const emitted = wrapper.emitted("update:cartItemQuantity");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual([2]);
  });

  it("does not show the button if hideButton is true", () => {
    const wrapper = createWrapper({
      props: { modelValue: 2, hideButton: true },
    });
    expect(wrapper.find(".vc-add-to-cart__icon-button").exists()).toBe(false);
    expect(wrapper.find(".vc-add-to-cart__text-button").exists()).toBe(false);
  });

  it("emits 'update:modelValue' when quantity input changes with valid data", async () => {
    const wrapper = createWrapper({
      props: { modelValue: 1 },
    });
    const input = wrapper.find("input[type='number']");
    await input.setValue("4");
    await vi.advanceTimersToNextTimerAsync();
    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]).toEqual([4]);
  });

  it("does not emit 'update:modelValue' if new quantity is the same as the old one", async () => {
    const wrapper = createWrapper({ props: { modelValue: 5 } });
    const input = wrapper.find("input[type='number']");
    await input.setValue("5");
    await vi.advanceTimersToNextTimerAsync();
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("does not allow quantity beyond LINE_ITEM_QUANTITY_LIMIT and truncates input", async () => {
    const wrapper = createWrapper({ props: { modelValue: 1 } });
    const input = wrapper.find("input[type='number']");
    const largeNumber = (LINE_ITEM_QUANTITY_LIMIT * 10).toString();
    await input.setValue(largeNumber);
    await vi.advanceTimersToNextTimerAsync();
    const trimmedValue = (input.element as HTMLInputElement).value;
    expect(Number(trimmedValue)).toBe(LINE_ITEM_QUANTITY_LIMIT);
  });

  it("resets quantity input to modelValue if invalid value is provided and loses focus", async () => {
    const wrapper = createWrapper({ props: { modelValue: 2 } });
    const input = wrapper.find("input[type='number']");
    await input.setValue("0");
    await input.trigger("blur");
    expect((input.element as HTMLInputElement).value).toBe("2");
  });

  it("renders a message if provided via props", async () => {
    const wrapper = createWrapper({ props: { modelValue: 1, message: "Stock limited" } });
    await nextTick();
    expect(wrapper.html()).toContain("Stock limited");
  });

  describe("disabled", () => {
    it("disables the button if disabled prop is set", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, disabled: true },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables the button if isActive is false", () => {
      const wrapper = createWrapper({
        props: {
          modelValue: 1,
          isActive: false,
          isAvailable: true,
          isBuyable: true,
          isInStock: true,
        },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables the button if isAvailable is false", () => {
      const wrapper = createWrapper({
        props: {
          modelValue: 1,
          isActive: true,
          isAvailable: false,
          isBuyable: true,
          isInStock: true,
        },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables the button if isBuyable is false", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, isActive: true, isAvailable: true, isBuyable: false, isInStock: true },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables the button if isInStock is false", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, isActive: true, isAvailable: true, isBuyable: true, isInStock: false },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });
  });
});
