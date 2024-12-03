<template>
  <div
    class="sticky top-0 lg:relative"
    :class="{
      'z-40 -mx-6 bg-additional-50 px-5 py-3.5': stick,
      'shadow-md': stick && shadow,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  stick: boolean;
  shadow: boolean;
}

defineProps<IProps>();
</script>
