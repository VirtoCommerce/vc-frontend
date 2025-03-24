<template>
  <VcModal :title="title" :variant="variant" :icon="icon" class="confirmation-modal" @close="$emit('close')">
    {{ text }}

    <template #actions="{ close }">
      <VcButton
        v-if="!singleButton"
        :disabled="loading"
        color="secondary"
        variant="outline"
        min-width="8rem"
        class="confirmation-modal__button-cancel"
        @click="close"
      >
        {{ $t("ui_kit.buttons.cancel") }}
      </VcButton>

      <VcButton
        :loading="loading"
        :color="variant"
        class="confirmation-modal__button-confirm"
        min-width="8rem"
        @click="$emit('confirm')"
      >
        {{ $t("ui_kit.buttons.ok") }}
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

<style lang="scss">
.confirmation-modal {
  &__button-confirm {
    @apply ms-auto;
  }
}
</style>
