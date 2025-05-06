<template>
  <router-link :to="brand.name || '#'" class="featured-brand" :title="brand.name">
    <VcImage v-if="brand.image" :src="brand.image" :alt="brand.name" />

    <VcTypography v-else tag="h3" class="featured-brand__name">
      {{ brand.name }}
    </VcTypography>
  </router-link>
</template>

<script setup lang="ts">
import type { BrandFragment } from "@/core/api/graphql/types";

interface IProps {
  brand: BrandFragment;
}

defineProps<IProps>();
</script>

<style lang="scss">
.featured-brand {
  @apply bg-additional-50 rounded-md p-4 flex items-center justify-center h-[var(--card-height)] shadow-md;

  &__name {
    @apply text-center;
  }
}
</style>
