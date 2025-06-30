<template>
  <VcWidget :title="newsArticle.title">
    <VcMarkdownRender :src="newsArticle.content ?? ''" />
    <template v-if="newsArticle.publishDate" #footer>
      <div class="text-right text-sm text-neutral">{{ $d(newsArticle.publishDate) }}</div>
    </template>
  </VcWidget>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import { VcWidget } from "@/ui-kit/components";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import type { NewsArticleContent } from "../api/graphql/types";

interface IProps {
  newsArticle: NewsArticleContent;
}
const props = defineProps<IProps>();
const newsArticle = toRef(props, "newsArticle");
</script>
