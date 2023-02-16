<template>
  <div
    class="sticky top-0 lg:relative"
    :class="[
      stick ? 'z-40 bg-[color:var(--color-header-bottom-bg)] px-5 md:-mx-12 md:px-12' : 'mx-5 md:mx-0',
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
