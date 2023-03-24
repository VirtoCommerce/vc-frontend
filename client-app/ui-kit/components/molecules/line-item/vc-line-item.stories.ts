import { VcLineItem } from "..";
import { preparedLineItemMock as lineItem } from "../../../mocks";
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
  imageUrl: lineItem.imageUrl,
  name: lineItem.name,
  route: lineItem.route,
  properties: lineItem.properties,
  listPrice: lineItem.listPrice,
  actualPrice: lineItem.actualPrice,
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
