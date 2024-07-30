<template>
  <VcModal :title="$t('shared.cart.clear_cart_modal.title')" modal-width="sm:max-w-[30rem]">
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

      <VcButton class="ms-auto" @click="close()">
        {{ $t("common.buttons.no") }}
      </VcButton>
    </template>

    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="flex-none text-primary" name="exclamation-circle" size="lg" />

      <span class="text-lg">
        {{ $t("shared.cart.clear_cart_modal.message") }}
      </span>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "result"): void;
}

defineEmits<IEmits>();
</script>
