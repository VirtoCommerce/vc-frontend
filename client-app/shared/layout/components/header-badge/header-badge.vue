<template>
  <transition mode="out-in" name="scale">
    <VcBadge
      v-if="count"
      v-bind="$attrs"
      aria-hidden="true"
      class="header-badge"
      :class="{ 'header-badge--overlay': overlay }"
      rounded
      nowrap
      max-width="none"
    >
      {{ formatHeaderBadgeCount(count) }}
    </VcBadge>
  </transition>
</template>

<script setup lang="ts">
import { formatHeaderBadgeCount } from "@/shared/layout/utils";

interface IProps {
  count?: number;
  overlay?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<IProps>(), {
  count: 0,
});
</script>

<style lang="scss">
.header-badge {
  &--overlay {
    @apply absolute -top-2 start-1/2;
  }
}
</style>
