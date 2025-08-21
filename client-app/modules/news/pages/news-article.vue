<template>
  <div class="news-article">
    <Error404 v-if="!loading && !newsArticle" />

    <VcContainer v-else>
      <VcBreadcrumbs class="mb-3" :items="breadcrumbs" />

      <VcWidgetSkeleton v-if="loading" head size="lg" />

      <NewsArticle v-if="!loading && newsArticle" :news-article="newsArticle" @tag:click="applyTag($event)" />
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { useSeoMeta } from "@unhead/vue";
import { computed, defineAsyncComponent, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageTitle, useBreadcrumbs } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import { MODULE_ID, USE_NEWS_PREFIX_IN_LINKS } from "../constants";
import { ROUTES } from "../routes/constants";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticle from "@/modules/news/components/news-article-content.vue";

const props = defineProps<IProps>();

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

interface IProps {
  articleId: string;
}

const { t } = useI18n();

const loading = ref(false);
const newsArticle = ref<NewsArticleContent>();

const { getSettingValue } = useModuleSettings(MODULE_ID);
const useNewsPrefixInLinks = getSettingValue(USE_NEWS_PREFIX_IN_LINKS);

const seoTitle = computed(() => newsArticle.value?.seoInfo?.pageTitle || newsArticle.value?.title);
const { title: pageTitle } = usePageTitle(seoTitle);

const seoDescription = computed(() => newsArticle.value?.seoInfo?.metaDescription);
const seoKeywords = computed(() => newsArticle.value?.seoInfo?.metaKeywords);

const seoUrl = computed(() => {
  if (!newsArticle.value?.seoInfo?.semanticUrl) {
    return window.location.toString();
  }
  return useNewsPrefixInLinks
    ? `${window.location.host}/${ROUTES.LINK_SEGMENT}/${newsArticle.value?.seoInfo?.semanticUrl}`
    : `${window.location.host}/${newsArticle.value?.seoInfo?.semanticUrl}`;
});

const breadcrumbs = useBreadcrumbs(() => [{ title: t("news.details.breadcrumbs.news"), route: "/news" }, { title: newsArticle.value?.title ?? "" }]);

const router = useRouter();

function applyTag(tagToApply: string) {
  void router.push({ name: ROUTES.ARTICLES.NAME, params: { tag: tagToApply } });
}

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
