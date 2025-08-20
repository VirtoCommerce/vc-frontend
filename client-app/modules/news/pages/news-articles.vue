<template>
  <div class="news-articles">
    <VcContainer>
      <VcTypography tag="h1" class="news-articles__title">
        {{ $t("news.list.title") }}
      </VcTypography>

      <PageToolbarBlock>
        <div class="news-articles__filter">
          <div class="news-articles__filter--tags">
            <template v-for="tag in newsArticleTags" :key="tag">
              <VcChip
color="secondary" :variant="searchTag == tag ? 'solid' : 'outline-dark'" class="news-articles__filter--tags-tag" clickable
                @click="toggleTag(tag)">
                {{ tag }}
              </VcChip>
            </template>
          </div>

          <VcInput
            v-model="searchKeyword"
            maxlength="64"
            clearable
            class="news-articles__filter--keyword"
            :disabled="loading"
            :placeholder="$t('pages.account.orders.search_placeholder')"
            @keydown.enter="applyKeyword"
            @clear="resetKeyword">
            <template #append>
              <VcButton
                :disabled="loading"
                :aria-label="$t('commmon.buttons.search_orders')"
                icon="search"
                icon-size="1.25rem"
                @click="applyKeyword" />
            </template>
          </VcInput>
        </div>
      </PageToolbarBlock>

      <VcEmptyView v-if="!loading && !newsArticles?.length" :text="$t('news.list.not-found')" icon="outline-document" />

      <div v-else>
        <div v-if="loading" class="news-articles__grid">
          <VcWidgetSkeleton v-for="i in 8" :key="i" head size="lg" />
        </div>

        <div v-if="!loading && newsArticles?.length" class="news-articles__grid">
          <NewsArticlePreview v-for="item in newsArticles" :key="item.id" :news-article="item" @tag:click="applyTag($event)" />
        </div>
      </div>

      <VcPagination
          v-if="searchPages > 1"
          v-model:page="searchPage"
          class="news-articles__pagination"
          :pages="Math.min(searchPages, ARTICLES_MAX_PAGES)" 
          @update:page="changeSearchPage"
        />
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { getNewsArticleTags } from "../api/graphql/queries/newsArticleTag";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import { ARTICLES_PER_PAGE, ARTICLES_MAX_PAGES, ARTICLE_TAGS_MAX } from "../constants";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

const newsArticlesLoading = ref(false);
const newsArticleTagsLoading = ref(false);

const searchKeyword = ref("");
const searchTag = ref("");
const searchPage = ref(1);
const searchPages = ref(1);
const newsArticles = ref<NewsArticleContent[]>([]);

const newsArticleTags = ref<string[]>([]);

const loading = computed(() => newsArticlesLoading.value || newsArticleTagsLoading.value);

async function applyKeyword() {
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function resetKeyword() {
  searchKeyword.value = "";
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function applyTag(tag: string) {
  searchTag.value = tag;
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function toggleTag(tag: string) {
  if (searchTag.value == tag) {
    searchTag.value = "";
  }
  else {
    searchTag.value = tag;
  }
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function changeSearchPage(page: number) {
  searchPage.value = page; 
  await fetchNewsArticles();
}

const fetchNewsArticleTags = async () => {
  newsArticleTagsLoading.value = true;

  const response = await getNewsArticleTags();
  newsArticleTags.value = response?.slice(0, ARTICLE_TAGS_MAX) ?? [];

  newsArticleTagsLoading.value = false;
}

const fetchNewsArticles = async () => {
  newsArticlesLoading.value = true;

  const query = {
    keyword: searchKeyword.value,
    tags: [] as string[],

    first: ARTICLES_PER_PAGE,
    after: String((searchPage.value - 1) * ARTICLES_PER_PAGE),
  }
  if (searchTag.value) {
    query.tags.push(searchTag.value);
  }

  const response = await getNewsArticles(query);
  newsArticles.value = response.items ?? [];
  
  searchPages.value = Math.ceil((response?.totalCount ?? 0) / ARTICLES_PER_PAGE);

  newsArticlesLoading.value = false;
};

onMounted(async () => {
  await fetchNewsArticles();
  fetchNewsArticleTags();
});
</script>

<style lang="scss">
.news-articles {
  &__title {
    @apply mb-2;
  }

  &__filter {
    @apply mb-5;
  }

  &__filter--tags {
    @apply mb-5;
  }

  &__filter--tags-tag {
    @apply mr-2 mb-2;
  }

  &__filter--keyword {
    @apply w-full;
  }
  
  &__pagination { 
    @apply mt-5 flex justify-center ;
  }

  &__grid {
    @apply grid;

    @media (min-width: theme("screens.xs")) {
      @apply grid-cols-1 gap-2;
    }

    @media (min-width: theme("screens.sm")) {
      @apply grid-cols-2;
    }

    @media (min-width: theme("screens.md")) {
      @apply grid-cols-3 gap-3;
    }
  }
}
</style>
