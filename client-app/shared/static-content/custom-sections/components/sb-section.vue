<template>
  <div class="sb-section">
    <component :is="renderSection()" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { preloadBehaviors } from "../behaviors";
import { useCustomSectionStyle } from "../composables/useCustomSectionStyle";
import { useReducedMotion } from "../composables/useReducedMotion";
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

const { theme, localizeThemeDraft } = useThemeSnapshot();
const isReducedMotion = useReducedMotion();

registerBuiltInKit();

const definition = computed(() =>
  isCustomSectionType(props.model.type) ? theme.value?.customSections[props.model.type] : undefined,
);

// A draft's defaults may still be translatable dictionaries.
const fields = computed(() => {
  const settings = localizeThemeDraft(definition.value?.schema?.settings);
  return Array.isArray(settings) ? settings : [];
});

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

  return template
    ? renderCustomSection(template, {
        type: props.model.type,
        settings: props.model,
        fields: fields.value,
        assetsBaseUrl: theme.value?.assetsBaseUrl,
        isReducedMotion: isReducedMotion.value,
      })
    : null;
}
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

// Keeps fixed and stacked parts inside the box; `sb-section` is the container name the guide publishes.
.sb-section {
  @apply isolate @container/sb-section;

  contain: paint;
  // Lets a focus ring at the edge show past the clip where supported. Chrome drops a bare `calc()` here.
  overflow-clip-margin: padding-box calc(var(--vc-focus-ring-width) + var(--vc-focus-ring-offset));

  // The strip a marquee makes focusable often fills the box, which would clip a ring drawn outside it.
  [data-marquee]:focus-visible {
    @include focus-ring($inset: true);
  }
}
</style>
