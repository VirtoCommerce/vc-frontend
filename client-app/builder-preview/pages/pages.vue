/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <div class="block py-8" v-for="block in template.content" :key="block.id">
      <component :is="block.type" :model="block" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplate } from "./useTemplate";

const { template } = useTemplate("/demo-page");
</script>
