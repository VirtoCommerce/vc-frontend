<template>
  <div class="text-block pb-16 pt-6" :class="background">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component v-if="title?.trim()" :is="headingTag" class="mb-3 text-2xl">{{ title }}</component>

      <!-- eslint-disable-next-line vue/no-v-html -- the value is sanitized -->
      <div v-html="contentValue" class="block-content text-lg"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { sanitizeSectionHtml, toHeadingTag } from "../sections";

export interface IProps {
  heading: string;
  title?: string;
  background?: string;
  text: string | { html: string };
}

const props = defineProps<IProps>();

const headingTag = computed(() => toHeadingTag(props.heading));

const contentValue = computed(() => {
  return sanitizeSectionHtml(typeof props.text === "object" ? props.text?.html : props.text);
});
</script>

<style lang="scss">
.text-block {
  .block-content {
    p {
      margin-bottom: 1.5rem;
    }

    ul {
      list-style: disc inside;
      margin-bottom: 1.5rem;
    }

    a {
      font-weight: bold;
    }
  }

  &.bg-neutral-800 {
    color: white;
  }
}
</style>
