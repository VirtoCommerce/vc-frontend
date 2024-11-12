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
      variant="no-background"
      icon="delete-thin"
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

  @apply relative flex flex-wrap items-center gap-2 rounded bg-additional-50 p-4 pe-2 text-sm text-neutral-900 shadow-md;

  &--disabled {
    $disabled: &;

    @apply text-neutral-400;
  }

  &__icon {
    @apply size-6 fill-primary;

    @media (width > theme("screens.xs")) {
      @apply size-8;
    }

    #{$disabled} & {
      @apply fill-inherit;
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
    @apply -mt-1;

    @media (width > theme("screens.xs")) {
      @apply order-last mt-0;
    }
  }
}
</style>
