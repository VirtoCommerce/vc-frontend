<template>
  <div class="mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10">
    <VcMarkdownRender v-if="markdownBody" :src="markdownBody" />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { computed } from "vue";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";

interface IProps {
  content: string | null;
}

const props = defineProps<IProps>();

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) {
    return { frontmatter: {}, body: content };
  }

  const endIndex = trimmed.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterBlock = trimmed.slice(4, endIndex);
  const body = trimmed.slice(endIndex + 4).trimStart();

  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key && value) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

const parsed = computed<{ frontmatter: Record<string, string>; body: string | null }>(() => {
  if (!props.content) {
    return { frontmatter: {}, body: null };
  }
  return parseFrontmatter(props.content);
});

const markdownBody = computed(() => parsed.value.body);
const frontmatter = computed<Record<string, string>>(() => parsed.value.frontmatter);
const frontmatterTitle = computed(() => frontmatter.value.title);

const { title: pageTitle } = usePageTitle(frontmatterTitle);

useSeoMeta({
  title: pageTitle,
  description: () => frontmatter.value.description,
});
</script>
