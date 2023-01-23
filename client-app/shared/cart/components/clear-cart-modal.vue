<template>
  <VcPopup :title="$t('shared.cart.clear_cart_modal.title')">
    <template #actions="{ close }">
      <div class="flex mx-auto space-x-5">
        <VcButton
          class="uppercase mx-auto inline-flex px-10"
          kind="secondary"
          is-outline
          @click="
            $emit('result');
            close();
          "
        >
          {{ $t("common.buttons.yes") }}
        </VcButton>

        <VcButton class="uppercase mx-auto inline-flex px-10" @click="close()">
          {{ $t("common.buttons.no") }}
        </VcButton>
      </div>
    </template>
    <div class="flex justify-center items-center px-5 py-10">
      <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] text-5xl mr-4" />
      <span class="text-lg">
        {{ $t("shared.cart.clear_cart_modal.message") }}
      </span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
defineEmits(["result"]);
</script>
