<template>
  <div class="news-article-content">
    <div class="news-article-content__title">{{ newsArticle.title }}</div>
    <div class="news-article-content__tags">
      <template
        v-for="tag in newsArticle.tags"
        :key="tag"
      >
        <VcChip
          color="secondary"
          variant="outline-dark"
          class="news-article-content__tags-tag"
          clickable
          @click="emit('tag:click', tag)"
        >
          {{ tag }}
        </VcChip>
      </template>
    </div>

    <div
      v-if="newsArticle.contentPreview"
      class="news-article-content__preview"
    >
      <VcMarkdownRender :src="newsArticle.contentPreview" />
    </div>
    <div
      v-if="newsArticle.author || newsArticle.publishDate"
      class="news-article-content__citation"
    >
      <div
        v-if="newsArticle.author"
        class="news-article-content__citation-author"
      >
        <VcImage
          v-if="newsArticle.author.iconUrl"
          :src="newsArticle.author.iconUrl"
          lazy
          class="news-article-content__citation-author-image"
        />

        <span>
          <span>
            {{ $t("news.details.written-by") }}
          </span>

          <span
            class="news-article-content__citation-author-name"
            @click="emit('author:click', newsArticle.author.id)"
          >{{
            newsArticle.author.name }}
          </span>
        </span>
      </div>

      <div></div>

      <div
        v-if="newsArticle.publishDate"
        class="news-article-content__citation-publish-date"
      >
        {{ $t("news.details.last-updated") }} {{ $d(newsArticle.publishDate, "short") }}
      </div>
    </div>

    <VcMarkdownRender
      :src="newsArticle.content ?? ''"
      class="news-article-content__content"
    />
  </div>
</template>

<script
  lang="ts"
  setup
>
import { toRef } from "vue";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import type { NewsArticleContent } from "../api/graphql/types";

interface IEmits {
  (event: "tag:click", tag: string): void;
  (event: "author:click", id: string): void;
}

interface IProps {
  newsArticle: NewsArticleContent;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();
const newsArticle = toRef(props, "newsArticle");
</script>

<style lang="scss">
.news-article-content {
  &__title {
    @apply text-lg font-bold;
  }

  &__preview {
    @apply text-center;
  }

  &__tags {
    @apply mt-5 mb-10;
  }

  &__tags-tag {
    @apply mr-2 mb-1;
  }

  &__citation {
    @apply m-5 flex items-center justify-between;
  }

  &__citation-author {
    @apply flex items-center;
  }

  &__citation-author-name {
    @apply font-bold text-[--link-color] hover:text-[--link-hover-color] cursor-pointer;
  }

  &__citation-author-image {
    @apply mr-4 h-12 rounded-full;
  }

  &__citation-publish-date {
    @apply mt-3 text-right text-sm text-neutral;
  }

  &__content {
    @apply text-lg ml-5 mr-5;
  }
}
</style>
