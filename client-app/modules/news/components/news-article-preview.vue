<template>
  <VcWidget :title="newsArticle.title">
    <template #title>
      <router-link :to="{ name: 'NewsArticle', params: { articleId: newsArticle.id } }">
        <div class="text-left">{{ newsArticle.title }}</div>
      </router-link>
      <div v-if="newsArticle.publishDate" class="mt-3 text-right text-sm text-neutral">
        {{ $d(newsArticle.publishDate) }}
      </div>
    </template>
    <router-link :to="{ name: 'NewsArticle', params: { articleId: newsArticle.id } }">
      <VcMarkdownRender :src="newsArticle.contentPreview ?? ''" class="text-lg" />
    </router-link>
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
