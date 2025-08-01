<template>
  <VcLineItems
    class="quote-line-items"
    :items="normalizedItems"
    :removable="!readonly"
    :readonly="readonly"
    :browser-target="$cfg.details_browser_target"
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
        :actual-price="item.selectedTierPrice?.price"
        :list-price="item.listPrice"
        :total="item.extendedPrice"
        with-image
        with-properties
        with-price
        with-total
        :removable="!readonly"
        @remove="() => $emit('remove:item', item.id)"
      >
        <QuantityControl
          :mode="$cfg.product_quantity_control"
          hide-button
          :disabled="readonly"
          class="quote-line-items__quantity"
          :model-value="item.selectedTierPrice?.quantity"
          :name="item.id"
          @update:model-value="$emit('update:item', { itemId: item.id, quantity: $event })"
        />
        <template #after>
          <ConfigurationItems v-if="item.configurationItems?.length" :configuration-items="item.configurationItems" />
        </template>
      </VcLineItem>
    </template>
    <template #after-items>
      <div v-if="!items?.length" class="quote-line-items__no-items">
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
import { PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME } from "@/shared/catalog/constants/product";
import { ConfigurationItems } from "@/shared/common";
import type { MoneyType, QuoteItemType } from "../api/graphql/types";
import QuantityControl from "@/shared/common/components/quantity-control.vue";

defineEmits<IEmits>();
const props = defineProps<IProps>();

const PROPERTIES_COUNT_TO_SHOW = 3;

interface IEmits {
  (event: "update:item", value: { itemId: string; quantity: number }): void;
  (event: "remove:item", value: string): void;
}
interface IProps {
  readonly?: boolean;
  items?: QuoteItemType[];
}

const { n } = useI18n();

const normalizedItems = computed(() => {
  return props.items?.map((item) => ({
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
  return Object.values(getPropertiesGroupedByName(item.product?.properties ?? []))
    .filter((property) => property.name !== PRODUCT_VARIATIONS_LAYOUT_PROPERTY_NAME)
    .slice(0, PROPERTIES_COUNT_TO_SHOW);
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
