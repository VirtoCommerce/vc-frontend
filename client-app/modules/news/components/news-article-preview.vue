<template>
  <VcWidget :title="newsArticle.title">
    <router-link :to="{ name: 'NewsArticle', params: { articleId: newsArticle.id } }">
      <VcMarkdownRender :src="newsArticle.contentPreview ?? ''" class="text-lg" />
    </router-link>
    <template #title>
      <div class="text-left">{{ newsArticle.title }}</div>
      <div v-if="newsArticle.publishDate" class="text-right text-sm text-neutral">
        {{ $d(newsArticle.publishDate) }}
      </div>
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
