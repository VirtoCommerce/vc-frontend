<template>
  <component
    :is="getComponent(category, name)"
    v-if="name && isRegistered(category, name)"
    v-bind="{ ...getProps(category, name), ...$attrs }"
  />

  <slot v-else />
</template>

<script setup lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

interface IProps {
  category: ExtensionCategoryType;
  name?: string;
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { getComponent, getProps, isRegistered } = useExtensionRegistry();
</script>
