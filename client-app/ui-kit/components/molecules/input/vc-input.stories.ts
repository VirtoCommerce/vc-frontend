import { Meta, StoryFn } from "@storybook/vue3";
import { VcInput } from "..";
// import { VcButton, VcIcon } from "../../atoms";

export default {
  title: "Components/Molecules/VcInput",
  component: VcInput,
  argTypes: {
    type: { control: "radio", options: ["text", "password", "number"] },
    size: { control: "radio", options: ["sm", "md"] },
    onClick: { action: "inputClick" },
    onKeypress: { action: "inputKeypress" },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    noBorder: false,
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

export const Error = Template.bind({});
Error.args = {
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

/* TODO: Components should not have the "style" attribute * /
export const AppendSlot: StoryFn<typeof VcInput> = (args) => ({
  components: { VcInput, VcIcon },
  setup: () => ({ args }),
  template: `
    <VcInput v-bind="args">
      <template #endDecorator>
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
      <template #endDecorator>
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
      <template #startDecorator>
        <VcIcon style="margin-left: 12px; color: grey;" size="sm" name="currency-dollar" />
      </template>

      <template #endDecorator>
        <VcButton style="height: 100%; padding: 0 8px; border-radius: inherit;">
          Button
        </VcButton>
      </template>
    </VcInput>
  `,
});
/**/
