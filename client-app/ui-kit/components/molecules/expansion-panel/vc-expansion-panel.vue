<template>
  <VcWidget :collapsed="!isExpanded" :title="title" collapsible @toggle-collapse="toggle">
    <template #prepend>
      <slot name="icon" />
    </template>

    <template #title>
      <slot name="header-content" />
    </template>

    <template #default-container>
      <slot />
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { getCurrentInstance, inject, onBeforeUnmount, ref, watchEffect, computed } from "vue";

/**
 * This component is used together with the parent component `VcExpansionPanels` or independently.
 */

interface IProps {
  title?: string;
  expanded?: boolean;
}

const props = defineProps<IProps>();

const instance = getCurrentInstance();
const panelId = `panel_${instance?.uid}`;
const injectionKey = `panels_${instance?.parent?.uid}`;

const { panels, toggle: providedToggleFn } = inject<TProvidedObjectOfExpansionPanels>(
  injectionKey,
  /**
   * The default value for using the component by itself,
   * i.e. without the `VcExpansionPanels` parent component.
   */
  {
    panels: ref({}),
    toggle: (id: string) => {
      panels.value[id] = !panels.value[id];
    },
  },
);

const isExpanded = computed<boolean>(() => panels.value[panelId] ?? props.expanded);

function toggle() {
  providedToggleFn(panelId);
}

onBeforeUnmount(() => {
  delete panels.value[panelId];
});

watchEffect(() => {
  panels.value[panelId] = props.expanded;
});
</script>
