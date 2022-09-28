<template>
  <div
    class="sticky lg:relative top-0"
    :class="[
      stick ? 'z-40 px-5 md:px-12 md:-mx-12 bg-[color:var(--color-header-bottom-bg)]' : 'mx-5 md:mx-0',
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
