<template>
  <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube">
    <!-- Items grouped by Vendor -->
    <template v-if="grouped">
      <template v-for="(group, vendorId) in itemsGroupedByVendor" :key="vendorId">
        <div v-if="group.items.length" class="lg:mb-5">
          <!-- Vendor -->
          <div class="pb-3 font-bold text-15">
            <span class="mr-1">{{ $t("common.labels.vendor") }}:</span>
            <Vendor v-if="group.vendor" :vendor="group.vendor" class="inline-flex flex-row items-end gap-x-3" />
            <span v-else class="text-gray-400">
              {{ $t("common.labels.not_available") }}
            </span>
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
    </template>

    <!-- Items not grouped by Vendor -->
    <div v-else class="lg:mb-5">
      <CartLineItems
        :items="items"
        :disabled="disabled"
        :validation-errors="validationErrors"
        @change:item:quantity="$emit('change:item:quantity', $event)"
        @remove:item="$emit('remove:item', $event)"
      />
    </div>

    <div class="hidden md:flex justify-end">
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
import { Vendor } from "@/shared/catalog";

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
