<template>
  <ExtensionPoint
    v-for="(entry, name) in getEntries(category, names)"
    :key="name"
    v-bind="$attrs"
    :category="category"
    :name="String(name)"
  >
    <!-- Forwarding an empty slot would tell every ExtensionPoint it has a fallback. -->
    <template v-if="$slots.default" #default="{ extensionProps }">
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
