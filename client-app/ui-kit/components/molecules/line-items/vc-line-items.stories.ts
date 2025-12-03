import { VcLineItems } from "..";
import { preparedLineItemMock1, preparedLineItemMock2 } from "../../../mocks/line-item.mock";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLineItems> = {
  title: "Components/Molecules/VcLineItems",
  component: VcLineItems,
  args: {
    readonly: false,
    disabled: false,
    removable: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItems v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  },
};

export const NoRoute: StoryType = {
  args: {
    items: [preparedLineItemMock1, preparedLineItemMock1, preparedLineItemMock1],
  },
};

export const Selectable: StoryType = {
  args: {
    items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
    selectable: true,
  },
};

export const Removable: StoryType = {
  args: {
    items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
    removable: true,
  },
};

export const WithImage: StoryType = {
  args: {
    items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
    withImage: true,
    removable: true,
  },
};

export const WithImageAndProperties: StoryType = {
  args: {
    items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
    withImage: true,
    withProperties: true,
    removable: true,
  },
};

export const QuantityInput: StoryType = {
  args: {
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
  },
  render: (args) => ({
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
  }),
};

export const AddToCart: StoryType = {
  args: {
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
  },
  render: (args) => ({
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
  }),
};
