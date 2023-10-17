<template>
  <div>
    <div class="truncate font-bold text-[--color-accent-600]">{{ vendor.name }}</div>

    <div v-if="$cfg.rating_enabled && displayRating" class="truncate">
      <VcIcon class="me-0.5 mt-px flex-none text-[--color-primary-500]" name="star" size="xs" />

      <span class="text-xs font-black"> {{ vendor.rating?.value }} </span>/5 ({{ vendor.rating?.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CommonVendor } from "@/core/api/graphql/types";

interface IProps {
  withRating?: boolean;
  vendor: CommonVendor;
}

const props = withDefaults(defineProps<IProps>(), {
  withRating: false,
});

const displayRating = computed(
  () => props.withRating && props.vendor.rating?.reviewCount !== undefined && props.vendor.rating.reviewCount > 0,
);
</script>
