<template>
  <div
    :class="[
      'credit-card',
      {
        'credit-card--disabled': !cardActive,
      },
    ]"
  >
    <VcIcon class="credit-card__icon" name="credit-card" />

    <div class="credit-card__number">
      {{ cardNumber }}
    </div>

    <VcButton
      class="credit-card__remove"
      :aria-label="$t('common.buttons.remove_credit_card')"
      color="neutral"
      size="xs"
      variant="ghost"
      icon="trash-2"
      @click="$emit('remove')"
    />

    <div v-if="cardExpiration" class="credit-card__expire">
      {{ $t("common.prefixes.expires") }} <span class="credit-card__expiration-date">{{ cardExpiration }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "remove"): void;
}

interface IProps {
  cardNumber: string;
  cardExpiration?: string;
  cardActive: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>

<style lang="scss">
.credit-card {
  $disabled: "";

  // `rounded` is a flat 4px whatever the theme says, and this card is a tile on the page's canvas —
  // it takes the theme's own surface radius, the same one every panel beside it takes.
  @apply relative flex flex-wrap items-center gap-2 rounded-[--vc-radius] bg-additional-50 p-4 pe-2 text-sm text-neutral-900 shadow-md;

  &--disabled {
    $disabled: &;

    @apply text-neutral-400;
  }

  &__icon {
    --vc-icon-color: var(--color-primary-500);

    @apply size-6;

    @media (width > theme("screens.xs")) {
      @apply size-8;
    }

    #{$disabled} & {
      --vc-icon-color: currentColor;

      @apply text-inherit;
    }
  }

  &__number {
    @apply grow font-bold;
  }

  &__expire {
    @apply w-full;

    @media (width > theme("screens.xs")) {
      @apply w-auto;
    }

    @media (width > theme("screens.lg")) {
      @apply me-8;
    }
  }

  &__expiration-date {
    @apply font-bold;
  }

  &__remove {
    // The remove control stands BEFORE the expiry, which is what carries the expiry's own 32 to the
    // card's edge. It used to be sent to the end, where it sat hard against the edge and the expiry
    // read as the last thing in the row.
    @apply -mt-1;

    @media (width > theme("screens.xs")) {
      @apply mt-0;
    }
  }
}
</style>
