<template>
  <VcLineItems :items="items" removable disable-subtotal @remove:item="$emit('remove:listItem', $event)">
    <template #titles>
      <div class="ps-2">
        {{ $t("common.labels.quantity") }}
      </div>
    </template>

    <template #default="{ item }">
      <div class="flex max-w-[16rem] flex-wrap gap-1.5 md:max-w-none">
        <VcAddToCart
          v-if="!item.deleted"
          class="w-full"
          :model-value="item.quantity"
          :min-quantity="item.minQuantity"
          :max-quantity="item.maxQuantity"
          :count-in-cart="item.countInCart"
          :disabled="addToCartDisabled(item)"
          @update:model-value="changeItemQuantity(item.sku, $event)"
          @update:cart-item-quantity="changeCartItemQuantity(item.sku, $event)"
        />

        <VcInStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :availability-data="item.availabilityData"
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
import type { InputNewBulkItemType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "update:cartItem", value: InputNewBulkItemType): void;
  (event: "update:listItem", value: InputNewBulkItemType): void;
  (event: "remove:listItem", value: PreparedLineItemType): void;
}

interface IProp {
  items: PreparedLineItemType[];
}

const emit = defineEmits<IEmits>();
defineProps<IProp>();

function addToCartDisabled(item: PreparedLineItemType) {
  return (
    !item.actualPrice ||
    !item.availabilityData?.isAvailable ||
    !item.availabilityData?.isInStock ||
    !item.availabilityData?.isBuyable ||
    (!item.availabilityData?.availableQuantity && item.productType !== ProductType.Digital)
  );
}

function changeCartItemQuantity(sku: string, quantity: number): void {
  emit("update:cartItem", { productSku: sku, quantity });
}

function changeItemQuantity(sku: string, quantity: number): void {
  emit("update:listItem", { productSku: sku, quantity });
}
</script>
