<template>
  <span>
    <a v-if="isExternalLink" class="footer-link" target="_blank" :href="props.to as string">
      {{ title }}
    </a>

    <router-link v-else class="footer-link" active-class="footer-link--active" :to="props.to || '#'">
      <slot>{{ title }}</slot>
    </router-link>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  to?: RouteLocationRaw;
  title?: string;
}

const props = defineProps<IProps>();

const isExternalLink = computed(() => {
  return "externalLink" in getLinkAttr(props.to);
});
</script>

<style lang="scss">
.footer-link {
  @apply block text-sm text-[--footer-top-link-color] truncate;

  &:hover {
    @apply text-[--footer-top-link-hover-color];
  }

  &--active {
    @apply text-[--footer-top-link-active-color];
  }
}
</style>
