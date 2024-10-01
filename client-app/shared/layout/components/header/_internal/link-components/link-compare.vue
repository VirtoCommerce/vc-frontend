<template>
  <BottomHeaderLink :link="item" :count="productsIds.length">
    {{ item.title }}
  </BottomHeaderLink>
</template>

<script setup lang="ts">
import { useCompareProducts } from "@/shared/compare";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";
defineProps<{ item: ExtendedMenuLinkType }>();

const { productsIds } = useCompareProducts();
</script>
