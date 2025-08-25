<template>
  <div class="news-articles">
    <VcContainer>
      <VcTypography
        tag="h1"
        class="news-articles__title"
      >
        {{ $t("news.list.title") }}
      </VcTypography>

      <PageToolbarBlock>
        <div class="news-articles__filter">
          <div class="news-articles__filter--tags">
            <template
              v-for="newsArticleTag in newsArticleTags"
              :key="newsArticleTag"
            >
              <VcChip
                color="secondary"
                :variant="searchTag == newsArticleTag ? 'solid' : 'outline-dark'"
                class="news-articles__filter--tags-tag"
                clickable
                @click="toggleTag(newsArticleTag)"
              >
                {{ newsArticleTag }}
              </VcChip>
            </template>

            <VcChip
              v-if="authorId"
              color="secondary"
              variant="solid"
              class="news-articles__filter--tags-tag"
              clickable
              @click="removeAuthorFilter()"
            >
              {{ $t("news.list.written-by") }} {{ newsArticleAuthorName }}
            </VcChip>
          </div>

          <VcInput
            v-model="searchKeyword"
            maxlength="64"
            clearable
            class="news-articles__filter--keyword"
            :disabled="loading"
            :placeholder="$t('news.list.search-placeholder')"
            @keydown.enter="applyKeyword"
            @clear="resetKeyword"
          >
            <template #append>
              <VcButton
                :disabled="loading"
                icon="search"
                icon-size="1.25rem"
                @click="applyKeyword"
              />
            </template>
          </VcInput>
        </div>
      </PageToolbarBlock>

      <VcEmptyView
        v-if="!loading && !newsArticles?.length"
        :text="$t('news.list.not-found')"
        icon="outline-document"
      />

      <div v-else>
        <div
          v-if="loading"
          class="news-articles__grid"
        >
          <VcWidgetSkeleton
            v-for="i in 8"
            :key="i"
            head
            size="lg"
          />
        </div>

        <div
          v-if="!loading && newsArticles?.length"
          class="news-articles__grid"
        >
          <NewsArticlePreview
            v-for="item in newsArticles"
            :key="item.id"
            :news-article="item"
            @article:click="openArticle($event)"
            @tag:click="applyTag($event)"
          />
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

<script
  lang="ts"
  setup
>
import { ref, toRef, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { getNewsArticleAuthor } from "../api/graphql/queries/newsArticleAuthor";
import { getNewsArticleTags } from "../api/graphql/queries/newsArticleTags";
import { getNewsArticles } from "../api/graphql/queries/newsArticles";
import { MODULE_ID, USE_NEWS_PREFIX_IN_LINKS, ARTICLES_PER_PAGE, ARTICLES_MAX_PAGES, ARTICLE_TAGS_MAX } from "../constants";
import { ROUTES } from "../routes/constants";
import type { NewsArticleContent } from "../api/graphql/types";
import NewsArticlePreview from "@/modules/news/components/news-article-preview.vue";

interface IProps {
  tag?: string;
  authorId?: string;
}

const props = defineProps<IProps>();
const tag = toRef(props, "tag");
const authorId = toRef(props, "authorId");

const newsArticlesLoading = ref(false);
const newsArticleOptionsLoading = ref(false);

const searchKeyword = ref("");
const searchAuthorId = ref(authorId.value);
const searchTag = ref(tag.value);
const searchPage = ref(1);
const searchPages = ref(1);
const newsArticles = ref<NewsArticleContent[]>([]);

const newsArticleTags = ref<string[]>([]);

const newsArticleAuthorName = ref<string>("");

const loading = computed(() => newsArticlesLoading.value || newsArticleOptionsLoading.value);

const router = useRouter();

async function applyKeyword() {
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function resetKeyword() {
  searchKeyword.value = "";
  searchPage.value = 1;
  await fetchNewsArticles();
}

async function applyTag(tagToApply: string) {
  searchTag.value = tagToApply;
  searchPage.value = 1;
  applyRoute();
  await fetchNewsArticles();
}

async function toggleTag(tagToToggle: string) {
  if (searchTag.value == tagToToggle) {
    searchTag.value = "";
  }
  else {
    searchTag.value = tagToToggle;
  }
  searchPage.value = 1;
  applyRoute();
  await fetchNewsArticles();
}

async function removeAuthorFilter() {
  searchAuthorId.value = "";
  searchPage.value = 1;
  applyRoute();
  await fetchNewsArticles();
}

function applyRoute() {
  if (searchAuthorId.value) {
    if (searchTag.value) {
      void router.replace({ name: ROUTES.ARTICLES_BY_AUTHOR.NAME, params: { authorId: searchAuthorId.value, tag: searchTag.value } });
    } else {
      void router.replace({ name: ROUTES.ARTICLES_BY_AUTHOR.NAME, params: { authorId: searchAuthorId.value } });
    }
  } else if (searchTag.value) {
    void router.replace({ name: ROUTES.ARTICLES_BY_TAG.NAME, params: { tag: searchTag.value } });
  }
  else {
    void router.replace({ name: ROUTES.ARTICLES.NAME });
  }
}
const { getSettingValue } = useModuleSettings(MODULE_ID);
const useNewsPrefixInLinks = getSettingValue(USE_NEWS_PREFIX_IN_LINKS);

function openArticle(newsArticle: NewsArticleContent) {
  if (newsArticle.seoInfo.semanticUrl && newsArticle.seoInfo.semanticUrl != newsArticle.id) {
    const path = useNewsPrefixInLinks
      ? `/${ROUTES.LINK_SEGMENT}/${newsArticle.seoInfo.semanticUrl}`
      : `/${newsArticle.seoInfo.semanticUrl}`
    router.push({ path: path });
  }
  else {
    router.push({
      name: ROUTES.ARTICLE.NAME,
      params: { articleId: newsArticle.id },
    });
  }
}

async function changeSearchPage(page: number) {
  searchPage.value = page;
  await fetchNewsArticles();
}

const fetchNewsArticleOptions = async () => {
  newsArticleOptionsLoading.value = true;

  const tagsResponse = await getNewsArticleTags();
  newsArticleTags.value = tagsResponse?.slice(0, ARTICLE_TAGS_MAX) ?? [];

  if (searchAuthorId.value) {
    const authorResponse = await getNewsArticleAuthor(searchAuthorId.value);
    newsArticleAuthorName.value = authorResponse?.name ?? "";
  }

  newsArticleOptionsLoading.value = false;
}

const fetchNewsArticles = async () => {
  newsArticlesLoading.value = true;

  const query = {
    keyword: searchKeyword.value,

    authorId: searchAuthorId.value,
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
  fetchNewsArticleOptions();
});
</script>

<style lang="scss">
.news-articles {
  &__title {
    @apply mb-5;
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
    @apply mt-5 flex justify-center;
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
