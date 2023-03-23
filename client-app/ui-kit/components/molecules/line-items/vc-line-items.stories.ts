import { VcLineItems } from "..";
import { lineItemMock } from "../../mocks";
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

export const Basic = Template.bind({});
Basic.args = {
  items: [lineItemMock, lineItemMock, lineItemMock],
};

const TemplateQuantityAndTotal: StoryFn<typeof VcLineItems> = (args) => ({
  components: { VcLineItems },
  setup: () => ({ args }),
  template: `<VcLineItems v-bind="args">
    <template #titles>
      <div class="min-w-[5.5rem] text-center">
        {{ $t("common.labels.quantity") }}
      </div>

      <div>
        {{ $t("common.labels.total") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex flex-col items-center gap-1.5">
        <VcQuantity
          :item="item"
          @change="$emit('change:itemQuantity', { item, quantity: $event })"
        />

        <VcInStock :quantity="item.inStockQuantity" is-in-stock />
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <VcAlert v-if="item.id === 2" :key="index" type="danger" icon>
        Validation Error Message
      </VcAlert>
    </template>
  </VcLineItems>`,
});

export const QuantityAndTotal = TemplateQuantityAndTotal.bind({});
QuantityAndTotal.args = {
  items: [
    {
      ...lineItemMock,
      id: 1,
      quantity: 4,
    },
    {
      ...lineItemMock,
      id: 2,
      quantity: 1999,
    },
    {
      ...lineItemMock,
      id: 3,
    },
  ],
};
