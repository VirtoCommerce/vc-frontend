<template>
  <div>
    <h1>{{ title }}</h1>

    <p>{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
export interface IProps {
  title?: string;
  subtitle?: string;
}

defineProps<IProps>();
</script>
