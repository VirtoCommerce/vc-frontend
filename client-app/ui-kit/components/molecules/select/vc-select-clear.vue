<template>
  <VcButton
    :aria-label="$t('ui_kit.buttons.clear')"
    :disabled="disabled"
    type="button"
    icon="delete-thin"
    color="neutral"
    variant="ghost"
    :icon-size="getInputClearIconSize(size)"
    @keydown.enter.stop.prevent
    @keyup.enter.stop.prevent="$emit('clear')"
    @click.stop="$emit('clear')"
  />
</template>

<script setup lang="ts">
import { getInputClearIconSize } from "@/ui-kit/utilities";

interface IEmits {
  (event: "clear"): void;
}

interface IProps {
  size: "xs" | "sm" | "md" | "auto";
  disabled?: boolean;
}

defineEmits<IEmits>();

defineProps<IProps>();
</script>
