<template>
  <div class="pt-6 pb-16 text-block">
    <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
      <h2 v-if="model.heading == 'h2'" class="text-2xl">{{ model.title }}</h2>
      <h3 v-if="model.heading == 'h3'" class="text-2xl">{{ model.title }}</h3>
      <h4 v-if="model.heading == 'h4'" class="text-2xl">{{ model.title }}</h4>
      <h5 v-if="model.heading == 'h5'" class="text-2xl">{{ model.title }}</h5>
      <h6 v-if="model.heading == 'h6'" class="text-2xl">{{ model.title }}</h6>
      <div class="text-lg block-content" v-html="model.text"></div>
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
