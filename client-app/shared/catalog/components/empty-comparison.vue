<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <VcBreadcrumbs :items="breadcrumbs"></VcBreadcrumbs>
    <h1 class="text-black-800 text-3xl uppercase mt-2 font-bold">Compare products</h1>
  </div>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <div class="flex flex-col h-full py-12 justify-center items-center lg:items-start">
        <VcImage src="/static/images/errors/emptyCartMobile.webp" alt="emptyCartMobile" class="lg:hidden mb-8" />
        <h2 class="text-black-800 text-2xl font-bold mb-8">Your product compare list is currently empty</h2>
        <VcButton :to="`/${SeoUrl.Catalog}`" size="lg" class="p-4 uppercase font-bold">Continue browsing here</VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="/static/images/errors/emptyCart.webp" alt="emptyCart" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { VcImage, VcBreadcrumbs, VcButton, IBreadcrumbs } from "@/components";
import { TwoColumn } from "@/shared/layout";
import SeoUrl from "@core/seo-routes.enum";
import { ref } from "vue";

const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: "Home", url: "/" },
  { title: "Compare products", url: "/compare-products" },
]);
</script>
