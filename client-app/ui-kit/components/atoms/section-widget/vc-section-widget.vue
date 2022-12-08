<template>
  <div class="relative shadow-light-lg lg:bg-white lg:border lg:rounded lg:shadow-md-x">
    <slot name="title" v-if="withTitle">
      <div class="flex items-center gap-3 px-6 pt-6 pb-4">
        <VcImage :alt="title" :src="iconUrl" class="w-11 h-11 -ml-0.5 lg:w-14 lg:h-14 lg:ml-0.5" lazy />
        <h3 class="text-xl font-bold uppercase">
          {{ title }}
        </h3>
      </div>
    </slot>
    <div :class="contentClasses">
      <slot></slot>
    </div>
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

  contentClasses: {
    type: String,
    default: "px-6 pb-6 lg:px-7 lg:pb-7",
  },
});
</script>
