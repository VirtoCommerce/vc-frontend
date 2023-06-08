<template>
  <div class="bg-gray-800 py-10 lg:py-24">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div class="flex flex-col items-center justify-between space-y-10 lg:block">
        <div class="text-center text-2xl font-bold text-white lg:text-3xl">{{ model.title }}</div>
        <div class="flex w-full items-center justify-center space-x-6">
          <VcButton v-for="(item, index) in model.buttons" :key="index" :route="item.link" class="flex-1 lg:flex-none">
            {{ item.label }}
          </VcButton>
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

  settings: {
    type: Object,
    required: true,
  },
});
</script>
