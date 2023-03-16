import { VcLineItem } from "..";
import { VcAlert } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcLineItem",
  component: VcLineItem,
  argTypes: {
    onRemove: { action: "removeButtonClick" },
  },
  args: {
    removable: false,
    disabled: false,
    deleted: false,
  },
} as Meta<typeof VcLineItem>;

const Template: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem },
  setup: () => ({ args }),
  template: '<VcLineItem v-bind="args" />',
});

export const Basic = Template.bind({});
Basic.args = {
  imageUrl: "https://vcst-dev.paas.govirto.com/cms-content/assets/catalog/7829d/38DJ66/5ZA21_AS01.jpg",
  name: 'Samsung JS9500 Series 65"-Class 4K SUHD Smart 3D Curved LED TV',
  route: "#",
  properties: [
    {
      value: "Sony",
      label: "Brand",
    },
    {
      value: "Black",
      label: "Color",
    },
    {
      value: "Function",
      label: "Function",
    },
  ],
  listPrice: {
    amount: 2000,
    formattedAmount: "$2000.00",
  },
  actualPrice: {
    amount: 1000,
    formattedAmount: "$1000.00",
  },
};

export const Removable = Template.bind({});
Removable.args = {
  ...Basic.args,
  removable: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  removable: true,
  disabled: true,
};

export const Deleted: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem, VcAlert },
  setup: () => ({ args }),
  template: `<VcLineItem v-bind="args">
    <template #after>
      <VcAlert type="danger" icon>
        Validation error
      </VcAlert>
    </template>
  </VcLineItem>`,
});
Deleted.args = {
  ...Basic.args,
  removable: true,
  deleted: true,
};
