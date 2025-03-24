<template>
  <VcModal
    :title="title ?? $t('common.messages.save_changes')"
    variant="info"
    icon="warning"
    class="save-changes-modal"
  >
    {{ message ?? $t("common.messages.save_changes") }}

    <template #actions>
      <VcButton
        color="secondary"
        variant="outline"
        min-width="8rem"
        class="save-changes-modal__button-cancel"
        @click="$emit('close')"
      >
        {{ closeButtonText ?? $t("common.buttons.no") }}
      </VcButton>

      <VcButton min-width="8rem" class="save-changes-modal__button-confirm" @click="$emit('confirm')">
        {{ confirmButtonText ?? $t("common.buttons.yes") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
export interface IProps {
  title?: string;
  message?: string;
  closeButtonText?: string;
  confirmButtonText?: string;
}

defineEmits<IEmits>();

defineProps<IProps>();

export interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}
</script>

<style lang="scss">
.save-changes-modal {
  &__button-confirm {
    @apply ml-auto;
  }
}
</style>
