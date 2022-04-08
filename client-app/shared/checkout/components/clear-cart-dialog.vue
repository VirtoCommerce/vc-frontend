<template>
  <VcPopup :title="$t('pages.checkout.clear_cart_dialog.title')">
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
          {{ $t("pages.checkout.clear_cart_dialog.yes_button") }}
        </VcButton>

        <VcButton class="uppercase mx-auto inline-flex px-10" @click="close()">{{
          $t("pages.checkout.clear_cart_dialog.no_button")
        }}</VcButton>
      </div>
    </template>
    <div class="flex justify-center items-center px-5 py-10">
      <i class="fas fa-exclamation-circle text-[color:var(--color-primary)] text-5xl mr-4"></i>
      <span class="text-lg" v-t="'pages.checkout.clear_cart_dialog.message'"></span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup, VcButton } from "@/components";

defineEmits(["result"]);
</script>
