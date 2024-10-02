<template>
  <div class="text-neutral-300">
    <VcIcon v-for="i in 5" :key="i" :class="{ 'text-warning': i <= rating }" name="star" />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  rating: number;
}

defineProps<IProps>();
</script>
