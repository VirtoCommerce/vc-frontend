<template>
  <div
    class="sticky top-0 lg:relative"
    :class="[
      stick ? 'z-40 bg-[color:var(--color-header-bottom-bg)] px-5 py-3.5' : 'mx-5 lg:mx-0',
      { 'shadow-md': stick && shadow },
    ]"
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
