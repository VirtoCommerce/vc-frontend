import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { defineComponent, h } from "vue";
import CouponCard from "../coupon-card.vue";
import type { PropType } from "vue";

const mockTranslate = (key: string) => key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
    d: String,
  }),
}));

const VcInputStub = defineComponent({
  name: "VcInput",
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: "",
    },

    ariaLabel: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },

    aria: {
      type: Object as PropType<Record<string, string | number | null> | undefined>,
      default: undefined,
    },
  },

  emits: {
    "update:modelValue": (value: unknown) => typeof value === "string",
  },

  setup(props, { slots }) {
    return () =>
      h("div", { class: "input" }, [h("input", { "aria-label": props.ariaLabel, ...props.aria }), slots.append?.()]);
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  inheritAttrs: false,

  props: {
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },

  setup(props) {
    return () => h("button", { class: "button", disabled: props.disabled });
  },
});

type CouponCardPropsType = InstanceType<typeof CouponCard>["$props"];

describe("CouponCard", () => {
  const createComponent = (props: Partial<CouponCardPropsType> = {}) => {
    return mount(CouponCard, {
      props: {
        custom: true,
        view: "default",
        modelValue: "",
        ...props,
      },
      global: {
        stubs: {
          VcInput: VcInputStub,
          VcButton: VcButtonStub,
          VcIcon: true,
        },
        mocks: {
          $t: mockTranslate,
        },
      },
    });
  };

  // VCST-5021: the custom-code apply button must be disabled when the input is
  // empty so the empty-submit no-op (silent ignore in handleClick) is prevented.
  it("disables the apply button when the custom code input is empty", () => {
    const wrapper = createComponent({ modelValue: "" });

    const button = wrapper.findComponent(VcButtonStub);
    expect(button.exists()).toBe(true);
    expect(button.props("disabled")).toBe(true);
  });

  it("disables the apply button when the custom code input is only whitespace", () => {
    const wrapper = createComponent({ modelValue: "   " });

    const button = wrapper.findComponent(VcButtonStub);
    expect(button.props("disabled")).toBe(true);
  });

  it("enables the apply button when a non-empty custom code is entered", () => {
    const wrapper = createComponent({ modelValue: "SAVE10" });

    const button = wrapper.findComponent(VcButtonStub);
    expect(button.props("disabled")).toBe(false);
  });

  // VCST-5533: was named by the placeholder only.
  describe("accessible name", () => {
    it("labels the custom-code input with the visible 'Custom code' text", () => {
      const wrapper = createComponent({ custom: true });

      const nameId = wrapper.get(".coupon-card__name").attributes("id");
      expect(nameId).toBeTruthy();
      expect(wrapper.get("input").attributes("aria-labelledby")).toBe(nameId);
    });

    it("labels a preset coupon input with both its visible label and name", () => {
      const wrapper = createComponent({
        custom: false,
        coupon: { id: "1", couponCode: "SAVE10", label: "10% off", name: "Spring sale" },
      });

      const labelId = wrapper.get(".coupon-card__label").attributes("id");
      const nameId = wrapper.get(".coupon-card__name").attributes("id");
      expect(wrapper.get("input").attributes("aria-labelledby")).toBe(`${labelId} ${nameId}`);
    });

    it("falls back to an aria-label when a preset coupon has no visible text", () => {
      const wrapper = createComponent({ custom: false, coupon: { id: "1", couponCode: "SAVE10" } });

      const input = wrapper.get("input");
      expect(input.attributes("aria-labelledby")).toBeUndefined();
      expect(input.attributes("aria-label")).toBe("shared.cart.coupons_section.coupon_code_aria");
    });

    it("never references ids of elements that are not rendered", () => {
      const wrapper = createComponent({
        custom: false,
        coupon: { id: "1", couponCode: "SAVE10", name: "Spring sale" },
      });

      const labelledBy = wrapper.get("input").attributes("aria-labelledby")!.split(" ");
      expect(wrapper.find(".coupon-card__label").exists()).toBe(false);
      labelledBy.forEach((id) => {
        expect(wrapper.find(`#${id}`).exists()).toBe(true);
      });
    });
  });

  // VCST-5533: the error was announced but not tied to the field.
  describe("error association", () => {
    it("marks the input invalid and points it at the error message", () => {
      const wrapper = createComponent({ view: "error", error: "This code is not valid", modelValue: "BAD" });

      const errorId = wrapper.get(".coupon-card__error").attributes("id");
      const input = wrapper.get("input");
      expect(errorId).toBeTruthy();
      expect(input.attributes("aria-invalid")).toBe("true");
      expect(input.attributes("aria-describedby")).toBe(errorId);
    });

    it("keeps the error in a live region so it is announced", () => {
      const wrapper = createComponent({ view: "error", error: "This code is not valid", modelValue: "BAD" });

      expect(wrapper.get(".coupon-card__error").attributes("role")).toBe("alert");
    });

    it("does not mark the input invalid without an error", () => {
      const wrapper = createComponent({ view: "default", modelValue: "SAVE10" });

      const input = wrapper.get("input");
      expect(input.attributes("aria-invalid")).toBeUndefined();
      expect(input.attributes("aria-describedby")).toBeUndefined();
    });
  });
});
