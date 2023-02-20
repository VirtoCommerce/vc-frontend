<template>
  <div
    :class="[
      'vc-form-details',
      {
        'vc-form-details--hide-empty': !showEmpty,
        'vc-form-details--error': error,
      },
    ]"
  >
    <!-- Message -->
    <div v-if="message" class="vc-form-details__message" v-html="message"></div>

    <!-- Counter -->
    <div v-if="counter" class="vc-form-details__counter">
      {{ textLength }}<template v-if="maxLength"> / {{ maxLength }}</template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
  error?: boolean;
  counter?: boolean;
  showEmpty?: boolean;
  textLength?: number;
  maxLength?: number | string;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-form-details {
  $error: "";

  @apply flex justify-end mt-0.5 gap-2 min-h-[0.875rem] text-11;

  &--error {
    $error: &;
  }

  &--hide-empty {
    @apply empty:hidden;
  }

  &__message {
    @apply grow text-gray-400;

    #{$error} & {
      @apply text-[color:var(--color-danger)];
    }
  }

  &__counter {
    @apply font-medium text-right;
  }
}
</style>
