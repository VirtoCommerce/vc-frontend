<template>
  <div class="sb-section">
    <component :is="renderSection()" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { preloadBehaviors, useReducedMotion } from "../behaviors";
import { useCustomSectionStyle } from "../composables/useCustomSectionStyle";
import { getCustomSectionBehaviors, getCustomSectionKit, registerBuiltInKit } from "../kit";
import { renderCustomSection } from "../render";
import { compileTemplate } from "../template";
import { isCustomSectionType } from "../type-name";
import type { IThemeItem } from "@/core/theme-snapshot";
import type { VNode } from "vue";

interface IProps {
  /** The placed section: its type and its settings. */
  model: IThemeItem;
}

const props = defineProps<IProps>();

const { theme } = useThemeSnapshot();
const reducedMotion = useReducedMotion();

registerBuiltInKit();

const definition = computed(() =>
  isCustomSectionType(props.model.type) ? theme.value?.customSections[props.model.type] : undefined,
);

const compiled = computed(() =>
  typeof definition.value?.template === "string"
    ? compileTemplate(definition.value.template, getCustomSectionKit())
    : undefined,
);

// The behavior chunks load while the section renders, not after it mounts.
watch(
  compiled,
  (value) => {
    if (value) {
      const behaviors = getCustomSectionBehaviors();
      preloadBehaviors(
        [...value.behaviors].filter((name) => Object.hasOwn(behaviors, name)).map((name) => behaviors[name]),
      );
    }
  },
  { immediate: true },
);

useCustomSectionStyle(
  () => props.model.type,
  () => definition.value?.css,
  () => theme.value?.assetsBaseUrl,
);

/** Not a computed: VNodes must be fresh on every render. */
function renderSection(): VNode | null {
  const template = compiled.value;
  const fields = definition.value?.schema?.settings;

  return template
    ? renderCustomSection(template, {
        type: props.model.type,
        settings: props.model,
        fields: Array.isArray(fields) ? fields : [],
        assetsBaseUrl: theme.value?.assetsBaseUrl,
        isReducedMotion: reducedMotion.value === "reduce",
      })
    : null;
}
</script>

<style lang="scss">
// Keeps fixed and stacked parts inside the box; `sb-section` is the container name the guide publishes.
.sb-section {
  @apply isolate @container/sb-section;

  contain: paint;
}
</style>
