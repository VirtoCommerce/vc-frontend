<template>
  <div class="flex flex-col -mx-5 lg:mx-0 lg:flex-row lg:items-start lg:gap-x-6">
    <!-- Main section -->
    <div class="contents lg:grow lg:block lg:space-y-6">
      <slot name="main"></slot>
    </div>

    <!-- Sidebar -->
    <div
      class="contents lg:block lg:shrink-0 lg:space-y-6 lg:w-1/4 2xl:w-[285px]"
      :class="{ 'lg:sticky lg:top-5': isSidebarSticky }"
    >
      <slot name="sidebar"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isSidebarSticky: {
    type: Boolean,
    default: false,
  },
});
</script>
