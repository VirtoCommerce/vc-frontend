<template>
  <div>
    <Error404 v-if="!loading && !newsArticle"></Error404>
    <VcContainer v-else>
      <router-link :to="{ name: 'NewsArticles' }" class="text-[--link-color] hover:text-[--link-hover-color]">
        {{ $t("news.links.to-list") }}
      </router-link>
      <VcWidgetSkeleton v-if="loading" head size="lg"></VcWidgetSkeleton>
      <NewsArticle v-if="!loading && newsArticle" :news-article="newsArticle" />
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { useSeoMeta } from "@unhead/vue";
import { computed, defineAsyncComponent, ref, watchEffect } from "vue";
import { usePageTitle } from "@/core/composables";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticle from "@/modules/news/components/news-article.vue";

const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

interface IProps {
  articleId: string;
}
const loading = ref<boolean>(false);
const newsArticle = ref<NewsArticleContent>();

const seoTitle = computed(() => newsArticle.value?.seoInfo?.pageTitle || newsArticle.value?.title);
const { title: pageTitle } = usePageTitle(seoTitle);

const seoDescription = computed(() => newsArticle.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => newsArticle.value?.seoInfo?.metaKeywords);

const seoUrl = computed(() =>
  newsArticle.value?.seoInfo?.semanticUrl
    ? `${window.location.host}/news/${newsArticle.value?.seoInfo?.semanticUrl}`
    : window.location.toString(),
);

const fetchNewsArticle = async () => {
  loading.value = true;

  const response = await getNewsArticle({ id: props.articleId });
  newsArticle.value = response;

  loading.value = false;
};

useSeoMeta({
  title: () => pageTitle.value,
  keywords: () => seoKeywords.value,
  description: () => seoDescription.value,
  ogUrl: () => seoUrl.value,
  ogTitle: () => pageTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: () => "website",
});

watchEffect(fetchNewsArticle);
</script>
