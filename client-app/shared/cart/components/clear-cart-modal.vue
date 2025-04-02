<template>
  <VcModal :title="$t('shared.cart.clear_cart_modal.title')" icon="warning" variant="warning">
    <template #actions="{ close }">
      <VcButton
        color="secondary"
        variant="outline"
        @click="
          $emit('result');
          close();
        "
      >
        {{ $t("common.buttons.yes") }}
      </VcButton>

      <VcButton @click="close()">
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
