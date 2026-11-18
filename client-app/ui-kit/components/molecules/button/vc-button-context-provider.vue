<template>
  <slot />
</template>

<script setup lang="ts">
import { provideButtonContext } from "./vc-button-context";

interface IProps {
  size?: VcButtonSizeType;
  color?: VcButtonColorType;
  variant?: VcButtonVariantType;
}

const props = defineProps<IProps>();

provideButtonContext(() => ({ size: props.size, color: props.color, variant: props.variant }));
</script>
