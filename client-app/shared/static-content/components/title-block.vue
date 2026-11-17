<template>
  <div class="title-block pb-16 pt-6 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component v-if="title?.trim()" :is="headingTag" class="text-2xl">{{ title }}</component>

      <p>{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { toHeadingTag } from "../sections";

export interface IProps {
  heading: string;
  title?: string;
  subtitle?: string;
  background?: string;
}

const props = defineProps<IProps>();

const headingTag = computed(() => toHeadingTag(props.heading));
</script>

<style lang="scss">
.title-block {
  &.bg-neutral-800 {
    color: white;
  }
}
</style>
