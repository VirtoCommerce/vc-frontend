<template>
  <HeaderPod :link="item" />
</template>

<script setup lang="ts">
import type { ExtendedMenuLinkType } from "@/core/types";
import HeaderPod from "@/shared/layout/components/header/_internal/header-pod.vue";
defineProps<{ item: ExtendedMenuLinkType }>();
</script>
