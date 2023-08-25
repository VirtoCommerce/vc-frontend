<template>
  <VcPopup :title="$t('shared.cart.clear_cart_modal.title')">
    <template #actions="{ close }">
      <div class="mx-auto flex space-x-5">
        <VcButton
          class="mx-auto"
          color="secondary"
          variant="outline"
          @click="
            $emit('result');
            close();
          "
        >
          {{ $t("common.buttons.yes") }}
        </VcButton>

        <VcButton class="mx-auto" @click="close()">
          {{ $t("common.buttons.no") }}
        </VcButton>
      </div>
    </template>

    <div class="flex items-center justify-center gap-4 px-5 py-10">
      <VcIcon class="flex-none text-[--color-primary-500]" name="exclamation-circle" size="lg" />

      <span class="text-lg">
        {{ $t("shared.cart.clear_cart_modal.message") }}
      </span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
defineEmits(["result"]);
</script>
