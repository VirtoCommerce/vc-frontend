<template>
  <VcWidget :title="newsArticle.title" class="news-article-preview">
    <template #title>
      <router-link :to="articleRoute">
        <div class="news-article-preview__title">{{ newsArticle.title }}</div>
      </router-link>

      <div v-if="newsArticle.publishDate" class="news-article-preview__publish-date">
        {{ $d(newsArticle.publishDate) }}
      </div>
    </template>

    <router-link :to="articleRoute">
      <VcMarkdownRender :src="newsArticle.contentPreview ?? ''" class="news-article-preview__preview" />
    </router-link>

    <div class="news-article-preview__tags">
      <template v-for="tag in newsArticle.tags" :key="tag">
        <VcChip color="secondary" variant="outline-dark" class="news-articles-preview__tags-tag">
          {{ tag }}
        </VcChip>
      </template>
    </div>
  </VcWidget>
</template>

<script lang="ts" setup>
import { computed, toRef } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { VcWidget } from "@/ui-kit/components";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import { MODULE_ID, USE_NEWS_PREFIX_IN_LINKS } from "../constants";
import { ROUTES } from "../routes/constants";
import type { NewsArticleContent } from "../api/graphql/types";

interface IProps {
  newsArticle: NewsArticleContent;
}
const props = defineProps<IProps>();

const { getSettingValue } = useModuleSettings(MODULE_ID);
const useNewsPrefixInLinks = getSettingValue(USE_NEWS_PREFIX_IN_LINKS);

const articleRoute = computed(() => {
  if (newsArticle.value?.seoInfo?.semanticUrl && newsArticle.value?.seoInfo?.semanticUrl != newsArticle.value?.id) {
    return {
      path: useNewsPrefixInLinks
        ? `/${ROUTES.LINK_SEGMENT}/${newsArticle.value?.seoInfo?.semanticUrl}`
        : `/${newsArticle.value?.seoInfo?.semanticUrl}`,
    };
  }

  return {
    name: ROUTES.ARTICLE.NAME,
    params: { articleId: newsArticle.value?.id },
  };
});

const newsArticle = toRef(props, "newsArticle");
</script>

<style lang="scss">
.news-article-preview {
  &__title {
    @apply text-left;
  }

  &__publish-date {
    @apply mt-3 text-right text-sm text-neutral;
  }

  &__preview {
    @apply text-lg;
  }

  &__tags {
    @apply mt-5;
  }

  &__tags-tag {
    @apply mr-2;
  }
}
</style>
