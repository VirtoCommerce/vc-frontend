<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("news.title") }}
    </VcTypography>

    <NewsArticlePreview v-for="item in newsArticles" :key="item.id" :news-article="item" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

const newsArticles = ref<NewsArticleContent[]>([]);

const fetchNewsArticles = async () => {
  const response = await getNewsArticles({});
  newsArticles.value = response.items ?? [];
};

watchEffect(fetchNewsArticles);
</script>

<style lang="scss"></style>
