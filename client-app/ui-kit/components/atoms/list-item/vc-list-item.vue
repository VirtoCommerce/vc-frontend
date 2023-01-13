<template>
  <li class="marker:text-primary marker:text-xl">
    <slot name="title">
      <div class="font-extrabold">{{ title }}</div>
    </slot>
    <slot>
      <div class="font-medium text-sm">
        {{ description }}
      </div>
    </slot>
  </li>
</template>

<script setup lang="ts">
export interface Props {
  title?: string;
  description?: string;
}

defineProps<Props>();
</script>
