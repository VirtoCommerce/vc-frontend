import { VcLineItem, VcAlert } from "..";
import { preparedLineItemMock2 as lineItem } from "../../../mocks/line-item.mock";
import { VcAddToCart } from "../../organisms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLineItem> = {
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
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLineItem v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const basicArgs = {
  imageUrl: lineItem.imageUrl,
  name: lineItem.name,
  route: lineItem.route,
  properties: lineItem.properties,
  listPrice: lineItem.listPrice,
  actualPrice: lineItem.actualPrice,
  total: lineItem.extendedPrice,
};

export const Basic: StoryType = {
  args: basicArgs,
};

export const Selectable: StoryType = {
  args: {
    ...basicArgs,
    selectable: true,
    removable: true,
  },
};

export const Removable: StoryType = {
  args: {
    ...basicArgs,
    removable: true,
  },
};

export const Disabled: StoryType = {
  args: {
    ...basicArgs,
    selectable: true,
    removable: true,
    disabled: true,
  },
};

export const DeletedProduct: StoryType = {
  args: {
    ...basicArgs,
    removable: true,
    deleted: true,
  },
  render: (args) => ({
    components: { VcLineItem, VcAlert },
    setup: () => ({ args }),
    template: `<VcLineItem v-bind="args">
      <template #after>
        <VcAlert color="danger" size="sm" variant="outline-dark" icon>
          Validation error
        </VcAlert>
      </template>
    </VcLineItem>`,
  }),
};

export const AddToCart: StoryType = {
  args: {
    ...basicArgs,
    removable: true,
  },
  render: (args) => ({
    components: { VcLineItem, VcAddToCart },
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
  }),
};

export const QuantityInput: StoryType = {
  args: basicArgs,
  render: (args) => ({
    components: { VcLineItem, VcAddToCart },
    setup: () => ({ args }),
    template: `<VcLineItem v-bind="args">
      <VcAddToCart hide-button />
    </VcLineItem>`,
  }),
};
