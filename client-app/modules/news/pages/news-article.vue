<template>
  <div>
    <VcEmptyPage v-if="!newsArticle" :title="$t('news.title-not-found')"> </VcEmptyPage>
    <VcContainer v-else>
      <router-link :to="{ name: 'NewsArticles' }" class="text-[--link-color] hover:text-[--link-hover-color]">
        {{ $t("news.links.to-list") }}
      </router-link>
      <NewsArticle :news-article="newsArticle" />
    </VcContainer>
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
