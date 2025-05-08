import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import SectionTextFieldset from "../section-text-fieldset.vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";

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

// Mock vue-i18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: mockTranslate,
  }),
}));

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
          VcRadioButton: {
            name: "VcRadioButton",
            template: `
                            <div 
                                :data-test-id="$attrs['data-test-id']"
                                class="radio-button"
                                :class="{ 'selected': modelValue === value }"
                                @click="handleClick"
                            >
                                <slot />
                            </div>
                        `,
            props: ["modelValue", "value"],
            emits: ["update:modelValue"],
            methods: {
              handleClick() {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                this.$emit("update:modelValue", this.value);
              },
            },
          },
          VcInput: {
            template: `
                            <input 
                                :data-test-id="$attrs['data-test-id']"
                                class="input" 
                                :value="modelValue" 
                                @input="handleInput"
                                @focus="$emit('focus')"
                            />
                        `,
            props: ["modelValue"],
            emits: ["update:modelValue", "input", "focus"],
            inheritAttrs: false,
            methods: {
              handleInput(e: Event) {
                const target = e.target as HTMLInputElement;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                this.$emit("input", { target: { value: target.value } });
              },
            },
          },
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
      expect(wrapper.findAll(".section-text-fieldset__option")).toHaveLength(4); // Custom + 2 options + None
    });

    it('does not render "None" option when isRequired is true', () => {
      const wrapper = createComponent({
        section: { isRequired: true },
      });
      expect(wrapper.findAll(".section-text-fieldset__option")).toHaveLength(3); // Custom + 2 options
    });

    it("hides custom input radio when specified conditions are met", () => {
      const wrapper = createComponent({
        section: {
          isRequired: true,
          allowCustomText: true,
          allowTextOptions: false,
        },
      });
      const customRadio = wrapper.find(".section-text-fieldset__option .radio-button");
      expect(customRadio.exists()).toBe(false);
    });

    it("renders only text options when custom text is not allowed", () => {
      const wrapper = createComponent({
        section: {
          allowCustomText: false,
          allowTextOptions: true,
          options: [{ id: "1", text: "Option 1" }],
        },
      });
      expect(wrapper.find(".section-text-fieldset__input").exists()).toBe(false);
      expect(wrapper.findAll(".radio-button")).toHaveLength(2); // One option + None
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

    it("selects custom input when focusing on input field", async () => {
      const wrapper = createComponent();
      const input = wrapper.find('[data-test-id="custom-input"]');

      await input.trigger("focus");

      expect(wrapper.emitted("update")).toBeTruthy();
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
});
