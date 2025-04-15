<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <VcShape :icon="icon" />

      <h2 class="grow text-xl font-bold uppercase text-neutral-950">{{ title }}</h2>

      <slot name="after" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  icon: string;
  title: string;
}

defineProps<IProps>();
</script>
