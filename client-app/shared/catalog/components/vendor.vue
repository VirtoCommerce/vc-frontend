<template>
  <div class="font-bold">
    <div class="text-[color:var(--color-link)]">{{ vendor.name }}</div>
    <div class="text-12">
      <i class="fas fa-star text-[color:var(--color-primary)] mr-0.5" />
      <span class="font-extrabold">{{ vendor.rating?.value }}</span
      >/5&nbsp;({{ vendor.rating?.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Vendor } from "@/xapi/types";
defineProps({
  vendor: {
    type: Object as PropType<Vendor>,
    required: true,
  },
});
</script>
