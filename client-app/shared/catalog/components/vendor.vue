<template>
  <div class="flex items-center gap-x-1">
    <div class="truncate font-bold">{{ vendor.name }}</div>

    <div v-if="$cfg.rating_enabled && displayRating" class="flex items-center gap-1">
      <VcIcon class="flex-none text-[--color-primary-500]" name="star" size="xs" />

      <span class="whitespace-nowrap font-normal">
        <span class="font-black"> {{ vendor.rating?.value }} </span>/5 ({{ vendor.rating?.reviewCount }})
      </span>
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
  () => props.withRating && props.vendor.rating?.reviewCount !== undefined && props.vendor.rating?.reviewCount > 0,
);
</script>
