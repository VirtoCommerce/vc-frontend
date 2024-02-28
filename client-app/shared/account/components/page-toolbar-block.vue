<template>
  <div
    class="sticky top-0 lg:relative"
    :class="{
      'z-40 -mx-6 bg-[color:var(--color-header-bottom-bg)] px-5 py-3.5': stick,
      'shadow-md': stick && shadow,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  stick: Boolean,
  shadow: Boolean,
});
</script>
