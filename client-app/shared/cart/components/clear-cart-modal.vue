<template>
  <VcPopup :title="$t('shared.cart.clear_cart_modal.title')">
    <template #actions="{ close }">
      <div class="mx-auto flex space-x-5">
        <VcButton
          class="mx-auto inline-flex px-10 uppercase"
          kind="secondary"
          is-outline
          @click="
            $emit('result');
            close();
          "
        >
          {{ $t("common.buttons.yes") }}
        </VcButton>

        <VcButton class="mx-auto inline-flex px-10 uppercase" @click="close()">
          {{ $t("common.buttons.no") }}
        </VcButton>
      </div>
    </template>
    <div class="flex items-center justify-center px-5 py-10">
      <i class="fas fa-exclamation-circle mr-4 text-5xl text-[color:var(--color-primary)]" />
      <span class="text-lg">
        {{ $t("shared.cart.clear_cart_modal.message") }}
      </span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
defineEmits(["result"]);
</script>
