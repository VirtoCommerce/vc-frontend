<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <div class="flex flex-col h-full py-12 justify-center items-center lg:items-start">
        <VcImage src="/static/images/errors/emptyCartMobile.webp" alt="emptyCartMobile" class="lg:hidden mb-8" />
        <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-8" v-t="'shared.checkout.empty_cart.header'"></h2>

        <VcButton :to="{ name: 'Catalog' }" size="lg" class="w-48 uppercase font-bold">
          {{ $t("shared.checkout.empty_cart.continue_shopping_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="/static/images/errors/emptyCart.webp" alt="emptyCart" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { VcImage, VcButton } from "@/components";
import { TwoColumn } from "@/shared/layout";
</script>
