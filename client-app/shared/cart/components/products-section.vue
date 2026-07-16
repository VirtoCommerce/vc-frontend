<template>
  <VcWidget id="products" size="lg" class="products-section">
    <!-- Items grouped by Vendor -->
    <div v-if="grouped" class="products-section__groups">
      <template v-for="(group, vendorId) in itemsGroupedByVendor" :key="vendorId">
        <div v-if="group.items.length" class="products-section__group">
          <!-- Vendor -->
          <div class="products-section__vendor">
            <VendorName :name="group.vendor?.name" class="products-section__vendor-name" />

            <VcRating
              v-if="$cfg.vendor_rating_enabled && group.vendor?.rating"
              :review-count="group.vendor?.rating.reviewCount"
              :value="group.vendor?.rating.value"
              size="xs"
            />
          </div>

          <CartLineItems
            :items="group.items"
            :shared-selected-item-ids="selectedItemIds"
            :disabled="disabled"
            :validation-errors="validationErrors"
            :hide-controls="hideControls"
            @change:item-quantity="$emit('change:itemQuantity', $event)"
            @select:items="$emit('select:items', $event)"
            @remove:items="$emit('remove:items', $event)"
            @save-for-later="$emit('saveForLater', $event)"
            @link-click="$emit('linkClick', $event)"
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
        :hide-controls="hideControls"
        @change:item-quantity="$emit('change:itemQuantity', $event)"
        @select:items="$emit('select:items', $event)"
        @remove:items="$emit('remove:items', $event)"
        @save-for-later="$emit('saveForLater', $event)"
        @link-click="$emit('linkClick', $event)"
      />
    </template>

    <!-- Items in other currencies (always flat, never grouped by vendor) -->
    <template v-for="group in otherCurrencyGroups" :key="group.currencyCode">
      <div v-if="group.items.length" class="products-section__currency-group">
        <h4 class="products-section__currency-title">
          {{ $t("common.labels.products_in_currency", { currency: group.currencyCode }) }}
        </h4>

        <CartLineItems
          :items="group.items"
          :subtotal-currency-code="group.currencyCode"
          :shared-selected-item-ids="selectedItemIds"
          :disabled="disabled"
          :validation-errors="validationErrors"
          :hide-controls="hideControls"
          @change:item-quantity="$emit('change:itemQuantity', $event)"
          @select:items="$emit('select:items', $event)"
          @remove:items="$emit('remove:items', $event)"
          @save-for-later="$emit('saveForLater', $event)"
          @link-click="$emit('linkClick', $event)"
        />

        <LoyaltyValidationAlert
          v-if="!!loyaltyCurrencyCode && group.currencyCode === loyaltyCurrencyCode"
          class="mt-3"
        />
      </div>
    </template>

    <div class="products-section__footer">
      <VcButton
        :disabled="disabled"
        color="secondary"
        size="sm"
        class="products-section__clear-button"
        variant="outline"
        data-test-id="clear-cart-button"
        @click="$emit('clear:cart')"
      >
        {{ $t("common.buttons.clear_cart") }}
      </VcButton>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { VendorName } from "@/shared/common";
import { useLoyaltySettings } from "@/shared/loyalty/composables/useLoyaltySettings";
import type { LineItemType, ValidationErrorType } from "@/core/api/graphql/types";
import type { CurrencyGroupType, VendorGroupType } from "@/core/types";
import CartLineItems from "@/shared/cart/components/cart-line-items.vue";
import LoyaltyValidationAlert from "@/shared/cart/components/loyalty-validation-alert.vue";

interface IEmits {
  (event: "change:itemQuantity", value: { itemId: string; quantity: number }): void;
  (event: "remove:items", value: string[]): void;
  (event: "select:items", value: { itemIds: string[]; selected: boolean }): void;
  (event: "clear:cart"): void;
  (event: "linkClick", value: LineItemType | undefined): void;
  (event: "saveForLater", value: string[]): void;
}

interface IProps {
  grouped?: boolean;
  disabled?: boolean;
  items?: LineItemType[];
  selectedItemIds?: string[];
  itemsGroupedByVendor?: VendorGroupType<LineItemType>[];
  otherCurrencyGroups?: CurrencyGroupType<LineItemType>[];
  validationErrors?: ValidationErrorType[];
  hideControls?: string[];
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  items: () => [],
  itemsGroupedByVendor: () => [],
  otherCurrencyGroups: () => [],
  validationErrors: () => [],
});

const { loyaltyCurrencyCode } = useLoyaltySettings();
</script>

<style lang="scss">
.products-section {
  &__groups {
    @apply space-y-5;

    @media (width >= theme("screens.md")) {
      @apply space-y-7;
    }
  }

  &__group {
    @apply space-y-3;
  }

  &__vendor {
    @apply flex max-w-full gap-2;

    @media (width < theme("screens.xs")) {
      @apply flex-col;
    }
  }

  &__vendor-name {
    @apply min-w-0;
  }

  &__currency-group {
    @apply mt-5 space-y-3;
  }

  &__currency-title {
    @apply text-lg font-black;
  }

  &__footer {
    @apply mt-2 flex justify-end;

    @media (width >= theme("screens.md")) {
      @apply mt-5;
    }
  }

  &__clear-button {
    @apply self-start;
  }
}
</style>
