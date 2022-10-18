<template>
  <div class="pt-6 pb-16 lg:py-24" :class="model.background">
    <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10 items-center">
        <div :class="[model.imagePosition === 'right' ? 'order-2 lg:order-1' : 'order-1 lg:order-2']">
          <div class="font-bold text-2xl lg:text-5xl mb-4">{{ model.title }}</div>
          <div class="text-lg">{{ model.subtitle }}</div>
          <div v-if="model.buttons && model.buttons.length" class="flex mt-6 lg:mt-14 space-x-6">
            <VcButton
              v-for="(item, index) in model.buttons"
              :key="index"
              :to="item.link"
              class="w-1/2 lg:w-auto uppercase px-8"
            >
              {{ item.label }}
            </VcButton>
          </div>
        </div>
        <div
          class="bg-gray-200 rounded aspect-video"
          :class="[model.imagePosition === 'right' ? 'order-1 lg:order-2' : 'order-2 lg:order-1']"
        >
          <img :src="model.image" />
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
