<template>
  <Popup variant="success" title="Registration" is-persistent>
    <template #actions="{ close }">
      <VcButton class="uppercase mx-auto inline-flex px-10" @click="close">Ok</VcButton>
    </template>
    <div class="flex justify-center items-center px-5 py-10">
      <i class="fas fa-check-circle text-green-500 text-5xl mr-4"></i>
      <span class="text-lg">Checkout defaults are success updated!</span>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { Popup, Button as VcButton } from "@/components";
</script>
