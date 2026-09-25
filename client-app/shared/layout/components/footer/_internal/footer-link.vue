<template>
  <span>
    <a v-if="isExternalLink" class="footer-link" target="_blank" rel="noopener noreferrer" :href="props.to as string">
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
  @apply block truncate text-sm text-[--footer-top-link-color];

  // Below the desktop ladder the columns are narrow enough that truncating would cut most
  // captions, so the link wraps instead and takes the taller tap target that comes with it.
  @media (width < theme("screens.lg")) {
    @apply overflow-visible whitespace-normal py-[0.3125rem] text-[0.90625rem]/[1.35];
  }

  &:hover {
    @apply text-[--footer-top-link-hover-color];
  }

  &--active {
    @apply text-[--footer-top-link-active-color];
  }
}
</style>
