<template>
  <VcModal
    :title="$t('shared.cart.clear_cart_modal.title')"
    icon="warning"
    variant="warning"
    test-id="clear-cart-modal"
  >
    <template #actions="{ close }">
      <VcButton
        color="secondary"
        variant="outline"
        data-test-id="clear-cart-modal.yes-button"
        @click="
          $emit('result');
          close();
        "
      >
        {{ $t("common.buttons.yes") }}
      </VcButton>

      <VcButton data-test-id="clear-cart-modal.no-button" @click="close()">
        {{ $t("common.buttons.no") }}
      </VcButton>
    </template>

    {{ $t("shared.cart.clear_cart_modal.message") }}
  </VcModal>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "result"): void;
}

defineEmits<IEmits>();
</script>
