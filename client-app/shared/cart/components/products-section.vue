<template>
  <VcWidget
    id="products"
    :title="withTitle ? $t('shared.checkout.products_section.title') : undefined"
    prepend-icon="cube"
    size="lg"
  >
    <!-- Items grouped by Vendor -->
    <div v-if="grouped" class="space-y-5 md:space-y-7">
      <template v-for="(group, vendorId) in itemsGroupedByVendor" :key="vendorId">
        <div v-if="group.items.length" class="space-y-3">
          <!-- Vendor -->
          <div class="flex max-w-full flex-wrap gap-x-3">
            <VcVendor :vendor="group.vendor" />
            <VcRating v-if="$cfg.rating_enabled && group.vendor?.rating" :rating="group.vendor.rating" />
          </div>

          <CartLineItems
            :items="group.items"
            :shared-selected-item-ids="selectedItemIds"
            :disabled="disabled"
            :validation-errors="validationErrors"
            @change:item-quantity="$emit('change:itemQuantity', $event)"
            @select:items="$emit('select:items', $event)"
            @remove:items="$emit('remove:items', $event)"
          />
        </div>
      </template>
    </div>

    <!-- Items not grouped by Vendor -->
    <template v-else>
      <CartLineItems
        :items="items"
        :shared-selected-item-ids="selectedItemIds"
        :disabled="disabled"
        :validation-errors="validationErrors"
        @change:item-quantity="$emit('change:itemQuantity', $event)"
        @select:items="$emit('select:items', $event)"
        @remove:items="$emit('remove:items', $event)"
      />
    </template>

    <div class="mt-2 flex justify-end md:mt-5">
      <VcButton
        v-if="withClearCart"
        :disabled="disabled"
        color="secondary"
        size="sm"
        class="self-start"
        variant="outline"
        @click="$emit('clear:cart')"
      >
        {{ $t("common.buttons.clear_cart") }}
      </VcButton>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { VendorGroupType } from "@/core/types";
import CartLineItems from "@/shared/cart/components/cart-line-items.vue";

interface IEmits {
  (event: "change:itemQuantity", value: { itemId: string; quantity: number }): void;
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
  (event: "clear:cart"): void;
}

interface IProps {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
  selectedItemIds?: string[];
  itemsGroupedByVendor?: VendorGroupType<LineItemType>[];
  validationErrors?: ValidationErrorType[];
  withTitle?: boolean;
  withClearCart?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  items: () => [],
  itemsGroupedByVendor: () => [],
  validationErrors: () => [],
});
</script>
