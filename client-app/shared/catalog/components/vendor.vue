<template>
  <router-link :to="link" class="cursor-pointer font-bold text-link">
    {{ vendor.name }}
  </router-link>
  <VcRating
    v-if="withRating"
    :rating="vendor?.rating?.value"
    :review-count="vendor?.rating?.reviewCount"
    class="text-xs"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcRating } from "@/ui-kit/components";
import type { CommonVendor } from "@/xapi/types";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  withRating?: boolean;
  vendor: CommonVendor;
}

const props = withDefaults(defineProps<IProps>(), {
  withRating: false,
});

const link = computed<RouteLocationRaw>(() => ({ name: "Vendor", params: { vendorId: props.vendor.id } }));
</script>
