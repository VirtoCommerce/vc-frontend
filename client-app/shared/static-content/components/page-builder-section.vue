<template>
  <component
    :is="component"
    v-if="isReady && isMounted"
    v-bind="{ ...declaredProps, ...$attrs, ...getPreviewSectionAttrs(item.id) }"
  />

  <!-- keeps the section's anchor id, so a link to a section below the fold still scrolls to it -->
  <div v-else-if="component" :id="$attrs.id as string | undefined" ref="placeholder" :class="$attrs.class" />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from "@vueuse/core";
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
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
  /**
   * Undeclared keys are dropped: they would otherwise land as attributes on the section's root. A section that declares
   * `model` gets the whole item there, as older sections read it.
   */
  item: Record<string, unknown>;
  /**
   * The host's data for the section (the product, the category, the page's settings): passed only when declared, over
   * the item's keys.
   */
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
 * Read for its props only: rendering goes through the async wrapper, which retries a failed load on the next mount.
 * The wrapper renders once the props are known, so a section never starts with its defaults.
 */
const propsSource = shallowRef<Component>();
const loadFailed = ref(false);

const isReady = computed(() => !!component.value && (!!propsSource.value || loadFailed.value));

const declaredProps = computed(() =>
  propsSource.value
    ? {
        ...pickDeclaredProps(propsSource.value, props.item),
        ...pickDeclaredProps(propsSource.value, { model: props.item }),
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
    loadFailed.value = false;

    if (!value || propsSource.value) {
      return;
    }

    try {
      const loaded = await loadSectionComponent(value);

      if (component.value === value) {
        propsSource.value = loaded;
      }
    } catch {
      // The async wrapper reports the error when it mounts, and resets the load for the next mount.
      if (component.value === value) {
        loadFailed.value = true;
      }
    }
  },
  { immediate: true },
);
</script>
