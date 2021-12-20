<template>
  <div v-html="markdown"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";

const props = defineProps<{ src: string }>();

const markdown = computed(() => marked(props.src, { sanitize: true }));
</script>

<style lang="scss" scoped></style>
