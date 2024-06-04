<template>
  <span>
    <a v-if="isExternalLink" class="footer-link" target="_blank" :href="props.to">
      {{ title }}
    </a>
    <router-link v-else class="footer-link" :to="props.to">
      <slot>{{ title }}</slot>
    </router-link>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getLinkAttr } from "@/core/utilities/common";

interface IProps {
  to: string;
  title?: string;
}

const props = defineProps<IProps>();

const isExternalLink = computed(() => {
  return "externalLink" in getLinkAttr(props.to);
});
</script>

<style lang="scss">
.footer-link {
  @apply text-xs font-medium text-[--footer-top-link-color];

  &:hover {
    @apply text-[--footer-top-link-hover-color];
  }

  &.router-link-active {
    @apply text-[--footer-top-link-active-color];
  }
}
</style>
