<template>
  <BottomHeaderLink :link="item">
    {{ item.title }}
  </BottomHeaderLink>
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import BottomHeaderLink from "@/shared/layout/components/header/_internal/bottom-header-link.vue";
defineProps<{ item: ExtendedMenuLinkType }>();
</script>
