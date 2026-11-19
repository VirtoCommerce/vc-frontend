<template>
  <div class="subscription-summary">
    <VcIcon class="subscription-summary__icon" name="calendar-check" size="sm" />

    <span class="subscription-summary__text">
      <span class="subscription-summary__title">{{ $t("product_subscriptions.cart.subscribed") }}</span>
      · {{ label }}
    </span>

    <template v-if="number">
      <VcLink v-if="numberTo" :to="numberTo" class="subscription-summary__number-link" :data-test-id="numberTestId">
        {{ $t("product_subscriptions.common.subscription_number", { number }) }}
      </VcLink>

      <span v-else class="subscription-summary__number">
        {{ $t("product_subscriptions.common.subscription_number", { number }) }}
      </span>
    </template>

    <VcButton
      v-if="changeable"
      color="secondary"
      variant="ghost"
      size="xs"
      :data-test-id="changeTestId"
      @click="$emit('change', $event)"
    >
      {{ $t("product_subscriptions.cart.change") }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "change", value: MouseEvent): void;
}

interface IProps {
  /** The frequency, e.g. "Every month". */
  label: string;
  /** Shows the Change button (the cart); without it the line is read-only (an order). */
  changeable?: boolean;
  /** Test id of the Change button. */
  changeTestId?: string;
  /** The subscription's number, e.g. SUB-000103; shown after the frequency. */
  number?: string;
  /** Where the number leads (the subscription on Account › Subscriptions); without it the number is plain text. */
  numberTo?: RouteLocationRaw;
  numberTestId?: string;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.subscription-summary {
  @apply flex flex-wrap items-center gap-x-3 gap-y-1;

  &__icon {
    --vc-icon-color: var(--color-neutral-700);
  }

  &__text {
    @apply text-sm text-neutral-900;
  }

  &__title {
    @apply font-bold;
  }

  &__number {
    @apply text-sm text-neutral-600;
  }

  &__number-link {
    @apply text-sm text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
