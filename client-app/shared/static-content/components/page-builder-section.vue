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
 * Gives the prop names only: the async wrapper still renders the section and reports a failed load.
 * The section waits for them so it never starts with its default props.
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
      // The async wrapper reports the error when it mounts.
      if (props.component === component) {
        loadFailed.value = true;
      }
    }
  },
  { immediate: true },
);
</script>
