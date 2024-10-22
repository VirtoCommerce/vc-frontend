import { VcLineItem } from "..";
import { VcAlert } from "../..";
import { preparedLineItemMock2 as lineItem } from "../../../mocks/line-item.mock";
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
  total: lineItem.extendedPrice,
};

export const Selectable = Template.bind({});
Selectable.args = {
  ...Basic.args,
  selectable: true,
  removable: true,
};

export const Removable = Template.bind({});
Removable.args = {
  ...Basic.args,
  removable: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Basic.args,
  selectable: true,
  removable: true,
  disabled: true,
};

export const DeletedProduct: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem, VcAlert },
  setup: () => ({ args }),
  template: `<VcLineItem v-bind="args">
    <template #after>
      <VcAlert color="danger" size="sm" variant="outline-dark" icon>
        Validation error
      </VcAlert>
    </template>
  </VcLineItem>`,
});
DeletedProduct.args = {
  ...Basic.args,
  removable: true,
  deleted: true,
};

export const AddToCart: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem },
  setup: () => ({ args }),
  template: `<VcLineItem v-bind="args">
    <VcAddToCart
      is-active
      is-available
      is-buyable
      is-in-stock
      :available-quantity="999999"
    />
  </VcLineItem>`,
});
AddToCart.args = {
  ...Basic.args,
  removable: true,
};

export const QuantityInput: StoryFn<typeof VcLineItem> = (args) => ({
  components: { VcLineItem },
  setup: () => ({ args }),
  template: `<VcLineItem v-bind="args">
    <VcAddToCart hide-button />
  </VcLineItem>`,
});
QuantityInput.args = {
  ...Basic.args,
};
