<template>
  <div class="block-subscribe-form py-10 lg:py-24" :class="model.background">
    <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
      <div class="font-bold text-2xl lg:text-4xl mb-4 text-center">{{ model.title }}</div>
      <div class="font-bold text-lg mb-8 text-center">{{ model.subtitle }}</div>
      <VcInput class="max-w-lg mx-auto" :placeholder="model.placeholder" />
      <div class="text-center">
        <div class="mt-4">
          <VcCheckbox class="inline-flex">
            <span class="checkbox-label" v-html="model.checkboxText"></span>
          </VcCheckbox>
        </div>

        <VcButton class="uppercase px-12 mt-10">
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
  @apply text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)];
}
</style>
