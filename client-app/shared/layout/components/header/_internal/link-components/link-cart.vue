<template>
  <BottomHeaderLink :link="item" :count="cart?.itemsQuantity">
    {{ item.title }}
  </BottomHeaderLink>
</template>

<script setup lang="ts">
import { useDeferShortCart } from "@/shared/layout";
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";

defineProps<{ item: ExtendedMenuLinkType }>();
const { cart } = useDeferShortCart();
</script>
