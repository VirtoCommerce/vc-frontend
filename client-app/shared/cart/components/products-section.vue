<template>
  <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
    <!-- Items grouped by Vendor -->
    <div v-if="grouped" class="space-y-8">
      <template v-for="(group, vendorId) in itemsGroupedByVendor" :key="vendorId">
        <div v-if="group.items.length" class="space-y-3">
          <!-- Vendor -->
          <div class="flex flex-wrap gap-x-3 max-w-full">
            <VcVendor :vendor="group.vendor" />
            <VcRating
              v-if="($cfg.rating_enabled && group.vendor?.rating) || true"
              :rating="{ value: 2, reviewCount: 1245 }"
            />
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

    <div class="hidden md:flex justify-end mt-5">
      <VcButton
        :is-disabled="disabled"
        kind="secondary"
        size="sm"
        class="px-3 self-start uppercase font-bold"
        is-outline
        @click="$emit('clear:cart')"
      >
        {{ $t("common.buttons.clear_cart") }}
      </VcButton>
    </div>
  </VcSectionWidget>
</template>

<script setup lang="ts">
import { LineItemType, ValidationErrorType } from "@/xapi";
import { TLineItemsGroupByVendor } from "@/core";
import { CartLineItems } from "@/shared/cart";

interface Props {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
  itemsGroupedByVendor?: TLineItemsGroupByVendor<LineItemType>[];
  /** @deprecated */
  validationErrors?: ValidationErrorType[];
}

interface Emits {
  (event: "change:item:quantity", value: { item: LineItemType; quantity: number }): void;
  (event: "remove:item", value: LineItemType): void;
  (event: "clear:cart"): void;
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  itemsGroupedByVendor: () => [],
  validationErrors: () => [],
});

defineEmits<Emits>();
</script>
