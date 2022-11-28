<template>
  <div class="font-bold">
    <div class="text-link">{{ vendor.name }}</div>
    <div v-if="displayRating" class="text-12">
      <i class="fas fa-star text-primary mr-0.5" />
      <span class="font-extrabold">{{ vendor.rating?.value }}</span
      >/5&nbsp;({{ vendor.rating?.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";
import { computed } from "vue";

export interface Props {
  displayRating?: boolean;
  vendor: Vendor;
}

const props = withDefaults(defineProps<Props>(), {
  displayRating: true,
});

const displayRating = computed(
  () => props.displayRating && props.vendor.rating?.reviewCount !== undefined && props.vendor.rating?.reviewCount > 0
);
</script>
