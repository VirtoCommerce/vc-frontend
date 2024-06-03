<template>
  <template v-if="'to' in linkAttrs">
    <router-link class="footer-link" :to="linkAttrs.to">
      <slot>{{ title }}</slot>
    </router-link>
  </template>
  <template v-if="'externalLink' in linkAttrs">
    <a class="footer-link" target="_blank" :href="linkAttrs.externalLink">
      {{ title }}
    </a>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getLinkAttr } from "@/core/utilities/common";

interface IProps {
  to: string;
  title?: string;
}

const props = defineProps<IProps>();

const linkAttrs = computed(() => {
  return getLinkAttr(props.to);
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
