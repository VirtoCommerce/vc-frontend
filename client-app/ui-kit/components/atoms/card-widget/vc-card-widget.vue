<template>
  <div
    class="relative bg-white lg:border lg:rounded lg:shadow-md-x after:z-[1] after:absolute after:top-full after:w-full after:h-3 after:bg-gradient-to-b after:from-[#f1f1f1] after:lg:hidden"
  >
    <slot name="title" v-if="withTitle">
      <div
        class="flex items-center gap-3 px-6 pt-6 lg:px-5 lg:py-3.5 lg:border-b"
        :class="{ 'hidden lg:block': hideMobileTitle, 'lg:hidden': hideDesktopTitle }"
      >
        <VcImage :alt="title" :src="iconUrl" class="w-11 h-11 -ml-0.5 lg:hidden" lazy />
        <h3 class="text-xl font-bold uppercase lg:text-19">
          {{ title }}
        </h3>
      </div>
    </slot>

    <div :class="contentClasses">
      <slot />
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

  hideMobileTitle: {
    type: Boolean,
    default: false,
  },

  hideDesktopTitle: {
    type: Boolean,
    default: false,
  },

  contentClasses: {
    type: String,
    default: "p-6 lg:p-5",
  },
});
</script>
