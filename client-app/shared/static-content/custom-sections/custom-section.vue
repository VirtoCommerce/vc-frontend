<template>
  <component :is="renderSection()" />
</template>

<script setup lang="ts">
import { computed, useAttrs, watch } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { preloadBehaviors } from "./behaviors";
import { getKitBehaviors, getKitTags, registerBuiltInKit } from "./kit";
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

defineOptions({ inheritAttrs: false });

const props = defineProps<IProps>();

const attrs = useAttrs();
const { theme } = useThemeSnapshot();

registerBuiltInKit();

const definition = computed(() =>
  isCustomSectionType(props.model.type) ? theme.value?.customSections[props.model.type] : undefined,
);

const compiled = computed(() =>
  typeof definition.value?.template === "string"
    ? compileTemplate(definition.value.template, { tags: getKitTags(), behaviors: getKitBehaviors() })
    : undefined,
);

// The behavior chunks load while the section renders, not after it mounts.
watch(
  compiled,
  (value) => {
    if (value) {
      const behaviors = getKitBehaviors();
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

/** Called by the template on every render: the VNodes depend on the settings, the template and the attributes. */
function renderSection(): VNode | null {
  const template = compiled.value;
  const fields = definition.value?.schema?.settings;

  return template
    ? renderCustomSection(template, {
        type: props.model.type,
        settings: props.model,
        fields: Array.isArray(fields) ? fields : [],
        rootAttributes: attrs,
      })
    : null;
}
</script>
