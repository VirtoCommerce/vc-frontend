<template>
  <div>
    <Error404 v-if="!loading && !newsArticle"></Error404>
    <VcContainer v-else>
      <router-link :to="{ name: ROUTES.ARTICLES.NAME }" class="text-[--link-color] hover:text-[--link-hover-color]">
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
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import { MODULE_ID, USE_ROOT_LINKS } from "../constants";
import { ROUTES } from "../routes/constants";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticle from "@/modules/news/components/news-article.vue";

const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

interface IProps {
  articleId: string;
}
const loading = ref(false);
const newsArticle = ref<NewsArticleContent>();

const { getSettingValue } = useModuleSettings(MODULE_ID);
const useRootLink = getSettingValue(USE_ROOT_LINKS);

const seoTitle = computed(() => newsArticle.value?.seoInfo?.pageTitle || newsArticle.value?.title);
const { title: pageTitle } = usePageTitle(seoTitle);

const seoDescription = computed(() => newsArticle.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => newsArticle.value?.seoInfo?.metaKeywords);

const seoUrl = computed(() =>
  newsArticle.value?.seoInfo?.semanticUrl
    ? useRootLink
      ? `${window.location.host}/${newsArticle.value?.seoInfo?.semanticUrl}`
      : `${window.location.host}/${ROUTES.LINK_SEGMENT}/${newsArticle.value?.seoInfo?.semanticUrl}`
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
