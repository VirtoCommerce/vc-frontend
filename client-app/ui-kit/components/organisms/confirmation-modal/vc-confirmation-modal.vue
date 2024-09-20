<template>
  <VcModal :title="title" :variant="variant" :icon="icon" @close="$emit('close')">
    {{ text }}

    <template #actions="{ close }">
      <VcButton v-if="!singleButton" :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton :loading="loading" :color="variant" @click="$emit('confirm')">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

export interface IProps {
  singleButton?: boolean;
  icon?: string;
  title?: string;
  text?: string;
  variant?: "primary" | "secondary" | "info" | "success" | "warning" | "danger" | "neutral" | "accent";
  loading?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  variant: "danger",
  loading: false,
  icon: "warning",
});
</script>
