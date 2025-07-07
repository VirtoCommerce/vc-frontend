<template>
  <div class="news-articles">
    <VcEmptyPage v-if="!loading && !newsArticles?.length" :title="$t('news.title-empty')"></VcEmptyPage>
    <VcContainer v-else>
      <div v-if="loading" class="news-articles__grid">
        <VcWidgetSkeleton v-for="i in 8" :key="i" head size="lg"></VcWidgetSkeleton>
      </div>
      <div v-if="!loading && newsArticles?.length" class="news-articles__grid">
        <NewsArticlePreview v-for="item in newsArticles" :key="item.id" :news-article="item" />
      </div>
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

const loading = ref(false);
const newsArticles = ref<NewsArticleContent[]>([]);

const fetchNewsArticles = async () => {
  loading.value = true;

  const response = await getNewsArticles({});
  newsArticles.value = response.items ?? [];

  loading.value = false;
};

watchEffect(fetchNewsArticles);
</script>

<style lang="scss">
.news-articles {
  &__grid {
    @apply grid;

    @media (min-width: theme("screens.xs")) {
      @apply grid-cols-1 gap-2;
    }

    @media (min-width: theme("screens.sm")) {
      @apply grid-cols-2;
    }

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-3 gap-3;
    }

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-4 gap-4;
    }
  }
}
</style>
