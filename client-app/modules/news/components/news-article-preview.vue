<template>
  <VcWidget :title="newsArticle.title">
    <template #title>
      <router-link :to="articleRoute">
        <div class="text-left">{{ newsArticle.title }}</div>
      </router-link>
      <div v-if="newsArticle.publishDate" class="mt-3 text-right text-sm text-neutral">
        {{ $d(newsArticle.publishDate) }}
      </div>
    </template>
    <router-link :to="articleRoute">
      <VcMarkdownRender :src="newsArticle.contentPreview ?? ''" class="text-lg" />
    </router-link>
  </VcWidget>
</template>

<script lang="ts" setup>
import { computed, toRef } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { VcWidget } from "@/ui-kit/components";
import { VcMarkdownRender } from "@/ui-kit/components/atoms";
import { MODULE_ID, USE_ROOT_LINKS } from "../constants";
import type { NewsArticleContent } from "../api/graphql/types";

interface IProps {
  newsArticle: NewsArticleContent;
}
const props = defineProps<IProps>();

const { getSettingValue } = useModuleSettings(MODULE_ID);
const useRootLink = getSettingValue(USE_ROOT_LINKS);

const articleRoute = computed(() => {
  console.warn("useRootLink", useRootLink);
  if (newsArticle.value?.seoInfo?.semanticUrl && newsArticle.value?.seoInfo?.semanticUrl != newsArticle.value?.id) {
    return {
      path: useRootLink
        ? `/${newsArticle.value?.seoInfo?.semanticUrl}`
        : `/news/${newsArticle.value?.seoInfo?.semanticUrl}`,
    };
  }

  return {
    name: "NewsArticle",
    params: { articleId: newsArticle.value?.id },
  };
});

const newsArticle = toRef(props, "newsArticle");
</script>
