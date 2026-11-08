<template>
  <div class="purchase-option" :class="{ 'purchase-option--active': model === value }">
    <VcRadioButton
      v-model="model"
      :value="value"
      :name="name"
      size="sm"
      :disabled="disabled"
      class="purchase-option__radio"
      :data-test-id="testId"
    >
      <span class="purchase-option__body">
        <span class="purchase-option__title">
          <slot name="title" />
        </span>

        <span class="purchase-option__price">
          <slot name="price">
            <VcPriceDisplay :value="price" />
          </slot>

          <s v-if="strikePrice" class="purchase-option__strike"><VcPriceDisplay :value="strikePrice" /></s>
        </span>
      </span>
    </VcRadioButton>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
import type { MoneyType } from "@/core/api/graphql/types";

defineProps<{
  value: T;
  name: string;
  disabled?: boolean;
  /** The option's price, unless the `price` slot shows it. */
  price?: MoneyType;
  /** A higher price shown struck through next to it. */
  strikePrice?: MoneyType;
  testId?: string;
}>();
const model = defineModel<T>();
</script>

<style lang="scss">
.purchase-option {
  $active: "";

  --border-color: var(--color-neutral-200);

  @apply rounded-[--vc-radius] border border-[--border-color] bg-additional-50 p-3 transition-colors;

  // Selection is accent, not primary: primary stays with the action (Add to cart).
  &--active {
    $active: &;

    --border-color: var(--color-accent-500);

    @apply bg-accent-50;
  }

  // The selected card keeps its accent border on hover.
  &:not(#{$active}) {
    &:hover {
      --border-color: var(--color-accent-300);
    }
  }

  &__radio {
    // the checked marker follows the card: accent, not the primary default
    --vc-radio-button-base-color: var(--color-accent-500);
  }

  &__body {
    @apply flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1;
  }

  &__title {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-900;
  }

  &__price {
    @apply text-sm font-bold text-neutral-900;
  }

  &__strike {
    @apply ms-1 text-xs font-normal text-neutral-600;
  }
}
</style>
