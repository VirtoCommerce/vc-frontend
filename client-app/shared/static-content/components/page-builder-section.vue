<template>
  <component :is="component" v-if="component" v-bind="{ ...declaredProps, ...$attrs }" />
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { getLoadedSectionComponent, loadSectionComponent, pickDeclaredProps } from "../sections";
import type { Component } from "vue";

interface IProps {
  /** Registered section component; nothing is rendered without one. */
  component?: Component;
  /** Page Builder item: only the keys the component declares as props are passed on. */
  item: Record<string, unknown>;
}

defineOptions({ inheritAttrs: false });

const props = defineProps<IProps>();

/**
 * The component whose declared props filter the item. A lazy section still renders through its async
 * wrapper, which resets a failed load so the next mount retries; until it loads, no item keys pass.
 */
const propsSource = shallowRef<Component>();

const declaredProps = computed(() => (propsSource.value ? pickDeclaredProps(propsSource.value, props.item) : {}));

watch(
  () => props.component,
  async (component) => {
    propsSource.value = component ? getLoadedSectionComponent(component) : undefined;

    if (!component || propsSource.value) {
      return;
    }

    try {
      const loaded = await loadSectionComponent(component);

      if (props.component === component) {
        propsSource.value = loaded;
      }
    } catch (error) {
      Logger.error("[page-builder-section] Failed to load a section", error);
    }
  },
  { immediate: true },
);
</script>
