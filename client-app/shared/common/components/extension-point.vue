<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && isRegistered(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <!-- An entry may carry `props` without a `component` to decorate the host's own fallback
       (e.g. a badge count) instead of replacing it. -->
  <slot v-else v-bind="{ extensionProps: name ? getProps(category, name) : undefined }" />
</template>

<script lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

// Exported (hence this second block) because `generic` makes the generated component type
// reference it, and <script setup> cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  name?: string;
}
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
defineOptions({
  inheritAttrs: false,
});

defineProps<IProps<C>>();

const { getComponent, getProps, isRegistered } = useExtensionRegistry();
</script>
