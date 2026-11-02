<template>
  <div class="block-subscribe-form py-10 lg:py-24" :class="background">
    <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
      <div class="title mb-4 text-center text-2xl font-bold lg:text-4xl">{{ title }}</div>

      <div class="subtitle mb-8 text-center text-lg font-bold">{{ subtitle }}</div>

      <VcInput class="mx-auto max-w-lg" :placeholder="placeholder" />

      <div class="text-center">
        <div class="checkbox-text mt-4">
          <VcCheckbox class="inline-flex">
            <!-- eslint-disable-next-line vue/no-v-html -- sanitized by sanitizeSectionHtml -->
            <span v-html="checkboxHtml" class="checkbox-label"></span>
          </VcCheckbox>
        </div>

        <VcButton class="mt-10">
          {{ buttonText }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { sanitizeSectionHtml } from "../sections";

export interface IProps {
  background?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  checkboxText?: string;
  buttonText?: string;
}

const props = defineProps<IProps>();

const checkboxHtml = computed(() => sanitizeSectionHtml(props.checkboxText));
</script>

<style lang="scss">
.block-subscribe-form {
  .checkbox-label a {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }

  &.bg-neutral-800 {
    .title,
    .subtitle,
    .checkbox-text {
      color: white;
    }
  }
}
</style>
