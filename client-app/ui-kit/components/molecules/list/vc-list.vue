<template>
  <ul class="vc-list">
    <slot></slot>
  </ul>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@reference "tailwindcss";

.vc-list {
  @apply list-disc space-y-1 pl-5;
}
</style>
