<template>
  <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
    <!-- Items grouped by Vendor -->
    <div v-if="grouped" class="space-y-5 md:space-y-7">
      <template v-for="(group, vendorId) in itemsGroupedByVendor" :key="vendorId">
        <div v-if="group.items.length" class="space-y-3">
          <!-- Vendor -->
          <div class="flex max-w-full flex-wrap gap-x-3">
            <Vendor :vendor="group.vendor" />
            <VcRatingInfo :rating="group.vendor?.rating?.value" :review-count="group.vendor?.rating?.reviewCount" />
          </div>

          <CartLineItems
            :items="group.items"
            :disabled="disabled"
            :validation-errors="validationErrors"
            @change:item-quantity="$emit('change:itemQuantity', $event)"
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
        @change:item-quantity="$emit('change:itemQuantity', $event)"
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
import { Vendor } from "@/shared/checkout/components";
import { VcButton, VcSectionWidget, VcRatingInfo } from "@/ui-kit/components";
import { default as CartLineItems } from "./cart-line-items.vue";
import type { LineItemsGroupByVendorType } from "@/core/types";
import type { LineItemType, ValidationErrorType } from "@/xapi/types";

interface IEmits {
  (event: "change:itemQuantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:item", value: LineItemType): void;
  (event: "clear:cart"): void;
}

interface IProps {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
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
