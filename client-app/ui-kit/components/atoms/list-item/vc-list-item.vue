<template>
  <li class="marker:text-xl marker:text-primary">
    <slot name="title">
      <div class="font-extrabold">{{ title }}</div>
    </slot>
    <slot>
      <div class="text-sm font-medium">
        {{ description }}
      </div>
    </slot>
  </li>
</template>

<script setup lang="ts">
interface IProps {
  title?: string;
  description?: string;
}

defineProps<IProps>();
</script>
