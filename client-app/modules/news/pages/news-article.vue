<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("news.title") }}
    </VcTypography>
    <router-link :to="{ name: 'NewsArticles' }"> back-link </router-link>

    <NewsArticle v-if="newsArticle" :news-article="newsArticle" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticle from "@/modules/news/components/news-article.vue";

interface IProps {
  articleId: string;
}
const props = defineProps<IProps>();

const newsArticle = ref<NewsArticleContent>();

const fetchNewsArticle = async () => {
  const response = await getNewsArticle({ id: props.articleId });
  newsArticle.value = response;
};

watchEffect(fetchNewsArticle);
</script>

<style lang="scss"></style>
