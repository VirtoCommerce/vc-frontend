<template>
  <div :class="$attrs.class" v-html="markdown"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps({
  /**
   * Markdown source.
   */
  src: {
    type: String,
    default: "",
  },
});

const markdown = computed(() => DOMPurify.sanitize(marked(props.src), { USE_PROFILES: { html: true } }));
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
