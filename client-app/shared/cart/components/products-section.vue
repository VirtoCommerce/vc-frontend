<template>
  <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
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
            :disabled="disabled"
            :validation-errors="validationErrors"
            @change:item:quantity="$emit('change:item:quantity', $event)"
            @remove:item="$emit('remove:item', $event)"
          />
        </div>
      </template>
    </div>

    <!-- Items not grouped by Vendor -->
    <template v-else>
      <CartLineItems
        :items="items"
        :disabled="disabled"
        :validation-errors="validationErrors"
        @change:item:quantity="$emit('change:item:quantity', $event)"
        @remove:item="$emit('remove:item', $event)"
      />
    </template>

    <div class="mt-5 hidden justify-end md:flex">
      <VcButton
        :is-disabled="disabled"
        kind="secondary"
        size="sm"
        class="self-start px-3 font-bold uppercase"
        is-outline
        @click="$emit('clear:cart')"
      >
        {{ $t("common.buttons.clear_cart") }}
      </VcButton>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { LineItemsGroupByVendorType } from "@/core";
import { CartLineItems } from "@/shared/cart";
import { LineItemType, ValidationErrorType } from "@/xapi";

interface Props {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
  itemsGroupedByVendor?: LineItemsGroupByVendorType<LineItemType>[];
  /** @deprecated */
  validationErrors?: ValidationErrorType[];
}

interface Emits {
  (event: "change:item:quantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:item", value: LineItemType): void;
  (event: "clear:cart"): void;
}

defineEmits<Emits>();

withDefaults(defineProps<Props>(), {
  items: () => [],
  itemsGroupedByVendor: () => [],
  validationErrors: () => [],
});
</script>
