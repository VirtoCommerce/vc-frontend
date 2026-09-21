<template>
  <HeaderPod :link="item" :count="products.length" />
</template>

<script setup lang="ts">
import { useCompareProducts } from "@/shared/compare";
import type { ExtendedMenuLinkType } from "@/core/types";
import HeaderPod from "@/shared/layout/components/header/_internal/header-pod.vue";
defineProps<{ item: ExtendedMenuLinkType }>();

const { products } = useCompareProducts();
</script>
