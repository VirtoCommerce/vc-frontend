<template>
  <div class="pt-6 pb-16">
    <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
      <h2 class="text-2xl text-center mb-4">{{ model.title }}</h2>
      <VcMarkdownRender :src="model.content" class="text-lg text-center"></VcMarkdownRender>
    </div>
    <div class="flex flex-row justify-center space-x-4">
      <div v-for="item in model.products" :key="item.product?.id" :product="item">
        <div v-show="item.product" class="flex flex-col w-48">
          <VcImage
            :src="item.product.imgSrc"
            :alt="item.product.name"
            size-suffix="md"
            class="w-full h-full rounded object-cover object-center select-none space-x-4"
          />
          <div class="flex flex-row space-x-4">
            <div class="grow truncate">{{ item.product.name }}</div>
            <div class="whitespace-nowrap">{{ item.product.prices[0].list.formattedAmount }}</div>
          </div>
        </div>
      </div>
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
