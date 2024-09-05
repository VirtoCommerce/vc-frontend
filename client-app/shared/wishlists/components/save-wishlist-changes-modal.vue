<template>
  <VcModal :title="$t('pages.account.list_details.save_changes')" variant="info" icon="warning">
    {{ $t("pages.account.list_details.save_changes_message") }}

    <template #actions>
      <VcButton color="secondary" variant="outline" @click="$emit('close')">
        {{ $t("common.buttons.no") }}
      </VcButton>

      <VcButton @click="$emit('confirm')">
        {{ $t("common.buttons.yes") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

defineEmits<IEmits>();
</script>
