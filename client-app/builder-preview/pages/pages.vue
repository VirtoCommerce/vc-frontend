/* eslint-disable @typescript-eslint/no-unused-vars */
<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <template v-for="block in template.content" :key="block.id">
      <div class="block py-8" v-if="!block.hidden">
        <component :is="block.type" :model="block" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTemplate } from "./useTemplate";

const { template } = useTemplate("/demo-page");
</script>
