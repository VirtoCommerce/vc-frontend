<template>
  <BottomHeaderLink :link="item" :count="products.length">
    {{ item.title }}
  </BottomHeaderLink>
</template>

<script setup lang="ts">
import { useCompareProducts } from "@/shared/compare";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";
defineProps<{ item: ExtendedMenuLinkType }>();

const { products } = useCompareProducts();
</script>
