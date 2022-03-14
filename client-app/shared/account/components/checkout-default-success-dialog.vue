<template>
  <VcPopup variant="success" :title="$t('shared.account.checkout_default_success_dialog.title')" is-persistent>
    <template #actions="{ close }">
      <VcButton
        class="uppercase mx-auto inline-flex px-10"
        @click="close"
        v-t="'shared.account.checkout_default_success_dialog.ok_button'"
      ></VcButton>
    </template>
    <div class="flex justify-center items-center px-5 py-10">
      <i class="fas fa-check-circle text-green-500 text-5xl mr-4"></i>
      <span class="text-lg" v-t="'shared.account.checkout_default_success_dialog.message'"></span>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup, VcButton } from "@/components";
</script>
