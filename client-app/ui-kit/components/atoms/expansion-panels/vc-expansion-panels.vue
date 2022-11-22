<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, provide, ref } from "vue";

/**
 * This component is used only with the child component `VcExpansionPanel`.
 */

const props = defineProps({
  /**
   * Allows multiple panels to expand
   */
  multiple: Boolean,
});

const providedKey = `panels_${getCurrentInstance()?.uid}`;
const panels: TProvidedObjectOfExpansionPanels["panels"] = ref({});

provide<TProvidedObjectOfExpansionPanels>(providedKey, {
  panels,
  toggle(key: string): void {
    const previousValue = panels.value[key];

    if (!props.multiple) {
      // Collapse all
      Object.keys(panels.value).forEach((panelId) => (panels.value[panelId] = false));
    }

    panels.value[key] = !previousValue;
  },
});
</script>
