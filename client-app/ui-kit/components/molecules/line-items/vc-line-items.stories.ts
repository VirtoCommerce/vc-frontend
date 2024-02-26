import { VcLineItems } from "..";
import {
  preparedLineItemMock1,
  preparedLineItemMock2,
  preparedLineItemMock3,
  preparedLineItemMock4,
  preparedLineItemMock5,
} from "../../../mocks/line-item.mock";
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

const Template: StoryFn<typeof VcLineItems> = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: '<VcLineItems v-bind="args" />',
});

const TemplateQuantity: StoryFn<typeof VcLineItems> = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: `<VcLineItems v-bind="args">
    <template #titles>
      <div class="text-end">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <VcQuantity
        :item="item"
        @change="$emit('change:itemQuantity', { item, quantity: $event })"
      />
    </template>
  </VcLineItems>`,
});

const TemplateAddToCart: StoryFn<typeof VcLineItems> = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: `<VcLineItems v-bind="args">
    <template #default="{ item }">
        <VcAddToCart
          :model-value="item.quantity"
        />

        <div class="flex gap-1 mt-1.5">
          <VcChip size="xs" variant="outline-dark" color="neutral" rounded>10 in Cart</VcChip>
        </div>
    </template>
  </VcLineItems>`,
});

export const Basic = Template.bind({});
Basic.args = {
  items: [preparedLineItemMock1, preparedLineItemMock1, preparedLineItemMock1],
};

export const Selectable = Template.bind({});
Selectable.args = {
  items: [preparedLineItemMock1, preparedLineItemMock1, preparedLineItemMock1],
  selectable: true,
};

export const Removable = Template.bind({});
Removable.args = {
  items: [preparedLineItemMock2, preparedLineItemMock2, preparedLineItemMock2],
  removable: true,
};

export const WithoutImage = Template.bind({});
WithoutImage.args = {
  items: [preparedLineItemMock3, preparedLineItemMock3, preparedLineItemMock3],
  removable: true,
};

export const WithoutImageAndProperties = Template.bind({});
WithoutImageAndProperties.args = {
  items: [preparedLineItemMock4, preparedLineItemMock4, preparedLineItemMock4],
  removable: true,
};

export const QuantityInput = TemplateQuantity.bind({});
QuantityInput.args = {
  items: [
    {
      ...preparedLineItemMock1,
      id: "1",
      quantity: 4,
    },
    {
      ...preparedLineItemMock1,
      id: "2",
      quantity: 1999,
    },
    {
      ...preparedLineItemMock1,
      id: "3",
    },
  ],
  removable: true,
  itemTotal: true,
};

export const AddToCart = TemplateAddToCart.bind({});
AddToCart.args = {
  items: [
    {
      ...preparedLineItemMock1,
      id: "1",
      quantity: 4,
    },
    {
      ...preparedLineItemMock1,
      id: "2",
      quantity: 1999,
    },
    {
      ...preparedLineItemMock1,
      id: "3",
    },
  ],
  removable: true,
};

export const Minimal = Template.bind({});
Minimal.args = {
  items: [preparedLineItemMock5, preparedLineItemMock5, preparedLineItemMock5],
};

export const MinimalSelectable = Template.bind({});
MinimalSelectable.args = {
  items: [preparedLineItemMock5, preparedLineItemMock5, preparedLineItemMock5],
  selectable: true,
};

export const MinimalQuantity = TemplateQuantity.bind({});
MinimalQuantity.args = {
  items: [preparedLineItemMock5, preparedLineItemMock5, preparedLineItemMock5],
  removable: true,
};
