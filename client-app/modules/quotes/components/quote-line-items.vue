<template>
  <VcLineItems
    class="quote-line-items"
    :items="normalizedItems"
    :removable="!readonly"
    :readonly="readonly"
    with-image
    with-properties
    with-price
    with-total
    with-subtotal
  >
    <template #titles>
      <div class="text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #line-items>
      <VcLineItem
        v-for="item in normalizedItems"
        :key="item.id"
        :image-url="item.imageUrl"
        :name="item.name"
        :route="getRoute(item)"
        :properties="getProperties(item)"
        :list-price="item.listPrice"
        :total="item.extendedPrice"
        with-image
        with-properties
        with-price
        with-total
        :removable="!readonly"
        @remove="() => $emit('remove:item', item.id)"
      >
        <VcAddToCart
          hide-button
          :disabled="readonly"
          class="quote-line-items__quantity"
          :model-value="item.selectedTierPrice?.quantity"
          :name="item.id"
          :min-quantity="item.product?.minQuantity"
          :max-quantity="item.product?.maxQuantity ?? item.product?.availabilityData?.availableQuantity"
          @update:model-value="$emit('update:item', { itemId: item.id, quantity: $event })"
        />
      </VcLineItem>
    </template>
    <template #after-items>
      <div v-if="!items.length" class="quote-line-items__no-items">
        <VcAlert color="warning" size="sm" variant="outline-dark" icon>
          {{ $t("quote_details.no_items_message") }}
        </VcAlert>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import type { MoneyType, QuoteItemType } from "../api/graphql/types";

defineEmits<IEmits>();
const props = defineProps<IProps>();

const PROPERTIES_COUNT_TO_SHOW = 3;

interface IEmits {
  (event: "update:item", value: { itemId: string; quantity: number }): void;
  (event: "remove:item", value: string): void;
}
interface IProps {
  readonly?: boolean;
  items: QuoteItemType[];
}

const { n } = useI18n();

const normalizedItems = computed(() => {
  return props.items.map((item) => ({
    ...item,
    extendedPrice: getTotalPrice(item),
  }));
});

function getRoute(item: QuoteItemType) {
  return getProductRoute(item.productId || item.product?.id || "", item.product?.slug);
}

function getTotalPrice(item: QuoteItemType) {
  const price = item?.selectedTierPrice?.price;
  const quantity = item?.selectedTierPrice?.quantity || 0;
  const priceTotal = (price && price.amount * quantity) || 0;
  return (
    price &&
    ({
      ...price,
      amount: priceTotal,
      formattedAmount: n(priceTotal, "currency"),
    } as MoneyType)
  );
}

function getProperties(item: QuoteItemType) {
  return Object.values(getPropertiesGroupedByName(item.product?.properties ?? [])).slice(0, PROPERTIES_COUNT_TO_SHOW);
}
</script>

<style lang="scss">
.quote-line-items {
  &__quantity {
    @apply ml-5;
  }

  &__no-items {
    @apply border-x p-3;
  }
}
</style>
