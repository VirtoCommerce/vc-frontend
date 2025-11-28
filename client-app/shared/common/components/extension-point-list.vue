<template>
  <template v-for="(entry, name) in getEntries(category, names)" :key="name">
    <component
      :is="entry.component"
      v-if="name && isRegistered(category, name)"
      v-bind="{ ...getProps(category, name), ...$attrs }"
    />

    <slot v-else />
  </template>
</template>

<script setup lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

interface IProps {
  category: ExtensionCategoryType;
  names?: string[];
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { getEntries, getProps, isRegistered } = useExtensionRegistry();
</script>
