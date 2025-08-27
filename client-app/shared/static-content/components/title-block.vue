<template>
  <div class="title-block pb-16 pt-6 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component :is="heading" class="text-2xl">{{ title }}</component>
      <p>{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface IProps {
  heading: string;
  title: string;
  subtitle?: string;
  background?: string;
}

defineProps<IProps>();

</script>

<style lang="scss">
.title-block {
  &.bg-neutral-800 {
    color: white;
  }
}
</style>
