<template>
  <div class="brands-list">
    <template v-if="loading">
      <div v-for="i in 10" :key="i" class="brands-list__letters">
        <div class="brands-list__skeleton-letter" />
        <div class="brands-list__skeleton-brands">
          <div v-for="j in 5" :key="j" class="brands-list__skeleton-brand" />
        </div>
      </div>
    </template>

    <template v-else>
      <div v-for="letter in lettersSorted" :key="letter" class="brands-list__letters">
        <VcTypography
          tag="h3"
          class="brands-list__letter"
          :class="{ 'brands-list__letter--active': activeLetter === letter }"
          :data-letter="letter"
        >
          {{ letter }}
        </VcTypography>

        <TransitionGroup name="slide-fade-top" mode="out-in" tag="ul" class="brands-list__brands">
          <li v-for="brand in groupedBrands[letter]" :key="brand.id" class="brands-list__brand">
            <router-link :to="brand.name || '#'">
              {{ brand.name }}
            </router-link>
          </li>
        </TransitionGroup>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BrandFragment } from "@/core/api/graphql/types";

type GroupedBrandsType = Record<string, BrandFragment[]>;

interface IProps {
  groupedBrands: GroupedBrandsType;
  activeLetter: string;
  loading: boolean;
}

const props = defineProps<IProps>();

const lettersSorted = computed(() => {
  return Object.keys(props.groupedBrands).sort();
});
</script>

<style lang="scss">
.brands-list {
  @apply grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-24 gap-y-14;

  &__letter {
    @apply mb-3.5 text-3xl;

    &--active {
      @apply text-primary;
    }
  }

  &__brand {
    @apply text-base break-words;
  }

  &__skeleton-letter {
    @apply h-8 w-6 mb-6 bg-neutral-300 animate-pulse;
  }

  &__skeleton-brand {
    @apply h-3 bg-neutral-300 animate-pulse mb-2;

    &:nth-child(1) {
      @apply w-[50%];
    }

    &:nth-child(2) {
      @apply w-[40%];
    }

    &:nth-child(3) {
      @apply w-[65%];
    }

    &:nth-child(4) {
      @apply w-[55%];
    }

    &:nth-child(5) {
      @apply w-[60%];
    }
  }
}
</style>
