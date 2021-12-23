<template>
  <div class="polygon-bg flex-grow">
    <div class="container mx-auto pt-5 pb-52 px-7" :class="$attrs.class">
      <div class="flex lg:space-x-24">
        <div class="w-full lg:w-1/2 lg:mt-8">
          <slot name="left"></slot>
        </div>
        <div class="w-full lg:w-1/2 hidden lg:block">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
