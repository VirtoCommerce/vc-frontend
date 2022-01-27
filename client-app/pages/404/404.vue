<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <h1 class="text-black-800 text-7xl md:text-8xl font-black mb-5">404</h1>
      <h2 class="text-black-800 text-2xl md:text-4xl font-bold mb-2">Page Not Found</h2>
      <p class="text-gray-700 text-base md:text-xl leading-relaxed mb-10">We suggest you back to home</p>
      <div>
        <router-link
          to="/"
          tag="button"
          class="bg-yellow-500 hover:bg-yellow-600 uppercase font-bold rounded text-white px-9 py-3 text-base whitespace-nowrap font-roboto"
          >Home page</router-link
        >
      </div>
    </template>
    <template #right>
      <Image src="/static/images/errors/404.webp" alt="Page not found" class="w-full max-w-md" />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { TwoColumn } from "@/shared/layout";
import { Image } from "@/components";
</script>
