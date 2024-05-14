<template>
  <VcLineItems
    :items="items"
    with-image
    with-properties
    with-price
    removable
    @remove:items="$emit('remove:items', $event)"
  >
    <template #titles>
      <div :style="{ width: itemDefaultSlotWidth }" />
    </template>
    <template #line-items>
      <VcLineItem
        v-for="item in items"
        :key="item.id"
        :image-url="item.imageUrl"
        :name="item.name"
        :route="item.route"
        :properties="item.properties"
        :list-price="item.listPrice"
        :actual-price="item.actualPrice"
        :total="item.extendedPrice"
        :disabled="pendingItems[item.id]"
        with-image
        with-properties
        with-price
        removable
        @remove="() => removeSingleItem(item.id)"
      >
        <div ref="itemDefaultSlot">
          <VcAddToCart
            v-if="!item.deleted"
            class="w-full"
            :model-value="item.quantity"
            :min-quantity="item.minQuantity"
            :max-quantity="item.maxQuantity"
            :available-quantity="item.inStockQuantity"
            :count-in-cart="item.countInCart"
            :disabled="addToCartDisabled(item) || pendingItems[item.id]"
            :is-in-stock="item.availabilityData?.isInStock"
            :loading="pendingItems[item.id]"
            @update:model-value="changeItemQuantity(item, $event)"
            @update:cart-item-quantity="changeCartItemQuantity(item, $event)"
            @update:validation="setValidationStatus(item, $event)"
          />

          <div class="mt-1.5 flex gap-1.5">
            <InStock
              :is-in-stock="item.availabilityData?.isInStock"
              :is-available="!item.deleted"
              :quantity="item.availabilityData?.availableQuantity"
              :is-digital="item.productType === ProductType.Digital"
            />

            <CountInCart :product-id="item.productId" />
          </div>
        </div>
      </VcLineItem>
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
import { computed, ref } from "vue";
import { ProductType } from "@/core/enums";
import { InStock, CountInCart } from "@/shared/catalog";
import type { ValidationErrorType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

interface IEmits {
  (event: "update:cartItem", item: PreparedLineItemType, quantity: number): void;
  (event: "update:listItem", item: PreparedLineItemType, quantity: number): void;
  (event: "remove:items", value: string[]): void;
}

interface IProps {
  items: PreparedLineItemType[];
  pendingItems?: Record<string, boolean>;
}

const emit = defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  pendingItems: () => ({}),
});

const validationErrors = ref<ValidationErrorType[]>([]);
const itemDefaultSlot = ref<HTMLElement[] | null>(null);
const itemDefaultSlotWidth = computed<string>(() => {
  return itemDefaultSlot.value?.[0] ? `${itemDefaultSlot.value[0].clientWidth}px` : "";
});

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

function removeSingleItem(itemId: string) {
  emit("remove:items", [itemId]);
}

function setValidationStatus(
  item: PreparedLineItemType,
  status: { isValid: true } | { isValid: false; errorMessage: string },
): void {
  if (!item.availabilityData?.isInStock) {
    return;
  }

  const existingValidationError = validationErrors.value.find((error) => error.objectId === item.id);

  if (!existingValidationError && !status.isValid) {
    validationErrors.value.push({
      objectId: item.id,
      errorMessage: status.errorMessage,
    });
    return;
  }

  if (existingValidationError && !status.isValid) {
    existingValidationError.errorMessage = status.errorMessage;
    return;
  }

  if (existingValidationError && status.isValid) {
    validationErrors.value = validationErrors.value.filter((error) => error.objectId !== item.id);
  }
}
</script>
