<template>
  <VcLineItems
    :items="preparedLineItems"
    :removable="!readonly"
    :readonly="readonly"
    with-image
    with-properties
    with-price
    with-total
    with-subtotal
    @remove:items="$emit('remove:item', $event[0])"
  >
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <VcQuantity
        :disabled="readonly"
        class="ml-5"
        :model-value="item.quantity"
        :name="item.id"
        :min-quantity="item.minQuantity"
        :max-quantity="item.maxQuantity"
        @update:model-value="$emit('update:item', { itemId: item.id, quantity: $event })"
      />
    </template>
    <template #after-items>
      <div v-if="!items.length" class="border-x p-3">
        <VcAlert color="warning" size="sm" variant="outline-dark" icon>
          {{ $t("pages.account.quote_details.no_items_message") }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { prepareLineItems } from "@/core/utilities";
import type { MoneyType, QuoteItemType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "update:item", value: { itemId: string; quantity: number }): void;
  (event: "remove:item", value: string): void;
}

interface IProps {
  readonly?: boolean;
  items: QuoteItemType[];
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const { n } = useI18n();

const preparedLineItems = computed(() =>
  prepareLineItems(props.items).map((item) => {
    const originalItem = props.items.find(({ id }) => id === item.id);
    const selectedTierPrice = originalItem?.selectedTierPrice;
    const selectedTierPriceAmount =
      (selectedTierPrice && selectedTierPrice.price?.amount * selectedTierPrice.quantity) || 0;
    return {
      ...item,
      actualPrice: undefined,
      listPrice: {
        ...(item.listPrice as MoneyType),
        amount: selectedTierPrice?.price?.amount as number,
        formattedAmount: n(selectedTierPrice?.price?.amount as number, "currency"),
      },
      extendedPrice:
        selectedTierPrice &&
        ({
          ...selectedTierPrice.price,
          amount: selectedTierPriceAmount,
          formattedAmount: n(selectedTierPriceAmount, "currency"),
        } as MoneyType),
    };
  }),
);
</script>
