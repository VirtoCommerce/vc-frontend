<template>
  <!-- `VcConfirmationModal` hardcodes "OK"; this dialog names the action it confirms. -->
  <VcModal :title="$t(copy.title)" variant="danger" icon="warning" test-id="stop-sharing-modal" @close="$emit('close')">
    {{ $t(copy.message) }}

    <template #actions="{ close }">
      <VcButton data-test-id="stop-sharing-cancel-button" color="secondary" variant="outline" @click="close">
        {{ $t("shared.wishlists.stop_sharing_modal.cancel_button") }}
      </VcButton>

      <VcButton data-test-id="stop-sharing-confirm-button" color="danger" @click="$emit('confirm')">
        {{ $t(copy.confirmButton) }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  /** The list is going private. Swapping one sharing scope for another changes the audience rather than ending it. */
  stopping: boolean;
}

interface IEmits {
  (event: "confirm"): void;
  (event: "close"): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const copy = computed(() =>
  props.stopping
    ? {
        title: "shared.wishlists.stop_sharing_modal.title",
        message: "shared.wishlists.stop_sharing_modal.message",
        confirmButton: "shared.wishlists.stop_sharing_modal.confirm_button",
      }
    : {
        title: "shared.wishlists.stop_sharing_modal.change_title",
        message: "shared.wishlists.stop_sharing_modal.change_message",
        confirmButton: "shared.wishlists.stop_sharing_modal.change_confirm_button",
      },
);
</script>
