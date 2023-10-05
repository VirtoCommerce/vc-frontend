<template>
  <VcLineItems :items="items" removable disable-subtotal @remove:items="$emit('remove:items', $event)">
    <template #header-product>
      <div class="text-center">
        {{ $t("common.labels.product") }}
      </div>
    </template>
    <template #header-properties>
      <div class="text-center">
        {{ $t("common.labels.properties") }}
      </div>
    </template>
    <template #header-price>
      <div class="text-center">
        {{ $t("common.labels.price_per_item") }}
      </div>
    </template>
    <template #titles>
      <div class="w-full ps-2 text-center">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex w-full max-w-[16rem] flex-wrap gap-1.5 md:max-w-none">
        <VcAddToCart
          v-if="!item.deleted"
          class="w-full"
          :model-value="item.quantity"
          :min-quantity="item.minQuantity"
          :max-quantity="item.maxQuantity"
          :count-in-cart="item.countInCart"
          :disabled="addToCartDisabled(item)"
          @update:model-value="changeItemQuantity(item, $event)"
          @update:cart-item-quantity="changeCartItemQuantity(item, $event)"
        />

        <VcInStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :quantity="item.availabilityData?.availableQuantity"
          :is-digital="item.productType === ProductType.Digital"
        />

        <VcCountInCart :product-id="item.productId" />
      </div>
    </template>

    <!-- Line item Alerts
    <template #after-content>
      <VcAlert color="danger" size="sm" variant="outline-dark" icon>Line item error</VcAlert>
    </template>
    -->
  </VcLineItems>
</template>

<script setup lang="ts">
import { ProductType } from "@/core/enums";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "update:cartItem", item: PreparedLineItemType, quantity: number): void;
  (event: "update:listItem", item: PreparedLineItemType, quantity: number): void;
  (event: "remove:items", value: string[]): void;
}

interface IProp {
  items: PreparedLineItemType[];
}

const emit = defineEmits<IEmits>();
defineProps<IProp>();

function addToCartDisabled(item: PreparedLineItemType) {
  return (
    item.productType === ProductType.Physical &&
    (!item.availabilityData?.isAvailable || !item.availabilityData?.isInStock)
  );
}

function changeCartItemQuantity(item: PreparedLineItemType, quantity: number): void {
  emit("update:cartItem", item, quantity);
}

function changeItemQuantity(item: PreparedLineItemType, quantity: number): void {
  emit("update:listItem", item, quantity);
}
</script>
