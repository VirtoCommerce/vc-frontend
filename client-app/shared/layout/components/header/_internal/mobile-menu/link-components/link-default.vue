<template>
  <MobileMenuLink :link="item" :count="count" big @close="$emit('close')" @select="$emit('selectItem')">
    {{ item.title }}
  </MobileMenuLink>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  item: ExtendedMenuLinkType;
  count?: number;
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>
