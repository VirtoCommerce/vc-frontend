import { VcInput } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";
// import { VcButton, VcIcon } from "../../atoms";

export default {
  title: "Components/Molecules/VcInput",
  component: VcInput,
  argTypes: {
    /**
     * Docs:
     *  https://storybook.js.org/docs/vue/essentials/controls#annotation
     *  https://storybook.js.org/docs/vue/api/argtypes#manual-specification
     */
    type: {
      control: "radio",
      options: ["text", "password", "number"],
      table: { type: { summary: '"text" | "password" | "number"' } },
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
      type: { name: "string", required: false },
      // description: "Description text",
      table: {
        type: {
          summary: '"sm" | "md"',
          // detail: "Tooltop text",
        },
        // defaultValue: {
        //   summary: "md",
        //   detail: "Tooltop text",
        // },
      },
    },
    min: { table: { type: { summary: "string|number" } } },
    max: { table: { type: { summary: "string|number" } } },
    step: { table: { type: { summary: "string|number" } } },
    minlength: { table: { type: { summary: "string|number" } } },
    maxlength: { table: { type: { summary: "string|number" } } },
    modelValue: { table: { type: { summary: "string|number" } } },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    noBorder: false,
    center: false,
    hidePasswordSwitcher: false,
    error: false,
    showEmptyDetails: false,
    type: "text",
    size: "md",
  },
} as Meta<typeof VcInput>;

const Template: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput },
  setup: () => ({ args }),
  template: '<VcInput v-bind="args" />',
});

export const Basic = Template.bind({});

export const Common = Template.bind({});
Common.args = {
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  required: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Required.args,
  error: true,
  message: "Error message",
};

export const TypePassword = Template.bind({});
TypePassword.args = {
  ...Common.args,
  autocomplete: "password",
  type: "password",
};

export const Center = Template.bind({});
Center.args = {
  ...Common.args,
  center: true,
};

/* TODO: Components should not have the "style" attribute * /
export const AppendSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcIcon },
  setup: () => ({ args }),
  template: `
    <VcInput v-bind="args">
      <template #append>
        <VcIcon style="margin: 0 8px; color: darkgray;" name="calendar" />
      </template>
    </VcInput>
  `,
});
AppendSlot.args = {
  ...Common.args,
};

export const AppendSlotWithButton: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton, VcIcon },
  setup: () => ({ args }),
  template: `
    <VcInput v-bind="args">
      <template #append>
        <VcButton size="sm" style="margin: 0 6px; padding: 4px;">
          <VcIcon size="sm" name="calendar" />
        </VcButton>
      </template>
    </VcInput>
  `,
});

export const PrependAndAppendSlots: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcButton, VcIcon },
  setup: () => ({ args }),
  template: `
    <VcInput v-bind="args">
      <template #prepend>
        <VcIcon style="margin-left: 12px; color: grey;" size="sm" name="currency-dollar" />
      </template>

      <template #append>
        <VcButton style="height: 100%; padding: 0 8px; border-radius: inherit;">
          Button
        </VcButton>
      </template>
    </VcInput>
  `,
});
/**/
