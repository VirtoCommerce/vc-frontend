<template>
  <template v-for="(entry, name) in getEntries(category, names)" :key="name">
    <component
      :is="entry.component"
      v-if="name && canRender(category, name as never, conditionParams as never)"
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
  /** Passed to each registered entry's `condition`; entries without a condition always render. */
  conditionParams?: unknown;
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { getEntries, getProps, canRender } = useExtensionRegistry();
</script>
