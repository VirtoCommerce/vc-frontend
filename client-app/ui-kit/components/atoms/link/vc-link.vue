<template>
  <component :is="componentTag" v-bind="attrs" class="vc-link" :tabindex="componentTag !== 'span' ? 0 : undefined">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import type { RouteLocationRaw } from "vue-router";

interface IAttributes {
  to?: RouteLocationRaw | null;
  href?: RouteLocationRaw | null;
}

interface IProps {
  to?: RouteLocationRaw;
  externalLink?: RouteLocationRaw;
  disabled?: boolean;
}

const props = defineProps<IProps>();

const isExternalLink = computed(() => {
  return "externalLink" in getLinkAttr(props.to);
});

const componentTag = computed(() => {
  if (props.disabled) {
    return "span";
  }

  if (props.externalLink || isExternalLink.value) {
    return "a";
  }

  return "router-link";
});

const attrs = computed(() => {
  const attributes: IAttributes = {};

  if (componentTag.value === "router-link") {
    attributes.to = props.to;
  }

  if (componentTag.value === "a") {
    attributes.href = props.externalLink ?? props.to;
  }

  return attributes;
});
</script>
