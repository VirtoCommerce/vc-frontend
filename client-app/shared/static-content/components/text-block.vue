<template>
  <div class="text-block pb-16 pt-6">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component :is="model.heading" class="text-2xl">{{ model.title }}</component>
      <div class="block-content text-lg" v-html="contentValue"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
});

const contentValue = computed(() => {
  return props.model.text.html || props.model.text;
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
  }
}
</style>
