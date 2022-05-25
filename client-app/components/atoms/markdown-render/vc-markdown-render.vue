<template>
  <div v-html="markdown"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const markdown = computed(() => DOMPurify.sanitize(marked(props.src), { USE_PROFILES: { html: true } }));
</script>
