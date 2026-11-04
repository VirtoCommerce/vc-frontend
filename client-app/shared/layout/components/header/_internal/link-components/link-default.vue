<template>
  <BottomHeaderLink :link="item" :count="count">
    {{ item.title }}
  </BottomHeaderLink>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";

interface IProps {
  item: ExtendedMenuLinkType;
  count?: number;
}

defineProps<IProps>();
</script>
