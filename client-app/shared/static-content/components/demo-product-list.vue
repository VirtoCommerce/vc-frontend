<template>
  <div class="pb-16 pt-6">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <h2 class="mb-4 text-center text-2xl">{{ model.title }}</h2>
      <VcMarkdownRender :src="model.content" class="text-center text-lg" />
    </div>
    <div class="flex flex-row justify-center space-x-4">
      <template v-for="(item, index) in model.products" :key="index">
        <div v-if="item.product" class="flex w-48 flex-col">
          <VcImage
            :src="item.product.imgSrc"
            :alt="item.product.name"
            size-suffix="md"
            class="h-full w-full select-none space-x-4 rounded object-cover object-center"
          />
          <div class="flex flex-row space-x-4">
            <div class="grow truncate">{{ item.product.name }}</div>
            <div class="whitespace-nowrap">{{ item.product.prices[0].list.formattedAmount }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true,
  },
});
</script>
