<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("news.title") }}
    </VcTypography>
    <router-link :to="{ name: 'NewsArticles' }"> back-link </router-link>

    <div v-if="newsArticle">
      <div>
        {{ newsArticle.title }}
      </div>
      <div>
        {{ newsArticle.content }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import type { NewsArticleContent } from "../api/graphql/types";

const props = defineProps<IProps>();
interface IProps {
  articleId: string;
}

const newsArticle = ref<NewsArticleContent>();

const fetchNewsArticle = async () => {
  const response = await getNewsArticle({ id: props.articleId, languageCode: "en-US", storeId: "B2B-store" });
  newsArticle.value = response;
};

watchEffect(fetchNewsArticle);
</script>

<style lang="scss"></style>
