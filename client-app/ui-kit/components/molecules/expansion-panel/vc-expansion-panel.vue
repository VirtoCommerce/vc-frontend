<template>
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
          <span class="grow text-15 font-bold">
            {{ title }}
          </span>
        </slot>

        <slot name="header-button" v-bind="{ isExpanded, toggle }">
          <button class="px-3 py-2 ml-2 -mr-3 -my-2 appearance-none before:absolute before:inset-0" @click="toggle">
            <i
              class="fas text-[color:var(--color-primary)] text-base"
              :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
            />
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
import { getCurrentInstance, inject, onBeforeUnmount, ref, watchEffect } from "vue";
import { computedEager } from "@vueuse/core";

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
  }
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
