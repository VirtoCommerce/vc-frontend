<template>
  <component :is="resolve(type, id)" v-bind="{ ...getProps(type, id), ...$attrs }" v-if="isRegistered(type, id)" />
</template>

<script setup lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/useExtensionRegistry";
import type { ComponentRegistryKeysType } from "@/shared/common/types/extension-registry";

interface IProps {
  type: ComponentRegistryKeysType;
  id: string;
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { resolve, getProps, isRegistered } = useExtensionRegistry();
</script>
