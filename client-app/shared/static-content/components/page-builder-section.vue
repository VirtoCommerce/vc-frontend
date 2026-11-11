<template>
  <component :is="component" v-if="isReady" v-bind="{ ...declaredProps, ...$attrs }" />
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { getLoadedSectionComponent, loadSectionComponent, pickDeclaredProps } from "../sections";
import type { Component } from "vue";

interface IProps {
  component?: Component;
  /** Undeclared keys are dropped: they would otherwise land as attributes on the section's root. */
  item: Record<string, unknown>;
}

defineOptions({ inheritAttrs: false });

const props = defineProps<IProps>();

/**
 * Read for its props only: rendering goes through the async wrapper, which calls the loader again on the next mount;
 * a browser that cached the failed chunk keeps failing until the page reloads.
 * The wrapper renders once the props are known, so a section never starts with its defaults.
 */
const propsSource = shallowRef<Component>();
const loadFailed = ref(false);

const isReady = computed(() => !!props.component && (!!propsSource.value || loadFailed.value));

const declaredProps = computed(() => (propsSource.value ? pickDeclaredProps(propsSource.value, props.item) : {}));

watch(
  () => props.component,
  async (component) => {
    propsSource.value = component ? getLoadedSectionComponent(component) : undefined;
    loadFailed.value = false;

    if (!component || propsSource.value) {
      return;
    }

    try {
      const loaded = await loadSectionComponent(component);

      if (props.component === component) {
        propsSource.value = loaded;
      }
    } catch {
      // The async wrapper reports the error when it mounts, and resets the load for the next mount.
      if (props.component === component) {
        loadFailed.value = true;
      }
    }
  },
  { immediate: true },
);
</script>
