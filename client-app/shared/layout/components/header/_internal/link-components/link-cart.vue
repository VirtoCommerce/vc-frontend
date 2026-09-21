<template>
  <HeaderPod :link="item" :count="cart?.itemsQuantity" />
</template>

<script setup lang="ts">
import { useShortCart } from "@/shared/cart";
import type { ExtendedMenuLinkType } from "@/core/types";
import HeaderPod from "@/shared/layout/components/header/_internal/header-pod.vue";

defineProps<{ item: ExtendedMenuLinkType }>();
const { cart } = useShortCart();
</script>
