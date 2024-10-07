<template>
  <ul class="mt-4 flex grow flex-col gap-y-2">
    <li v-for="item in items" :key="item.title">
      <MobileMenuLink :link="item" class="py-1 text-lg" @close="$emit('close')" @select="$emit('selectItem', item)">
        {{ item.title }}
      </MobileMenuLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  items: ExtendedMenuLinkType[];
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem", item: ExtendedMenuLinkType): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>
