<template>
  <div class="space-x-1.5 text-nowrap text-neutral-300">
    <VcIcon v-for="i in 5" :key="i" :class="{ 'text-warning': i <= rating }" name="whishlist" />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  rating: number;
}

defineProps<IProps>();
</script>
