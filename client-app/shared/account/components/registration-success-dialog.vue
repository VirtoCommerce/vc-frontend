<template>
  <Popup variant="success" title="Registration">
    <template #actions>
      <router-link
        to="/"
        class="uppercase mx-auto inline-flex items-center px-10 h-9 font-roboto-condensed text-base font-bold rounded bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
        @click="closePopup"
        >Home page</router-link
      >
    </template>
    <div class="flex justify-center items-center px-5 py-10">
      <i class="fas fa-check-circle text-green-500 text-5xl mr-4"></i>
      <span class="text-lg">Registration successfully completed!</span>
    </div>
  </Popup>
</template>
<script setup lang="ts">
import { Popup } from "@/components";
import { usePopup } from "@/shared/popup";
const { closePopup } = usePopup();
</script>
