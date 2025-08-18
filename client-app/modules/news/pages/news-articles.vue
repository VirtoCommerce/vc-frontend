<template>
  <div class="news-articles">
    <VcContainer>
      <VcTypography tag="h1" class="news-articles__title">
        {{ $t("news.title") }}
      </VcTypography>

      <PageToolbarBlock>
        <div class="news-articles__filter">
          <div class="news-articles__filter--tags">
            <template v-for="tag in newsArticleTags" :key="tag">
              <VcChip color="secondary" variant="outline-dark" class="news-articles__filter--tags-tag" clickable @click="applyTag(tag)">
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

      <VcEmptyView v-if="!loading && !newsArticles?.length" :text="$t('news.empty-list.title')" icon="outline-document">
        <template #button>
          <VcButton to="/">
            {{ $t("news.empty-list.button") }}
          </VcButton>
        </template>
      </VcEmptyView>

      <div v-else>
        <div v-if="loading" class="news-articles__grid">
          <VcWidgetSkeleton v-for="i in 8" :key="i" head size="lg" />
        </div>

        <div v-if="!loading && newsArticles?.length" class="news-articles__grid">
          <NewsArticlePreview v-for="item in newsArticles" :key="item.id" :news-article="item" />
        </div>
      </div>
    </VcContainer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import { ARTICLES_PER_PAGE } from "../constants";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

const newsArticlesLoading = ref(false);
const newsArticleTagsLoading = ref(false);

const searchKeyword = ref("");
const searchTag = ref("");
const searchPage = ref(1);
const newsArticles = ref<NewsArticleContent[]>([]);

const newsArticleTags = ref<string[]>([]);

const loading = computed(() => newsArticlesLoading.value || newsArticleTagsLoading.value);

async function applyKeyword() {
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function resetKeyword() {
  searchPage.value = 1;
  searchKeyword.value = "";
  await fetchNewsArticles();
}

async function applyTag(tag: string) {
  searchTag.value = tag;
  await fetchNewsArticles();
}

const fetchNewsArticleTags = () => {
  newsArticleTagsLoading.value = true;

  newsArticleTags.value.push('tag1');
  newsArticleTags.value.push('tag2');

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
    @apply mr-2;
  }

  &__filter--keyword {
    @apply w-full;
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

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-4 gap-4;
    }
  }
}
</style>
