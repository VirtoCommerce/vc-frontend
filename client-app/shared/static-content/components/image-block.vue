<template>
  <div class="pb-16 pt-6 lg:py-24">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <img :src="model.image" :alt="model.alttext" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  model: {
    image: string;
    alttext: string;
  };
}>();
</script>
