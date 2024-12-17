import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { LINE_ITEM_QUANTITY_LIMIT } from "@/core/constants";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcInputDetails, VcPopover, VcTooltip } from "@/ui-kit/components/atoms";
import { VcButton, VcInput } from "@/ui-kit/components/molecules";
import { VcAddToCart } from "@/ui-kit/components/organisms";

const BUTTONS_SELECTOR = ".vc-add-to-cart__icon-button, .vc-add-to-cart__text-button";

const createWrapper = createWrapperFactory(mount, VcAddToCart, {
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

  describe("render", () => {
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

    it("displays updated quantity when modelValue changes", async () => {
      const wrapper = createWrapper({
        props: { modelValue: 2 },
      });
      const input = wrapper.find("input[type='number']");
      await wrapper.setProps({ modelValue: 5 });
      expect((input.element as HTMLInputElement).value).toBe("5");
    });

    it("does not display button if hideButton is true", () => {
      const wrapper = createWrapper({
        props: { modelValue: 2, hideButton: true },
      });
      expect(wrapper.find(BUTTONS_SELECTOR).exists()).toBe(false);
    });

    it("displays message if provided via props", async () => {
      const wrapper = createWrapper({ props: { modelValue: 1, message: "Stock limited" } });
      await nextTick();
      expect(wrapper.html()).toContain("Stock limited");
    });
  });

  describe("on input", () => {
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

    it("resets quantity input to modelValue if invalid value is provided and loses focus", async () => {
      const wrapper = createWrapper({ props: { modelValue: 2 } });
      const input = wrapper.find("input[type='number']");
      await input.setValue("0");
      await input.trigger("blur");
      expect((input.element as HTMLInputElement).value).toBe("2");
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

    it("does not emit 'update:modelValue' if new quantity is the same as the old one", async () => {
      const wrapper = createWrapper({ props: { modelValue: 5 } });
      const input = wrapper.find("input[type='number']");
      await input.setValue("5");
      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.emitted("update:modelValue")).toBeFalsy();
    });
  });

  describe("on button click", () => {
    it("emits 'update:cartItemQuantity' event with current quantity when button is clicked", async () => {
      const wrapper = createWrapper({
        props: { modelValue: 2, isActive: true, isAvailable: true, isBuyable: true, isInStock: true },
      });
      const button = wrapper.find(BUTTONS_SELECTOR);
      await button.trigger("click");
      const emitted = wrapper.emitted("update:cartItemQuantity");
      expect(emitted).toBeTruthy();
      expect(emitted?.[0]).toEqual([2]);
    });

    it("does not emit 'update:cartItemQuantity event on button click if the button is disabled", async () => {
      const wrapper = createWrapper({
        props: { modelValue: 2, disabled: true },
      });
      const button = wrapper.find(BUTTONS_SELECTOR);
      await button.trigger("click");
      expect(wrapper.emitted("update:cartItemQuantity")).toBeFalsy();
    });
  });

  describe("validation", () => {
    it("emits 'update:validation' event with true if validation is successful", async () => {
      const wrapper = createWrapper({ props: { isInStock: true, modelValue: 1 } });
      await wrapper.find("input[type='number']").setValue("2");
      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.emitted("update:validation")).toBeTruthy();
      expect(wrapper.emitted("update:validation")?.[0]).toEqual([{ isValid: true }]);
    });

    it("emits 'update:validation' event with false if validation fails", async () => {
      const wrapper = createWrapper({ props: { isInStock: true, modelValue: 1, maxQuantity: 9 } });
      await wrapper.find("input[type='number']").setValue("10");
      await vi.advanceTimersToNextTimerAsync();
      expect(wrapper.emitted("update:validation")).toBeTruthy();
      expect(wrapper.emitted("update:validation")?.[1]).toEqual([
        { errorMessage: "ui_kit.add_to_cart.errors.max", isValid: false },
      ]);
    });
  });

  describe("disabled", () => {
    it("disables button if disabled prop is set", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, disabled: true },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables button if isActive is false", () => {
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

    it("disables button if isAvailable is false", () => {
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

    it("disables button if isBuyable is false", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, isActive: true, isAvailable: true, isBuyable: false, isInStock: true },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("disables button if isInStock is false", () => {
      const wrapper = createWrapper({
        props: { modelValue: 1, isActive: true, isAvailable: true, isBuyable: true, isInStock: false },
      });
      const button = wrapper.find("button");
      expect(button.attributes("disabled")).toBeDefined();
    });
  });
});
