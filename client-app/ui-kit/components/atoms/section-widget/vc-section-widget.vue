<template>
  <div
    class="relative first:before:hidden before:block before:absolute before:-top-2 before:inset-x-px before:h-2 before:shadow-light-lg"
  >
    <slot name="title" v-if="withTitle">
      <div class="flex items-center gap-3 px-6 pt-6 pb-4 lg:pt-7">
        <VcImage :alt="title" :src="iconUrl" class="w-11 h-11 -ml-0.5 lg:w-14 lg:h-14 lg:ml-0.5" lazy />
        <h3 class="text-gray-800 text-xl font-bold uppercase">
          {{ title }}
        </h3>
      </div>
    </slot>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "",
  },

  iconUrl: {
    type: String,
    default: "",
  },

  withTitle: {
    type: Boolean,
    default: true,
  },
});
</script>
