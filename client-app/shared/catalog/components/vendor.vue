<template>
  <div class="font-bold">
    <div class="text-link">{{ vendor.name }}</div>
    <div v-if="$cfg.rating_enabled && displayRating" class="text-12">
      <i class="fas fa-star mr-0.5 text-primary" />
      <span class="font-extrabold">{{ vendor.rating?.value }}</span
      >/5&nbsp;({{ vendor.rating?.reviewCount }})
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
