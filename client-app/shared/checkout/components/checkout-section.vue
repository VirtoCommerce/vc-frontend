<template>
  <div
    class="bg-white lg:mb-6 lg:rounded"
    :class="[isProductsBlock ? 'shadow lg:pb-11' : 'shadow-inner pb-8 lg:shadow']"
  >
    <div class="flex items-center p-5">
      <img :src="iconUrl" :alt="title" class="mr-5 lg:mr-8" />
      <h3 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">{{ title }}</h3>
    </div>
    <div class="lg:ml-28 lg:mr-11" :class="[isProductsBlock ? 'lg:border lg:rounded' : 'mx-5 lg:mx-0']">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },

  iconUrl: {
    type: String,
    required: true,
  },

  isProductsBlock: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped></style>
