<template>
  <div class="py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div class="mb-6 text-center text-2xl font-bold lg:text-5xl">{{ title }}</div>
      <div class="text-center text-base">{{ subtitle }}</div>
      <div class="mt-16 grid grid-cols-1 items-center gap-x-20 gap-y-10 px-8 lg:px-0" :class="classObject">
        <div v-for="(item, index) in columns" :key="index" class="text-center">
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

interface IProps {
  title?: string;
  subtitle?: string;
  background?: string;
  columns: Array<{
    image: string;
    title: string;
    text: string;
  }>;
}

const props = defineProps<IProps>();

const classObject = computed(() => {
  const cols = props.columns.length;
  return {
    "lg:grid-cols-2": cols % 2 === 0 && cols % 3 !== 0 && cols % 4 !== 0 && cols % 5 !== 0,
    "lg:grid-cols-3": cols % 3 === 0 && cols % 4 !== 0 && cols % 5 !== 0,
    "lg:grid-cols-4": cols % 4 === 0 && cols % 5 !== 0,
    "lg:grid-cols-5": cols % 5 === 0,
  };
});
</script>
