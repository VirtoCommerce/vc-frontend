<template>
  <div class="text-sm font-bold text-gray-500">
    {{ vendor?.name }}
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";
import { PropType } from "vue";

defineProps({
  vendor: {
    type: Object as PropType<Vendor | undefined>,
    required: true,
  },
});
</script>
