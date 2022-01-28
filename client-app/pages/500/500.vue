<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <h1 class="text-black-800 text-7xl md:text-8xl font-black mb-5">500</h1>
      <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-2">Internal Server Error</h2>
      <p class="text-gray-700 text-base md:text-xl leading-relaxed mb-10">We suggest you back to home</p>
      <div>
        <VcButton to="/" size="md" class="w-40 uppercase">Home page</VcButton>
      </div>
    </template>
    <template #right>
      <Image src="/static/images/errors/500.webp" alt="Internal Server Error" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { TwoColumn } from "@/shared/layout";
import { Image, Button as VcButton } from "@/components";
</script>
