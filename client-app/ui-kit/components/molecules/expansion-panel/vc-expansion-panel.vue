<template>
  <!-- TODO: use VcWidget instead -->
  <VcCard
    :header-classes="headerClasses"
    :content-classes="contentClasses"
    :is-collapsed="!isExpanded"
    :full-width-content="fullWidthContent"
    :shadow="shadow"
    is-collapsible
  >
    <template #header>
      <slot name="header" v-bind="{ isExpanded, toggle }">
        <slot name="header-content" v-bind="{ isExpanded }">
          <span class="grow text-sm font-bold">
            {{ title }}
          </span>
        </slot>

        <slot name="header-button" v-bind="{ isExpanded, toggle }">
          <button
            type="button"
            class="-my-2 -mr-3 ml-2 appearance-none px-3 py-2 before:absolute before:inset-0"
            @click="toggle"
          >
            <VcIcon :name="isExpanded ? 'chevron-up' : 'chevron-down'" size="sm" class="text-[--color-primary-500]" />
          </button>
        </slot>
      </slot>
    </template>

    <template #default>
      <slot />
    </template>
  </VcCard>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { getCurrentInstance, inject, onBeforeUnmount, ref, watchEffect } from "vue";

/**
 * This component is used together with the parent component `VcExpansionPanels` or independently.
 */

const props = defineProps({
  title: String,
  headerClasses: String,
  contentClasses: String,
  shadow: Boolean,
  fullWidthContent: Boolean,

  expanded: {
    type: Boolean,
    default: false,
  },
});

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

const isExpanded = computedEager<boolean>(() => panels.value[panelId] ?? props.expanded);

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
