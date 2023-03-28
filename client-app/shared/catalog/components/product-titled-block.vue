<template>
  <div class="flex flex-col">
    <div class="mb-4 flex items-center">
      <VcImage :src="imageSrc" :alt="title" lazy />
      <h2 class="ml-2 text-xl font-extrabold uppercase">{{ title }}</h2>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  imageSrc: string;
  title: string;
}

defineProps<IProps>();
</script>
