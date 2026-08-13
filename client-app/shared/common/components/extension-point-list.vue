<template>
  <ExtensionPoint
    v-for="(entry, name) in getEntries(category, names)"
    :key="name"
    :category="category"
    :name="String(name)"
    v-bind="$attrs"
  >
    <template #default="{ extensionProps }">
      <slot v-bind="{ name: String(name), entry, extensionProps }" />
    </template>
  </ExtensionPoint>
</template>

<script lang="ts">
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

// `generic` makes the generated component type reference this interface, and <script setup>
// cannot carry ES exports.
export interface IProps<C extends ExtensionCategoryType> {
  category: C;
  names?: string[];
}
</script>

<script setup lang="ts" generic="C extends ExtensionCategoryType">
import ExtensionPoint from "@/shared/common/components/extension-point.vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps<C>>();

const { getEntries } = useExtensionRegistry();
</script>
