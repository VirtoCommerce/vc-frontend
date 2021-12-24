<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <div class="flex flex-col h-full py-12 justify-center items-center lg:items-start">
        <img src="/assets/static/images/errors/emptyCartMobile.webp" alt="emptyCartMobile" class="lg:hidden mb-8" />
        <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-8">Your cart is empty</h2>
        <router-link
          to="/catalog"
          tag="button"
          class="bg-yellow-500 hover:bg-yellow-600 w-48 uppercase font-bold text-center rounded text-white py-3 text-base whitespace-nowrap font-roboto"
          >Continue shopping</router-link
        >
      </div>
    </template>
    <template #right>
      <img src="/assets/static/images/errors/emptyCart.webp" alt="emptyCart" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { TwoColumn } from "@/shared/layout";
</script>

<style scoped></style>
