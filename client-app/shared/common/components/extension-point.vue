<template>
  <component
    :is="getComponent(type, id)"
    v-bind="{ ...getComponentProps(type, id), ...$attrs }"
    v-if="isComponentRegistered(type, id)"
  />
</template>

<script setup lang="ts">
import { useExtensionRegistry } from "@/shared/common/composables/useExtensionRegistry";
import type { ComponentRegistryKeysType } from "@/shared/common/types/components-registry";

interface IProps {
  type: ComponentRegistryKeysType;
  id: string;
}

defineOptions({
  inheritAttrs: false,
});

defineProps<IProps>();

const { getComponent, getComponentProps, isComponentRegistered } = useExtensionRegistry();
</script>
