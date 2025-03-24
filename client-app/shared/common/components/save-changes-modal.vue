<template>
  <VcModal :title="title ?? $t('common.messages.save_changes')" variant="info" icon="warning">
    {{ message ?? $t("common.messages.save_changes") }}

    <template #actions>
      <VcButton color="secondary" variant="outline" min-width="8rem" @click="$emit('close')">
        {{ closeButtonText ?? $t("common.buttons.no") }}
      </VcButton>

      <VcButton class="ml-auto" min-width="8rem" @click="$emit('confirm')">
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
