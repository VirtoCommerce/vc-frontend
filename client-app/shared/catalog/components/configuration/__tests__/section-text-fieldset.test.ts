/* eslint-disable vue/one-component-per-file */
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { defineComponent, h } from "vue";
import SectionTextFieldset from "../section-text-fieldset.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { PropType } from "vue";

// Mock translations function
const mockTranslate = (key: string) => {
  const translations: Record<string, string> = {
    "shared.catalog.product_details.product_configuration.section-text-fieldset.no_selection": "No selection",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.custom_input": "Custom input",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.predefined_prefix": "Option",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.none": "None",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.custom_option_with_input":
      "Custom: {0}",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.custom_option_empty": "Custom",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.enter_custom_text": "Enter custom text",
    "shared.catalog.product_details.product_configuration.section-text-fieldset.option_label": "Option {0}: {1}",
  };
  return translations[key] || key;
};

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
  }),
}));

const VcRadioButtonStub = defineComponent({
  name: "VcRadioButton",

  props: {
    modelValue: {
      type: String as PropType<string | undefined>,
      required: true,
    },

    value: {
      type: String as PropType<string | undefined>,
      required: true,
    },
  },

  emits: {
    "update:modelValue": (value: string | undefined) => {
      return typeof value === "string" || typeof value === "undefined";
    },
  },

  setup(props, { emit, attrs }) {
    const handleClick = () => emit("update:modelValue", props.value);
    return () =>
      h("div", {
        "data-test-id": attrs["data-test-id"],
        class: ["radio-button", { selected: props.modelValue === props.value }],
        onClick: handleClick,
      });
  },
});

const VcInputStub = defineComponent({
  name: "VcInput",
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },

  emits: {
    "update:modelValue": (value: unknown) => {
      return typeof value === "string";
    },

    input: (e: { target: { value: unknown } }) => {
      return e && e.target && typeof e.target.value === "string";
    },

    focus: () => true,
  },

  setup(props, { emit, attrs }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;
      emit("update:modelValue", value);
      emit("input", { target: { value } });
    };

    const handleFocus = () => emit("focus");
    return () =>
      h("input", {
        "data-test-id": attrs["data-test-id"] as string,
        class: "input",
        value: props.modelValue,
        onInput: handleInput,
        onFocus: handleFocus,
      });
  },
});

describe("SectionTextFieldset", () => {
  const createComponent = (props: { section?: Partial<ConfigurationSectionType>; initialValue?: string } = {}) => {
    return mount(SectionTextFieldset, {
      props: {
        section: {
          name: "Test Section",
          allowCustomText: true,
          allowTextOptions: true,
          isRequired: false,
          options: [
            { id: "1", text: "Option 1" },
            { id: "2", text: "Option 2" },
          ],
          ...props.section,
        } as ConfigurationSectionType,
        initialValue: props.initialValue,
      },
      global: {
        stubs: {
          VcRadioButton: VcRadioButtonStub,
          VcInput: VcInputStub,
        },
        mocks: {
          $t: mockTranslate,
        },
      },
    });
  };

  describe("Component rendering", () => {
    it("renders correctly with default props", () => {
      const wrapper = createComponent();
      expect(wrapper.find("fieldset").exists()).toBe(true);
      const options = [
        wrapper.find('[data-test-id="custom-input-radio"]'),
        wrapper.find('[data-test-id="predefined-option-1"]'),
        wrapper.find('[data-test-id="predefined-option-2"]'),
        wrapper.find('[data-test-id="none-option"]'),
      ];
      expect(options.every((option) => option.exists())).toBe(true);
    });

    it('does not render "None" option when isRequired is true', () => {
      const wrapper = createComponent({
        section: { isRequired: true },
      });
      const options = [
        wrapper.find('[data-test-id="custom-input-radio"]'),
        wrapper.find('[data-test-id="predefined-option-1"]'),
        wrapper.find('[data-test-id="predefined-option-2"]'),
      ];
      expect(options.every((option) => option.exists())).toBe(true);
      expect(wrapper.find('[data-test-id="none-option"]').exists()).toBe(false);
    });

    it("hides custom input radio when specified conditions are met", () => {
      const wrapper = createComponent({
        section: {
          isRequired: true,
          allowCustomText: true,
          allowTextOptions: false,
        },
      });
      expect(wrapper.find('[data-test-id="custom-input-radio"]').exists()).toBe(false);
    });

    it("renders only text options when custom text is not allowed", () => {
      const wrapper = createComponent({
        section: {
          allowCustomText: false,
          allowTextOptions: true,
          options: [{ id: "1", text: "Option 1" }],
        },
      });
      expect(wrapper.find('[data-test-id="custom-input"]').exists()).toBe(false);
      expect(wrapper.find('[data-test-id="predefined-option-1"]').exists()).toBe(true);
      expect(wrapper.find('[data-test-id="none-option"]').exists()).toBe(true);
    });
  });

  describe("Interaction handling", () => {
    it("emits update event when custom input is updated", async () => {
      const wrapper = createComponent();
      const customRadio = wrapper.find('[data-test-id="custom-input-radio"]');
      const input = wrapper.find('[data-test-id="custom-input"]');

      // First select the custom input option
      await customRadio.trigger("click");
      await wrapper.vm.$nextTick();

      // Then update the input value
      const testValue = "test input";
      await input.setValue(testValue);
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([testValue]);
    });

    it("automatically selects custom input when updating input without selecting it first", async () => {
      const wrapper = createComponent();
      const input = wrapper.find('[data-test-id="custom-input"]');

      // Update input value without selecting custom input first
      const testValue = "direct input";
      await input.setValue(testValue);
      // Trigger the input event without target value
      await input.trigger("input");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([testValue]);
    });

    it("emits undefined when input value is empty", async () => {
      const wrapper = createComponent();
      const input = wrapper.find('[data-test-id="custom-input"]');

      // First set some value
      await input.setValue("some value");
      await input.trigger("input");
      await wrapper.vm.$nextTick();

      // Then clear it
      await input.setValue("");
      await input.trigger("input");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([undefined]);
    });

    it("selects custom input when focusing on input field", async () => {
      const wrapper = createComponent();
      const input = wrapper.find('[data-test-id="custom-input"]');

      // First select a predefined option
      const predefinedOption = wrapper.find('[data-test-id="predefined-option-1"]');
      await predefinedOption.trigger("click");
      await wrapper.vm.$nextTick();

      // Then focus the input field
      await input.trigger("focus");
      await wrapper.vm.$nextTick();

      // Verify that custom input is selected
      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      // Should emit undefined since no value is entered yet
      expect(emitted?.[emitted.length - 1]).toEqual([undefined]);
    });

    it("automatically selects first option when required and single option", async () => {
      const wrapper = createComponent({
        section: {
          isRequired: true,
          allowCustomText: false,
          allowTextOptions: true,
          options: [{ id: "1", text: "Single Option" }],
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update")).toBeTruthy();
      expect(wrapper.emitted("update")?.[0]).toEqual(["Single Option"]);
    });

    it("handles selection of predefined options", async () => {
      const wrapper = createComponent({
        section: {
          allowCustomText: false,
          allowTextOptions: true,
          options: [
            { id: "1", text: "Option 1" },
            { id: "2", text: "Option 2" },
          ],
        },
      });
      const options = wrapper.findAll(".radio-button");

      // Select the first predefined option
      await options[0].trigger("click");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual(["Option 1"]);
    });
  });

  describe("Initial value handling", () => {
    it("sets initial value for predefined option", async () => {
      const wrapper = createComponent({
        initialValue: "Option 1",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update")).toBeTruthy();
      expect(wrapper.emitted("update")?.[0]).toEqual(["Option 1"]);
    });

    it("sets initial value for custom input", async () => {
      const wrapper = createComponent({
        initialValue: "Custom Value",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update")).toBeTruthy();
      expect(wrapper.emitted("update")?.[0]).toEqual(["Custom Value"]);
    });

    it("handles undefined initial value", async () => {
      const wrapper = createComponent({
        initialValue: undefined,
      });

      await wrapper.vm.$nextTick();

      // Should not emit update when initialValue is undefined
      expect(wrapper.emitted("update")).toBeFalsy();
    });
  });

  describe("Watch behavior", () => {
    it('handles selection of "None" option', async () => {
      const wrapper = createComponent();

      // First select a predefined option
      const firstOption = wrapper.find('[data-test-id="predefined-option-1"]');
      await firstOption.trigger("click");
      await wrapper.vm.$nextTick();

      // Then select None option
      const noneOption = wrapper.find('[data-test-id="none-option"]');
      await noneOption.trigger("click");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([undefined]);
    });

    it("handles selection of predefined option by index", async () => {
      const wrapper = createComponent({
        section: {
          allowTextOptions: true,
          options: [
            { id: "1", text: "First Option" },
            { id: "2", text: "Second Option" },
          ],
        },
      });

      // Select the first predefined option
      const firstOption = wrapper.find('[data-test-id="predefined-option-1"]');
      await firstOption.trigger("click");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual(["First Option"]);
    });

    it("handles undefined option text", async () => {
      const wrapper = createComponent({
        section: {
          allowTextOptions: true,
          options: [{ id: "1" }], // Option without text
        },
      });

      // Select the option without text
      const option = wrapper.find('[data-test-id="predefined-option-1"]');
      await option.trigger("click");
      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([undefined]);
    });
  });

  describe("Initial state", () => {
    it("automatically selects first option when conditions are met", async () => {
      const wrapper = createComponent({
        section: {
          isRequired: true,
          allowCustomText: false,
          allowTextOptions: true,
          options: [{ id: "1", text: "Single Option" }],
        },
      });

      await wrapper.vm.$nextTick();

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual(["Single Option"]);
    });

    it("does not auto-select when conditions are not met", () => {
      const wrapper = createComponent({
        section: {
          isRequired: true,
          allowCustomText: true, // This should prevent auto-selection
          allowTextOptions: true,
          options: [{ id: "1", text: "Single Option" }],
        },
      });

      const emitted = wrapper.emitted("update");
      expect(emitted).toBeFalsy();
    });
  });

  describe("Helper functions", () => {
    it("constructs proper locale keys", () => {
      const wrapper = createComponent();
      const customRadio = wrapper.find('[data-test-id="custom-input-radio"]');

      // The aria-label uses constructLocaleKey internally
      expect(customRadio.attributes("aria-label")).toBe("Custom");
    });
  });

  describe("v-model bindings", () => {
    it("properly binds customInput v-model", async () => {
      const wrapper = createComponent();
      const input = wrapper.find('[data-test-id="custom-input"]');

      // First select custom input mode
      const customRadio = wrapper.find('[data-test-id="custom-input-radio"]');
      await customRadio.trigger("click");
      await wrapper.vm.$nextTick();

      // Then update the input value
      const testValue = "test via v-model";
      const inputEl = input.element as HTMLInputElement;
      inputEl.value = testValue;
      await input.trigger("input");
      await wrapper.vm.$nextTick();

      // Verify that the internal customInput ref is updated (getter)
      // @ts-expect-error - vm.customInput exists but TypeScript doesn't know about it
      expect(wrapper.vm.customInput).toBe(testValue);

      // Check that the update event was emitted with the new value (setter)
      const emitted = wrapper.emitted("update");
      expect(emitted).toBeTruthy();
      expect(emitted?.[emitted.length - 1]).toEqual([testValue]);

      // Verify v-model two-way binding by checking input value
      expect(inputEl.value).toBe(testValue);
    });
  });
});
