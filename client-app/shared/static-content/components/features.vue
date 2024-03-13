<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div class="mb-6 text-center text-2xl font-bold lg:text-5xl">{{ model.title }}</div>
      <VcTypography tag="h2" variant="h1" text-transform="none" class="mb-6 text-center">
        {{ model.title }}
      </VcTypography>

      <div class="text-center text-base">{{ model.subtitle }}</div>
      <div class="mt-16 grid grid-cols-1 items-center gap-x-20 gap-y-10 px-8 lg:px-0" :class="classObject">
        <div v-for="(item, index) in model.columns" :key="index" class="text-center">
          <VcImage :src="item.image" class="mx-auto mb-9 h-24" lazy />
          <div class="mb-3 font-roboto-condensed text-2xl font-bold uppercase">{{ item.title }}</div>
          <div class="text-sm">{{ item.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}>();

const classObject = computed(() => {
  const cols = props.model.columns.length;
  return {
    "lg:grid-cols-2": cols % 2 === 0 && cols % 3 !== 0 && cols % 4 !== 0 && cols % 5 !== 0,
    "lg:grid-cols-3": cols % 3 === 0 && cols % 4 !== 0 && cols % 5 !== 0,
    "lg:grid-cols-4": cols % 4 === 0 && cols % 5 !== 0,
    "lg:grid-cols-5": cols % 5 === 0,
  };
});
</script>
