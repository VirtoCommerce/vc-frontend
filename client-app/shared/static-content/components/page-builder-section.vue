<template>
  <component :is="component" v-if="component" v-bind="{ ...declaredProps, ...$attrs }" />
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { getLoadedSectionComponent, loadSectionComponent, pickDeclaredProps } from "../sections";
import type { Component } from "vue";

interface IProps {
  component?: Component;
  /** Undeclared keys are dropped: they would otherwise land as attributes on the section's root. */
  item: Record<string, unknown>;
}

defineOptions({ inheritAttrs: false });

const props = defineProps<IProps>();

/** Read for its props only: rendering goes through the async wrapper, which retries a failed load on the next mount. */
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
