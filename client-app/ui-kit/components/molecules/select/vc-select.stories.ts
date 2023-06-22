import { VcSelect } from "..";
import { VcSelectItem, VcSelectItemImage, VcSelectItemText } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcSelect",
  component: VcSelect,
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md"],
      type: { name: "string", required: false },
      table: {
        type: {
          summary: '"sm" | "md"',
        },
      },
    },
    modelValue: { table: { type: { summary: "object|string" } } },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    error: false,
    showEmptyDetails: false,
    type: "text",
    size: "md",
  },
} as Meta<typeof VcSelect>;

const Template: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect },
  setup: () => ({ args }),
  template: '<VcSelect v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  items: ["Albania", "Belgium", "China", "India"],
};

export const Common = Template.bind({});
Common.args = {
  ...Basic.args,
  label: "Label",
  placeholder: "Placeholder",
  message: "Hint message",
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  modelValue: "Belgium",
  required: true,
};

export const ErrorState = Template.bind({});
ErrorState.args = {
  ...Required.args,
  modelValue: "Belgium",
  error: true,
  message: "Error message",
};

export const Autocomplete = Template.bind({});
Autocomplete.args = {
  ...Required.args,
  modelValue: "",
  placeholder: "Search item",
  autocomplete: true,
};

export const Custom: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect, VcSelectItem, VcSelectItemImage, VcSelectItemText },
  setup: () => ({ args }),
  template: `<VcSelect v-bind="args">
    <template #placeholder>
      <VcSelectItem>
        <VcSelectItemImage src="/static/icons/placeholders/select-payment.svg" class="bg-gray-100/80" />
        <VcSelectItemText>
          {{ $t("common.placeholders.select_payment_method") }}
        </VcSelectItemText>
      </VcSelectItem>
    </template>

    <template #selected="{ item }">
      <VcSelectItem>
        <VcSelectItemImage :src="item.logoUrl" />
        <VcSelectItemText>{{ item.optionName }}</VcSelectItemText>
      </VcSelectItem>
    </template>

    <template #item="{ item }">
      <VcSelectItem bordered>
        <VcSelectItemImage :src="item.logoUrl" />
        <VcSelectItemText>{{ item.optionName }}</VcSelectItemText>
      </VcSelectItem>
    </template>
  </VcSelect>`,
});

Custom.args = {
  required: true,
  label: "Payment method",
  size: "auto",
  items: [
    {
      id: "FixedRate_Ground",
      code: "FixedRate",
      logoUrl:
        "https://github.com/VirtoCommerce/vc-module-core/raw/master/src/VirtoCommerce.CoreModule.Web/Content/logoVC.png",
      optionName: "Ground",
    },
    {
      id: "FixedRate_Air",
      code: "FixedRate",
      logoUrl:
        "https://github.com/VirtoCommerce/vc-module-core/raw/master/src/VirtoCommerce.CoreModule.Web/Content/logoVC.png",
      optionName: "Air",
    },
  ],
};
