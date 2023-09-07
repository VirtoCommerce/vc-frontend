<template>
  <VcSectionWidget id="products" :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
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
            :selected-items="selectedItems"
            :disabled="disabled"
            :validation-errors="validationErrors"
            @change:item-quantity="$emit('change:itemQuantity', $event)"
            @select:item="$emit('select:item', $event)"
            @select:all-items="$emit('select:allItems', { items: group.items, selectAll: $event })"
            @remove:item="$emit('remove:item', $event)"
            @remove:selected-items="$emit('remove:selectedItems', $event)"
          />
        </div>
      </template>
    </div>

    <!-- Items not grouped by Vendor -->
    <template v-else>
      <CartLineItems
        :items="items"
        :selected-items="selectedItems"
        :disabled="disabled"
        :validation-errors="validationErrors"
        @change:item-quantity="$emit('change:itemQuantity', $event)"
        @select:item="$emit('select:item', $event)"
        @select:all-items="$emit('select:allItems', { items, selectAll: $event })"
        @remove:item="$emit('remove:item', $event)"
        @remove:selected-items="$emit('remove:selectedItems', $event)"
      />
    </template>

    <div class="mt-2 flex justify-end md:mt-5">
      <VcButton
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
  </VcSectionWidget>
</template>

<script setup lang="ts">
import CartLineItems from "./cart-line-items.vue";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { LineItemsGroupByVendorType } from "@/core/types";

interface IEmits {
  (event: "change:itemQuantity", value: { item: LineItemType; quantity: number }): void;
  (event: "select:item", value: { id: string; selected: boolean }): void;
  (event: "select:allItems", value: { items: LineItemType[]; selectAll: boolean }): void;
  (event: "remove:item", value: LineItemType): void;
  (event: "remove:selectedItems", value: string[]): void;
  (event: "clear:cart"): void;
}

interface IProps {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
  selectedItems?: string[];
  itemsGroupedByVendor?: LineItemsGroupByVendorType<LineItemType>[];
  /** @deprecated */
  validationErrors?: ValidationErrorType[];
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  items: () => [],
  itemsGroupedByVendor: () => [],
  validationErrors: () => [],
});
</script>

<style scoped lang="scss">
@media print {
  #products {
    :deep(.vc-section-widget__title) {
      @apply hidden;
    }
  }
}
</style>
