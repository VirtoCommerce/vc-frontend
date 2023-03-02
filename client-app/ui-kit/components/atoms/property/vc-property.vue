<template>
  <div
    :class="[
      'vc-property',
      {
        'vc-property--removed': removed,
      },
    ]"
  >
    <div class="vc-property__label">{{ label }}</div>
    <div class="vc-property__dots"></div>
    <div class="vc-property__value">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label: string;
  value?: string;
  removed?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-property {
  $removed: "";

  @apply grid grid-cols-[auto_1fr_auto] gap-1 font-lato text-xs text-gray-500;

  &--removed {
    $removed: &;
  }

  &__label {
    @apply min-w-0 truncate;

    #{$removed} & {
      @apply text-slate-400;
    }
  }

  &__dots {
    @apply mb-1 border-b border-dashed border-gray-200;
  }

  &__value {
    @apply min-w-0 font-bold text-[color:var(--color-body-text)] truncate;

    #{$removed} & {
      @apply text-slate-400;
    }
  }
}
</style>
