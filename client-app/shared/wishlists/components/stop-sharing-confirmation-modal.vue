<template>
  <!-- The kit's VcConfirmationModal labels its confirm button "OK"; this dialog's copy is prescribed verbatim by
       VCST-5707, down to "Stop sharing". Same shape as the kit organism, its own copy. -->
  <VcModal
    :title="$t('shared.wishlists.stop_sharing_modal.title')"
    variant="danger"
    icon="warning"
    test-id="stop-sharing-modal"
    @close="$emit('close')"
  >
    {{ $t("shared.wishlists.stop_sharing_modal.message") }}

    <template #actions="{ close }">
      <VcButton data-test-id="stop-sharing-cancel-button" color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.stop_sharing_modal.cancel_button") }}
      </VcButton>

      <VcButton data-test-id="stop-sharing-confirm-button" color="danger" @click="$emit('confirm')">
        {{ $t("shared.wishlists.stop_sharing_modal.confirm_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

defineEmits<IEmits>();
</script>
