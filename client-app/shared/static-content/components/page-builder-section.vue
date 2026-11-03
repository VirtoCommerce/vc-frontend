<template>
  <component
    :is="component"
    v-if="component && isMounted"
    v-bind="{ ...declaredProps, ...$attrs, ...getPreviewSectionAttrs(item.id) }"
  />

  <!-- keeps the section's anchor id, so a link to a section below the fold still scrolls to it -->
  <div v-else-if="component" :id="$attrs.id as string | undefined" ref="placeholder" :class="$attrs.class" />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import {
  getLoadedSectionComponent,
  getPageBuilderSection,
  getPreviewSectionAttrs,
  loadSectionComponent,
  pickDeclaredProps,
} from "../sections";
import type { Component } from "vue";

interface IProps {
  /** The section component; without one, the section registered for the item's type. Nothing renders without either. */
  component?: Component;
  /** Page Builder item: only the keys the component declares as props are passed on. */
  item: Record<string, unknown>;
  /** The host's data for the section (the product, the category): passed only when declared, over the item's keys. */
  context?: Record<string, unknown>;
  /** Mounts the section only when it comes near the viewport, so a section below the fold loads its data late. */
  lazy?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = defineProps<IProps>();

/** How far below the viewport a lazy section starts to mount. */
const LAZY_ROOT_MARGIN = "400px";

const component = computed(() => props.component ?? getPageBuilderSection(props.item.type));

/**
 * The component whose declared props filter the item. A lazy section still renders through its async
 * wrapper, which resets a failed load so the next mount retries; until it loads, no item keys pass.
 */
const propsSource = shallowRef<Component>();

const declaredProps = computed(() =>
  propsSource.value
    ? {
        ...pickDeclaredProps(propsSource.value, props.item),
        ...pickDeclaredProps(propsSource.value, props.context ?? {}),
      }
    : {},
);

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- a section decides once, at mount, whether it waits
const isMounted = ref(!props.lazy);
const placeholder = useTemplateRef<HTMLElement>("placeholder");

const { stop } = useIntersectionObserver(
  placeholder,
  ([entry]) => {
    if (entry?.isIntersecting) {
      isMounted.value = true;
      stop();
    }
  },
  { rootMargin: LAZY_ROOT_MARGIN },
);

watch(
  component,
  async (value) => {
    propsSource.value = value ? getLoadedSectionComponent(value) : undefined;

    if (!value || propsSource.value) {
      return;
    }

    try {
      const loaded = await loadSectionComponent(value);

      if (component.value === value) {
        propsSource.value = loaded;
      }
    } catch (error) {
      Logger.error("[page-builder-section] Failed to load a section", error);
    }
  },
  { immediate: true },
);
</script>
