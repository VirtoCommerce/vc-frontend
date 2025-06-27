<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("news.title") }}
    </VcTypography>

    <div v-if="newsArticles.length">
      <div v-for="item in newsArticles" :key="item.id">
        <div>
          <router-link :to="{ name: 'NewsArticle', params: { articleId: item.id } }">
            {{ item.title }}
          </router-link>
        </div>
        <div>
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import type { NewsArticleContent } from "../api/graphql/types";

const newsArticles = ref<NewsArticleContent[]>([]);

const fetchNewsArticles = async () => {
  const response = await getNewsArticles({});
  newsArticles.value = response.items ?? [];
};

watchEffect(fetchNewsArticles);
</script>

<style lang="scss"></style>
