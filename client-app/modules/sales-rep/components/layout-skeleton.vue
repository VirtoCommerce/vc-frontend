<template>
  <div class="layout-skeleton">
    <div class="layout-skeleton__stats">
      <div v-for="index in stats" :key="index" class="layout-skeleton__card" />
    </div>

    <div v-for="index in blocks" :key="index" class="layout-skeleton__block" />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  /** Placeholder cards in the KPI row — the registry default, not the saved count, which is unknown. */
  stats?: number;
  blocks?: number;
}

withDefaults(defineProps<IProps>(), { stats: 4, blocks: 1 });
</script>

<style lang="scss">
// Stands in for the whole layout until the saved document arrives. Rendering the registry default
// first and re-ordering on response would show the rep a layout that is not theirs and then shuffle
// it under them, so nothing block-shaped is drawn until we know the real arrangement.
.layout-skeleton {
  @apply flex flex-col gap-5;

  &__stats {
    @apply flex flex-wrap gap-4;
  }

  &__card {
    @apply h-28 min-w-0 basis-full rounded-[--vc-radius] bg-neutral-100;

    @media (min-width: theme("screens.sm")) {
      @apply basis-[calc(50%-0.5rem)];
    }

    @media (min-width: theme("screens.xl")) {
      @apply basis-0 grow;
    }
  }

  &__block {
    @apply h-64 rounded-[--vc-radius] bg-neutral-100;
  }
}
</style>
