<template>
  <div
    :class="[
      'vc-input-details',
      {
        'vc-input-details--hide-empty': !showEmpty,
        'vc-input-details--error': error,
        'vc-input-details--single-line': singleLine,
      },
    ]"
  >
    <!-- Message -->
    <template v-if="message">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="!singleLine" v-html-safe="message" class="vc-input-details__message"></div>

      <VcTooltip v-else class="vc-input-details__tooltip-container" placement="bottom-start" enable-teleport>
        <template #trigger>
          <div class="vc-input-details__message">{{ message }}</div>
        </template>

        <template #content>
          {{ message }}
        </template>
      </VcTooltip>
    </template>

    <!-- Counter -->
    <div v-if="counter" class="vc-input-details__counter">
      {{ textLength }}<template v-if="maxLength"> / {{ maxLength }}</template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  message?: string;
  singleLine?: boolean;
  error?: boolean;
  counter?: boolean;
  showEmpty?: boolean;
  textLength?: number;
  maxLength?: number | string;
}

withDefaults(defineProps<IProps>(), {
  textLength: 0,
});
</script>

<style lang="scss">
.vc-input-details {
  $error: "";
  $singleLine: "";

  @apply flex mt-1 gap-2 min-h-3 text-xxs;

  &--error {
    $error: &;
  }

  &--single-line {
    $singleLine: &;
  }

  &--hide-empty {
    @apply empty:hidden;
  }

  &__message {
    @apply grow text-neutral-500;

    #{$error} & {
      @apply text-danger;
    }

    #{$singleLine} & {
      @apply line-clamp-1;
    }
  }

  &__counter {
    @apply text-right whitespace-nowrap;
  }
}
</style>
