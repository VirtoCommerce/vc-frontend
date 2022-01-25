<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <div class="flex flex-col h-full py-12 justify-center items-center lg:items-start">
        <img src="/assets/static/images/errors/emptyCartMobile.webp" alt="emptyCartMobile" class="lg:hidden mb-8" />
        <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-8">Your cart is empty</h2>
        <VcButton to="/catalog" size="lg" class="w-48 uppercase font-bold">Continue shopping</VcButton>
      </div>
    </template>
    <template #right>
      <img src="/assets/static/images/errors/emptyCart.webp" alt="emptyCart" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { TwoColumn } from "@/shared/layout";
import { Button as VcButton } from "@/components";
</script>

<style scoped></style>
