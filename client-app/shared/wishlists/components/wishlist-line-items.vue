<template>
  <VcLineItems :items="items" removable disable-subtotal @remove:items="$emit('remove:items', $event)">
    <template #default="{ item }">
      <div class="flex w-full max-w-[16rem] flex-wrap gap-1.5 md:max-w-none">
        <VcAddToCart
          v-if="!item.deleted"
          class="w-full"
          :model-value="item.quantity"
          :min-quantity="item.minQuantity"
          :max-quantity="item.maxQuantity"
          :available-quantity="item.inStockQuantity"
          :count-in-cart="item.countInCart"
          :disabled="addToCartDisabled(item)"
          @update:model-value="changeItemQuantity(item, $event)"
          @update:cart-item-quantity="changeCartItemQuantity(item, $event)"
          @update:validation="setValidationStatus(item, $event)"
        />

        <InStock
          :is-in-stock="item.availabilityData?.isInStock"
          :is-available="!item.deleted"
          :quantity="item.availabilityData?.availableQuantity"
          :is-digital="item.productType === ProductType.Digital"
        />

        <CountInCart :product-id="item.productId" />
      </div>
    </template>

    <template #after-content="{ item }">
      <div v-if="validationErrors.length" class="flex flex-col gap-1">
        <template v-for="(validationError, index) in validationErrors" :key="index">
          <VcAlert
            v-if="validationError.objectId === item.id && !!validationError.errorMessage"
            color="danger"
            size="sm"
            variant="outline-dark"
            icon
          >
            {{ validationError.errorMessage }}
          </VcAlert>
        </template>
      </div>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { ProductType } from "@/core/enums";
import { InStock, CountInCart } from "@/shared/catalog";
import { useLineItemsValidation } from "@/ui-kit/composables";
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

const { validationErrors, setValidationStatus } = useLineItemsValidation();

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
