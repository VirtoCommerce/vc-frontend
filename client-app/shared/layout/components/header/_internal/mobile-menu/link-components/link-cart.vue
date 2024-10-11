<template>
  <MobileMenuLink :link="item" :count="cart?.itemsQuantity" class="py-1 text-2xl font-bold" @close="$emit('close')">
    {{ item.title }}
  </MobileMenuLink>
</template>

<script setup lang="ts">
import { useShortCart } from "@/shared/cart";
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  item: ExtendedMenuLinkType;
}

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();

const { cart } = useShortCart();
</script>
