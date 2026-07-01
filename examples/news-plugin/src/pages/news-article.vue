<template>
  <div class="news-article">
    <Error404 v-if="!loading && !newsArticle" />

    <VcContainer v-else>
      <VcBreadcrumbs class="news-article__breadcrumbs" :items="breadcrumbs" />

      <VcWidgetSkeleton v-if="loading" head size="lg" />

      <NewsArticle
        v-else-if="newsArticle"
        :news-article="newsArticle"
        @tag:click="applyTag($event)"
        @author:click="applyAuthor($event)"
      />
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { useSeoMeta } from "@unhead/vue";
import { usePageTitle, useBreadcrumbs, useModuleSettings, Error404 } from "@vc-frontend/core";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { getNewsArticle } from "../api/graphql/queries/newsArticle";
import NewsArticle from "../components/news-article-content.vue";
import { MODULE_ID, USE_NEWS_PREFIX_IN_LINKS } from "../constants";
import { ROUTES } from "../routes/constants";
import type { NewsArticleContent } from "../api/graphql/types";

const props = defineProps<IProps>();

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

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("news.details.breadcrumbs.news"), route: "/news" },
  { title: seoTitle.value ?? "" },
]);

const router = useRouter();

function applyTag(tagToApply: string) {
  void router.push({ name: ROUTES.ARTICLES_BY_TAG.NAME, params: { tag: tagToApply } });
}

function applyAuthor(authroIdToApply: string) {
  void router.push({ name: ROUTES.ARTICLES_BY_AUTHOR.NAME, params: { authorId: authroIdToApply } });
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

<style lang="scss">
.news-article {
  &__breadcrumbs {
    @apply mb-3;
  }
}
</style>
