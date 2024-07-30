<template>
  <div class="py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <div class="flex flex-col items-center justify-between space-y-10 lg:block">
        <div class="text-center text-2xl font-bold text-additional-50 lg:text-3xl">{{ title }}</div>
        <div class="flex w-full items-center justify-center space-x-6">
          <VcButton
            v-for="(item, index) in buttons"
            :key="index"
            v-bind="getLinkAttr(item.link)"
            class="flex-1 lg:flex-none"
          >
            {{ item.label }}
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLinkAttr } from "@/core/utilities/common";

type ButtonType = {
  label: string;
  link: string;
};

interface IProps {
  id: string;
  background?: string;
  title?: string;
  buttons?: Array<ButtonType>;
}

defineProps<IProps>();
</script>
