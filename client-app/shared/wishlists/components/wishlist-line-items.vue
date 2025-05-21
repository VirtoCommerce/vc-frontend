<template>
  <VcLineItems
    :items="items"
    with-image
    with-properties
    with-price
    removable
    @remove:items="$emit('remove:items', $event)"
  >
    <template #default />

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
        :deleted="item.deleted"
        :browser-target="$cfg.details_browser_target"
        with-image
        with-properties
        with-price
        removable
        @remove="() => removeSingleItem(item.id)"
        @link-click="$emit('linkClick', item.product)"
      >
        <div v-if="!item.deleted" ref="itemDefaultSlot" :style="{ width: itemDefaultSlotWidth }">
          <VcProductButton
            v-if="item.isConfigurable"
            no-wrap
            :to="item.route"
            :button-text="$t('pages.catalog.customize_button')"
            icon="cube-transparent"
            :target="$cfg.details_browser_target"
          />
          <VcProductButton
            v-else-if="item.hasVariations"
            :to="item.route"
            :target="$cfg.details_browser_target"
            :button-text="$t('pages.catalog.variations_button', [(item.variations?.length || 0) + 1])"
          />
          <VcAddToCart
            v-else
            class="w-full"
            :model-value="item.quantity"
            :min-quantity="item.minQuantity"
            :max-quantity="item.maxQuantity"
            :pack-size="item.packSize"
            :available-quantity="item.inStockQuantity"
            :count-in-cart="item.countInCart"
            :disabled="addToCartDisabled(item) || pendingItems[item.id]"
            :is-active="item.availabilityData?.isActive"
            :is-available="item.availabilityData?.isAvailable"
            :is-buyable="item.availabilityData?.isBuyable"
            :is-in-stock="item.availabilityData?.isInStock"
            :loading="pendingItems[item.id]"
            :message="
              !item.availabilityData?.isAvailable || !item.availabilityData?.isBuyable
                ? $t('validation_error.CART_PRODUCT_UNAVAILABLE')
                : undefined
            "
            @update:model-value="changeItemQuantity(item, $event)"
            @update:cart-item-quantity="changeCartItemQuantity(item, $event)"
            @update:validation="setValidationStatus(item, $event)"
          >
            <InStock
              :is-in-stock="item.availabilityData?.isInStock"
              :is-available="!item.deleted"
              :quantity="item.availabilityData?.availableQuantity"
              :is-digital="item.productType === ProductType.Digital"
            />

            <CountInCart :product-id="item.productId" />
          </VcAddToCart>
        </div>

        <template #after>
          <VcAlert v-if="item.deleted" color="danger" size="sm" variant="outline-dark" icon>
            {{ $t("validation_error.CART_PRODUCT_UNAVAILABLE") }}
          </VcAlert>

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
      </VcLineItem>
    </template>
  </VcLineItems>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ProductType } from "@/core/enums";
import type { Product, ValidationErrorType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";
import CountInCart from "@/shared/catalog/components/count-in-cart.vue";
import InStock from "@/shared/catalog/components/in-stock.vue";

interface IEmits {
  (event: "update:cartItem", item: PreparedLineItemType, quantity: number): void;
  (event: "update:listItem", item: PreparedLineItemType, quantity: number): void;
  (event: "remove:items", value: string[]): void;
  (event: "linkClick", item: Product | undefined): void;
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
  const maxSlotWidth = Math.max(...(itemDefaultSlot.value?.map((el) => el.clientWidth) || [0]));
  return maxSlotWidth ? `${maxSlotWidth}px` : "";
});

function addToCartDisabled(item: PreparedLineItemType) {
  if (item.actualPrice?.amount === 0 || item.listPrice?.amount === 0) {
    return true;
  }
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
