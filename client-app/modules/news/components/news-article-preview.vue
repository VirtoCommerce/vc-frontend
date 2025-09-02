<template>
  <VcWidget class="news-article-preview">
    <template #default-container>
      <VcMarkdownRender
        :src="newsArticle.listPreview ?? ''"
        :class="isImage(newsArticle.listPreview) ? 'news-article-preview__preview-image' : 'news-article-preview__preview'"
        @click="emit('article:click', newsArticle)"
      />

      <div
        v-if="newsArticle.publishDate"
        class="news-article-preview__publish-date"
      >
        {{ $d(newsArticle.publishDate, "short") }}
      </div>

      <div
        class="news-article-preview__title"
        @click="emit('article:click', newsArticle)"
      >
        {{ newsArticle.listTitle }}
      </div>

      <div class="news-article-preview__tags">
        <template
          v-for="tag in newsArticle.tags"
          :key="tag"
        >
          <VcChip
            color="secondary"
            variant="outline-dark"
            class="news-article-preview__tag"
            clickable
            @click="emit('tag:click', tag)"
          >
            {{ tag }}
          </VcChip>
        </template>
      </div>
    </template>
  </VcWidget>
</template>

<script
  lang="ts"
  setup
>
import { toRef } from "vue";
import { VcWidget } from "@/ui-kit/components";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import { isImage } from "../utilities";
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
  &__preview {
    @apply m-3 text-start text-lg cursor-pointer;
  }

  &__preview-image {
    @apply text-center;
  }

  &__preview-image img {
    @apply inline;
  }

  &__title {
    @apply m-3 text-start font-bold text-[--link-color] hover:text-[--link-hover-color] cursor-pointer;
  }

  &__publish-date {
    @apply m-3 text-start text-sm text-neutral;
  }

  &__tags {
    @apply m-3 mt-5;
  }

  &__tag {
    @apply me-2 mb-1;
  }
}
</style>
