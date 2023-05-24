<template>
  <div class="polygon-bg grow">
    <div class="container mx-auto px-7 pb-52 pt-5" :class="$attrs.class">
      <div class="flex lg:space-x-24">
        <div class="w-full lg:mt-8 lg:w-1/2">
          <slot name="left"></slot>
        </div>
        <div class="hidden w-full lg:block lg:w-1/2">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>
