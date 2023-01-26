<template>
  <router-link :to="link" class="font-bold text-link cursor-pointer">
    {{ vendor.name }}
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouteLocationRaw } from "vue-router";

export interface Props {
  vendor: {
    id: string;
    name?: string;
  };
}

const props = defineProps<Props>();

const link = computed<RouteLocationRaw>(() => ({ name: "Vendor", params: { vendorId: props.vendor.id } }));
</script>
