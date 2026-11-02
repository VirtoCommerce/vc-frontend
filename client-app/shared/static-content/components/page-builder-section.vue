<template>
  <component :is="definition" v-if="definition" v-bind="{ ...declaredProps, ...$attrs }" />
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

const definition = shallowRef<Component>();

const declaredProps = computed(() => (definition.value ? pickDeclaredProps(definition.value, props.item) : {}));

watch(
  () => props.component,
  async (component) => {
    definition.value = component ? getLoadedSectionComponent(component) : undefined;

    if (!component || definition.value) {
      return;
    }

    try {
      const loaded = await loadSectionComponent(component);

      if (props.component === component) {
        definition.value = loaded;
      }
    } catch (error) {
      Logger.error("[page-builder-section] Failed to load a section", error);
    }
  },
  { immediate: true },
);
</script>
