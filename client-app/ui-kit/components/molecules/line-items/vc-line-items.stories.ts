import { VcLineItems } from "..";
import { preparedLineItemMock1, preparedLineItemMock2 } from "../../../mocks/line-item.mock";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcLineItems",
  component: VcLineItems,
  args: {
    readonly: false,
    disabled: false,
    removable: false,
  },
} as Meta<typeof VcLineItems>;

const Template: StoryFn = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: '<VcLineItems v-bind="args" />',
});

const TemplateQuantity: StoryFn = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: `<VcLineItems v-bind="args">
    <template #titles>
      <div class="text-end">Quantity</div>
    </template>

    <template #default="{ item }">
      <VcAddToCart
        @update:modelValue="$emit('change:itemQuantity', { item, quantity: $event })"
      />
    </template>
  </VcLineItems>`,
});

const TemplateAddToCart: StoryFn = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: `<VcLineItems v-bind="args">
    <template #default="{ item }">
        <VcAddToCart
          :model-value="item.quantity"
          is-active
          is-available
          is-buyable
          is-in-stock
          :available-quantity="999999"
        />

        <div class="flex gap-1 mt-1.5">
          <VcChip size="xs" variant="outline-dark" color="neutral" rounded>10 in Cart</VcChip>
        </div>
    </template>
  </VcLineItems>`,
});

export const Basic = Template.bind({});
Basic.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
};

export const NoRoute = Template.bind({});
NoRoute.args = {
  items: [preparedLineItemMock1, preparedLineItemMock1, preparedLineItemMock1],
};

export const Selectable = Template.bind({});
Selectable.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  selectable: true,
};

export const Removable = Template.bind({});
Removable.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  removable: true,
};

export const WithImage = Template.bind({});
WithImage.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  withImage: true,
  removable: true,
};

export const WithImageAndProperties = Template.bind({});
WithImageAndProperties.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  withImage: true,
  withProperties: true,
  removable: true,
};

export const QuantityInput = TemplateQuantity.bind({});
QuantityInput.args = {
  items: [
    {
      ...preparedLineItemMock2,
      id: "1",
      quantity: 4,
    },
    {
      ...preparedLineItemMock2,
      id: "2",
      quantity: 1999,
    },
    {
      ...preparedLineItemMock2,
      id: "3",
    },
  ],
  removable: true,
  withImage: true,
  withProperties: true,
  withPrice: true,
  withTotal: true,
};

export const AddToCart = TemplateAddToCart.bind({});
AddToCart.args = {
  items: [
    {
      ...preparedLineItemMock2,
      id: "1",
      quantity: 4,
    },
    {
      ...preparedLineItemMock2,
      id: "2",
      quantity: 1999,
    },
    {
      ...preparedLineItemMock2,
      id: "3",
    },
  ],
  removable: true,
};
