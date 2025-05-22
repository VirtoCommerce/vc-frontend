<template>
  <component :is="getComponent(category, name)" v-bind="{ ...getProps(category, name), ...$attrs }" />
</template>

<script setup lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/useExtensionRegistry";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";

interface IProps {
  category: ExtensionCategoryType;
  name: string;
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { getComponent, getProps } = useExtensionRegistry();
</script>
