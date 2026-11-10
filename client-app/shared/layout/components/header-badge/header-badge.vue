<template>
  <!--
    Own dot, not a slotless VcBadge: the kit dot is filled with shade 700 and has no ring,
    and a kit component must not be restyled locally, so the design's danger-400 dot with a ring is drawn here.
  -->
  <transition mode="out-in" name="scale">
    <span v-if="count && dot" v-bind="$attrs" aria-hidden="true" class="header-badge header-badge--dot" />

    <VcBadge
      v-else-if="count"
      v-bind="$attrs"
      aria-hidden="true"
      class="header-badge"
      :class="{ 'header-badge--overlay': overlay }"
      :size="size"
      :variant="variant"
      :color="color"
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
  dot?: boolean;
  size?: VcBadgeSizeType;
  variant?: VcBadgeVariantType;
  color?: VcBadgeColorType;
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
  // Starts at the icon's centre and grows towards the inline end, so the left half of the icon stays visible
  &--overlay {
    @apply absolute -top-1.5 start-1/2;
  }

  // The ring in the header's own background keeps the dot apart from an icon of the same colour,
  // in every preset and in dark mode. It never grows, so it sits on the icon's top inline-end corner.
  &--dot {
    @apply absolute -top-px -end-px size-2 rounded-full bg-danger-400 ring-2 ring-[--header-bottom-bg-color];
  }
}
</style>
