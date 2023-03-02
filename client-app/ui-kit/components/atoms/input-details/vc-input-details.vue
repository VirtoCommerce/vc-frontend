<template>
  <div
    :class="[
      'vc-input-details',
      {
        'vc-input-details--hide-empty': !showEmpty,
        'vc-input-details--error': error,
      },
    ]"
  >
    <!-- Message -->
    <!-- eslint-disable-next-line vue/no-v-html-->
    <div v-if="message" class="vc-input-details__message" v-html="message"></div>

    <!-- Counter -->
    <div v-if="counter" class="vc-input-details__counter">
      {{ textLength }}<template v-if="maxLength"> / {{ maxLength }}</template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  message?: string;
  error?: boolean;
  counter?: boolean;
  showEmpty?: boolean;
  textLength?: number;
  maxLength?: number | string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-input-details {
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
