<template>
  <div class="text-block pb-16 pt-6">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component :is="model.heading" class="mb-3 text-2xl">{{ model.title }}</component>
      <div v-html-safe="contentValue" class="block-content text-lg"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface IProps {
  model: {
    heading: string;
    title: string;
    text: string | { html: string };
  };
}

const props = defineProps<IProps>();

const contentValue = computed(() => {
  return typeof props.model.text === "object" ? props.model.text?.html : props.model.text;
});
</script>

<style lang="scss">
.text-block {
  .block-content {
    p {
      margin-bottom: 1.5rem;
    }
    ul {
      list-style: disc inside;
      margin-bottom: 1.5rem;
    }
    a {
      font-weight: bold;
    }
  }
}
</style>
