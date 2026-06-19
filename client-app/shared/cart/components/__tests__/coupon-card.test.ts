import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { defineComponent, h } from "vue";
import CouponCard from "../coupon-card.vue";
import type { PropType } from "vue";

const mockTranslate = (key: string) => key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
    d: (value: unknown) => String(value),
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
  },

  emits: {
    "update:modelValue": (value: unknown) => typeof value === "string",
  },

  setup(props, { slots }) {
    return () => h("div", { class: "input" }, slots.append?.());
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

describe("CouponCard", () => {
  const createComponent = (props: { modelValue?: string } = {}) => {
    return mount(CouponCard, {
      props: {
        custom: true,
        view: "default",
        modelValue: props.modelValue ?? "",
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
});
