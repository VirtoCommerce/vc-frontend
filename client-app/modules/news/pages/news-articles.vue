<template>
  <VcEmptyPage v-if="!loading && !newsArticles?.length" :title="$t('news.title-empty')"></VcEmptyPage>
  <VcContainer v-else>
    <div v-if="loading" class="grid grid-cols-2 gap-4">
      <VcWidgetSkeleton v-for="i in 3" :key="i" head size="lg"></VcWidgetSkeleton>
    </div>
    <div v-if="!loading && newsArticles?.length" class="grid grid-cols-2 gap-4">
      <NewsArticlePreview v-for="item in newsArticles" :key="item.id" :news-article="item" />
    </div>
  </VcContainer>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

const loading = ref<boolean>(false);
const newsArticles = ref<NewsArticleContent[]>([]);

const fetchNewsArticles = async () => {
  loading.value = true;
  const response = await getNewsArticles({});
  newsArticles.value = response.items ?? [];
  loading.value = false;
};

watchEffect(fetchNewsArticles);
</script>

<style lang="scss"></style>
