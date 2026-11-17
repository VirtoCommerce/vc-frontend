<template>
  <div v-if="visibleItems.length" class="page-builder-sections" :class="{ 'page-builder-sections--spaced': spaced }">
    <PageBuilderSection
      v-for="item in visibleItems"
      :key="item.id"
      :item="item"
      :id="getAnchorId(item)"
      :context="context"
      :lazy="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getAnchorId } from "../anchors";
import PageBuilderSection from "./page-builder-section.vue";

interface IProps {
  items: Array<{ id?: string; [key: string]: unknown }>;
  context?: Record<string, unknown>;
  lazy?: boolean;
  spaced?: boolean;
}

const props = defineProps<IProps>();

const visibleItems = computed(() => props.items.filter((item) => !item.hidden));
</script>

<style lang="scss">
.page-builder-sections {
  // space-y, not a flex gap: the sections stay in block flow, where their own margins collapse.
  &--spaced {
    @apply space-y-5;

    @media (width >= theme("screens.xl")) {
      @apply space-y-6;
    }
  }
}
</style>
