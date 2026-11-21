<template>
  <div class="sb-section">
    <component :is="renderSection()" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { preloadBehaviors } from "./behaviors";
import { getSectionBehaviors, getSectionTags, registerBuiltInKit } from "./kit";
import { renderCustomSection } from "./render";
import { compileTemplate } from "./template";
import { isCustomSectionType } from "./type-name";
import { useCustomSectionStyle } from "./useCustomSectionStyle";
import type { IThemeItem } from "@/core/theme-snapshot";
import type { VNode } from "vue";

interface IProps {
  /** The placed section: its type and its settings. */
  model: IThemeItem;
}

const props = defineProps<IProps>();

const { theme } = useThemeSnapshot();

registerBuiltInKit();

const definition = computed(() =>
  isCustomSectionType(props.model.type) ? theme.value?.customSections[props.model.type] : undefined,
);

const compiled = computed(() =>
  typeof definition.value?.template === "string"
    ? compileTemplate(definition.value.template, { tags: getSectionTags(), behaviors: getSectionBehaviors() })
    : undefined,
);

// The behavior chunks load while the section renders, not after it mounts.
watch(
  compiled,
  (value) => {
    if (value) {
      const behaviors = getSectionBehaviors();
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
);

/** Called by the template on every render: the VNodes depend on the settings and the template. */
function renderSection(): VNode | null {
  const template = compiled.value;
  const fields = definition.value?.schema?.settings;

  return template
    ? renderCustomSection(template, {
        type: props.model.type,
        settings: props.model,
        fields: Array.isArray(fields) ? fields : [],
      })
    : null;
}
</script>

<style lang="scss">
// Outside the scope the type's CSS reaches: nothing the section draws, fixed or stacked, escapes its box.
// The section's CSS adapts to the place it stands in with `@container sb-section (…)`.
.sb-section {
  contain: paint;
  isolation: isolate;
  container: sb-section / inline-size;
}
</style>
