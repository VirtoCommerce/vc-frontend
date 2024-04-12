<template>
  <div class="block-subscribe-form py-10 lg:py-24" :class="model.background">
    <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
      <div class="mb-4 text-center text-2xl font-bold lg:text-4xl">{{ model.title }}</div>
      <div class="mb-8 text-center text-lg font-bold">{{ model.subtitle }}</div>
      <VcInput class="mx-auto max-w-lg" :placeholder="model.placeholder" />
      <div class="text-center">
        <div class="mt-4">
          <VcCheckbox class="inline-flex">
            <span v-html-safe="model.checkboxText" class="checkbox-label"></span>
          </VcCheckbox>
        </div>

        <VcButton class="mt-10">
          {{ model.buttonText }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true,
  },

  settings: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss">
.block-subscribe-form .checkbox-label a {
  @apply text-[--link-color] hover:text-[--link-hover-color];
}
</style>
