<template>
  <VcWidget class="news-article-preview">
    <VcMarkdownRender :src="newsArticle.contentPreview ?? ''" class="news-article-preview__preview" @click="emit('article:click', newsArticle)" />

    <div v-if="newsArticle.publishDate" class="news-article-preview__publish-date">
      {{ $d(newsArticle.publishDate, "short") }}
    </div>

    <div class="news-article-preview__title" @click="emit('article:click', newsArticle)">{{ newsArticle.title }}</div>

    <div class="news-article-preview__tags">
      <template v-for="tag in newsArticle.tags" :key="tag">
        <VcChip color="secondary" variant="outline-dark" class="news-article-preview__tags-tag" clickable @click="emit('tag:click', tag)">
          {{ tag }}
        </VcChip>
      </template>
    </div>
  </VcWidget>
</template>

<script lang="ts" setup>
import { toRef } from "vue";
import { VcWidget } from "@/ui-kit/components";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import type { NewsArticleContent } from "../api/graphql/types";

interface IEmits {
  (event: "tag:click", tag: string): void;
  (event: "article:click", newsArticle: NewsArticleContent): void;
}

interface IProps {
  newsArticle: NewsArticleContent;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();
const newsArticle = toRef(props, "newsArticle"); 
</script>

<style lang="scss">
.news-article-preview {
  --p-x: 0; 
  --slot-p-t: 0; 

  &__preview {
    @apply cursor-pointer;
  }

  &__title {
    @apply min-h-14 m-3 text-left font-bold text-[--link-color] hover:text-[--link-hover-color] cursor-pointer;
  }

  &__publish-date {
    @apply m-3 text-left text-sm text-neutral;
  }

  &__preview {
    @apply text-lg;
  }

  &__tags {
    @apply m-3 mt-5;
  }

  &__tags-tag {
    @apply mr-2 mb-1;
  }
} 
</style>
