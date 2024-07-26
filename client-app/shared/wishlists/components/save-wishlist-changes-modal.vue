<template>
  <VcModal
    :title="$t('pages.account.list_details.save_changes')"
    variant="info"
    modal-width="sm:max-w-[30rem]"
    hide-actions
  >
    <div class="flex flex-row justify-center gap-x-4 px-6 py-10 lg:px-10">
      <p class="lg:text-lg lg:font-bold lg:leading-snug">
        {{ $t("pages.account.list_details.save_changes_message") }}
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-4 px-6 pb-10">
      <VcButton min-width="9rem" color="secondary" variant="outline" @click="$emit('close')">
        {{ $t("common.buttons.no") }}
      </VcButton>

      <VcButton min-width="9rem" @click="$emit('confirm')">
        {{ $t("common.buttons.yes") }}
      </VcButton>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

defineEmits<IEmits>();
</script>
