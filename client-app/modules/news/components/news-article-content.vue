<template>
  <VcWidget :title="newsArticle.title" class="news-article-content">
    <VcMarkdownRender :src="newsArticle.content ?? ''" class="news-article-content__content" />

    <template v-if="newsArticle.publishDate" #footer>
      <div class="news-article-content__publish-date">{{ $d(newsArticle.publishDate) }}</div>
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

<style lang="scss">
.news-article-content {
  &__publish-date {
    @apply mt-3 text-right text-sm text-neutral;
  }

  &__content {
    @apply text-lg;
  }
}
</style>
