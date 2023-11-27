import { VcLineItems } from "..";
import { prepatedLineItemMock1 } from "../../../mocks/line-item.mock";
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
  items: [prepatedLineItemMock1, prepatedLineItemMock1, prepatedLineItemMock1],
};

export const Removable = Template.bind({});
Removable.args = {
  ...Basic.args,
  removable: true,
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

        <VcChip variant="outline-dark" color="neutral">10 in Cart</VcChip>
      </div>

      <VcLineItemTotal :list-total="item.extendedPrice" />
    </template>

    <template #after-content="{ item }">
      <VcAlert v-if="item.id === 2" :key="index" color="danger" size="sm" variant="outline-dark" icon>
        Validation Error Message
      </VcAlert>
    </template>
  </VcLineItems>`,
});

export const QuantityAndTotal = TemplateQuantityAndTotal.bind({});
QuantityAndTotal.args = {
  items: [
    {
      ...prepatedLineItemMock1,
      id: "1",
      quantity: 4,
    },
    {
      ...prepatedLineItemMock1,
      id: "2",
      quantity: 1999,
    },
    {
      ...prepatedLineItemMock1,
      id: "3",
    },
  ],
  removable: true,
};
