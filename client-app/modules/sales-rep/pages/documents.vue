<template>
  <div class="documents-page">
    <VcTypography class="documents-page__title" tag="h1">
      {{ t("sales_rep.documents.title") }}
    </VcTypography>

    <p class="documents-page__subtitle">{{ t("sales_rep.documents.page.subtitle") }}</p>

    <div class="documents-page__results">
      <section v-if="selectedId || featuredDocument" ref="featuredPanel" class="documents-page__featured">
        <template v-if="featuredDocument">
          <span class="documents-page__featured-preview">
            <!-- Only previewUrl may back an <img>; the download endpoint (`url`) needs auth headers a plain image request can't send. -->
            <VcImage
              v-if="featuredDocument.previewUrl"
              :src="featuredDocument.previewUrl"
              :alt="featuredDocument.displayName"
              class="documents-page__featured-img"
              lazy
            />

            <VcImage
              v-else
              :src="documentIcon(featuredDocument.contentType)"
              alt=""
              class="documents-page__featured-icon"
            />
          </span>

          <div class="documents-page__featured-content">
            <VcBadge
              v-if="featuredDocument.isPinned"
              color="warning"
              variant="soft"
              class="documents-page__featured-badge"
            >
              {{ t("sales_rep.documents.details.latest_publication") }}
            </VcBadge>

            <VcTypography tag="h2" variant="h3" class="documents-page__featured-name">
              {{ featuredDocument.displayName }}
            </VcTypography>

            <p v-if="featuredDocument.summary" class="documents-page__summary">
              {{ featuredDocument.summary }}
            </p>

            <ul class="documents-page__meta">
              <li v-if="featuredTypeLabel" class="documents-page__meta-item">
                <VcIcon name="file-text" size="xs" />

                {{ featuredTypeLabel }}
              </li>

              <li v-if="featuredDocument.pageCount" class="documents-page__meta-item">
                <VcIcon name="files" size="xs" />

                {{
                  t(
                    "sales_rep.documents.details.pages_count",
                    { count: formatStatCount(featuredDocument.pageCount) },
                    featuredDocument.pageCount,
                  )
                }}
              </li>

              <li class="documents-page__meta-item">
                <VcIcon name="hard-drive" size="xs" />

                {{ formatSize(featuredDocument.size) }}
              </li>

              <li class="documents-page__meta-item">
                <VcIcon name="calendar" size="xs" />

                {{ t("sales_rep.documents.published", { date: $d(featuredDocument.createdDate, "short") }) }}
              </li>
            </ul>

            <div class="documents-page__actions">
              <!-- Not a plain anchor: `url` carries no bearer token, so open via the authenticated fetch → blob URL (see files.ts). -->
              <VcButton
                v-if="isInlineRenderable(featuredDocument.contentType)"
                prepend-icon="eye"
                @click="openAuthorizedFile(featuredDocument.url, featuredDocument.contentType, featuredDocument.name)"
              >
                {{ t("sales_rep.documents.details.open") }}
              </VcButton>

              <VcButton
                variant="outline"
                prepend-icon="download"
                @click="downloadFile(featuredDocument.url, featuredDocument.name)"
              >
                {{ t("sales_rep.documents.details.download") }}
              </VcButton>
            </div>
          </div>
        </template>

        <div v-else-if="!detailsLoading" class="documents-page__details-empty">
          {{ t("sales_rep.documents.details.not_found") }}
        </div>

        <div v-else class="documents-page__featured-skeleton" aria-hidden="true" />

        <VcButton
          v-if="selectedId"
          class="documents-page__featured-close"
          :aria-label="t('sales_rep.documents.details.close')"
          icon="x"
          icon-size="1rem"
          size="xs"
          color="neutral"
          variant="ghost"
          @click="clearSelection"
        />
      </section>

      <div v-if="categoryRules.length" class="documents-page__controls">
        <SalesRepRuleChips
          v-model="category"
          :rules="categoryRules"
          :loading="categoriesLoading"
          :all-label="t('sales_rep.documents.page.all_tab')"
          :all-count="allCount"
        />
      </div>

      <div class="documents-page__search">
        <VcInput
          v-model="localKeyword"
          maxlength="64"
          class="documents-page__search-input"
          :disabled="loading"
          :placeholder="t('sales_rep.documents.page.search_placeholder')"
          clearable
          @keydown.enter="applyKeyword"
          @clear="resetKeyword"
        >
          <template #append>
            <VcButton
              :aria-label="t('sales_rep.documents.page.search_aria')"
              :disabled="loading"
              icon="search"
              icon-size="1.25rem"
              @click="applyKeyword"
            />
          </template>
        </VcInput>
      </div>

      <!-- A failure gets its own view so it doesn't read as the empty "no documents" state. -->
      <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.documents.page.load_failed')" variant="error" />

      <VcEmptyView
        v-else-if="!documents.length && !loading"
        :text="keyword || category ? t('sales_rep.documents.page.no_results') : t('sales_rep.documents.page.empty')"
        :variant="keyword || category ? 'search' : 'empty'"
        icon="file-text"
      >
        <template v-if="keyword" #button>
          <VcButton prepend-icon="reset" @click="resetKeyword">
            {{ t("sales_rep.documents.page.reset_search") }}
          </VcButton>
        </template>
      </VcEmptyView>

      <template v-else>
        <div v-if="loading && !documents.length" class="documents-page__grid" aria-hidden="true">
          <div v-for="index in DOCUMENTS_PAGE_SIZE" :key="index" class="documents-page__skeleton" />
        </div>

        <div v-else class="documents-page__grid">
          <!-- Not one big <button>: the overlay actions are buttons themselves, and buttons must not nest. -->
          <div
            v-for="document in documents"
            :key="document.id"
            :class="['document-card', { 'document-card--active': document.id === selectedId }]"
          >
            <button
              type="button"
              class="document-card__select"
              :aria-pressed="document.id === selectedId"
              @click="selectDocument(document)"
            >
              <span class="document-card__preview">
                <!-- Only previewUrl may back an <img>; the download endpoint (`url`) needs auth headers a plain image request can't send. -->
                <VcImage
                  v-if="document.previewUrl"
                  :src="document.previewUrl"
                  :alt="document.displayName"
                  class="document-card__preview-img"
                  lazy
                />

                <VcImage v-else :src="documentIcon(document.contentType)" alt="" class="document-card__preview-icon" />

                <span class="document-card__badge">{{ documentTypeLabel(document.name, document.contentType) }}</span>
              </span>

              <span class="document-card__name" :title="document.displayName">{{ document.displayName }}</span>

              <span v-if="document.category" class="document-card__category">{{ document.category }}</span>

              <span class="document-card__meta">{{ documentMeta(document, t, d) }}</span>
            </button>

            <span class="document-card__overlay">
              <VcButton
                v-if="isInlineRenderable(document.contentType)"
                class="document-card__action"
                size="xs"
                color="secondary"
                prepend-icon="eye"
                @click.stop="openAuthorizedFile(document.url, document.contentType, document.name)"
              >
                {{ t("sales_rep.documents.details.open") }}
              </VcButton>

              <VcButton
                class="document-card__action"
                size="xs"
                color="secondary"
                variant="outline"
                prepend-icon="download"
                @click.stop="downloadFile(document.url, document.name)"
              >
                {{ t("sales_rep.documents.details.download") }}
              </VcButton>
            </span>
          </div>
        </div>

        <VcPagination
          v-if="pages > 1"
          v-model:page="page"
          class="documents-page__pagination"
          :pages="pages"
          @update:page="onPageChanged"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { downloadFile } from "@/shared/files";
import { getFileSize } from "@/ui-kit/utilities";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import { useSalesRepDocument } from "../composables/useSalesRepDocument";
import { useSalesRepDocuments } from "../composables/useSalesRepDocuments";
import { DOCUMENTS_PAGE_SIZE } from "../constants";
import { isInlineRenderable, openAuthorizedFile } from "../files";
import { documentIcon, documentMeta, documentTypeLabel, formatStatCount } from "../utils";
import type { SalesRepDocumentType, SalesRepRuleType } from "../types";

const { t, d, n } = useI18n();

const {
  loading,
  error,
  keyword,
  category,
  page,
  pages,
  items: documents,
  totalCount,
  categories,
  categoriesLoading,
} = useSalesRepDocuments({ withCategories: true, sort: "isPinned:desc;createdDate:desc" });

const failed = computed(() => Boolean(error.value));

const categoryRules = computed<SalesRepRuleType[]>(() =>
  categories.value.map((entry) => ({ name: entry.name, label: entry.name, count: entry.count })),
);

// Captured while no category is selected, so switching to a category tab keeps the library total.
const allCount = ref(0);
watchEffect(() => {
  if (!category.value) {
    allCount.value = totalCount.value;
  }
});

const localKeyword = ref("");

// flush: "sync" resets the page before the variables watcher runs, so a tab change fires one request, not two.
watch(
  category,
  () => {
    page.value = 1;
  },
  { flush: "sync" },
);

function applyKeyword(): void {
  keyword.value = localKeyword.value.trim();
  // Search is library-wide: drop any active category.
  category.value = undefined;
  page.value = 1;
}

function resetKeyword(): void {
  localKeyword.value = "";
  keyword.value = "";
  page.value = 1;
}

function onPageChanged(): void {
  window.scroll({ top: 0, behavior: "smooth" });
}

const selectedId = useRouteQueryParam<string>("doc", { defaultValue: "" });

const selectedFromPage = computed(() => documents.value.find((document) => document.id === selectedId.value));

// The by-id query covers a deep-linked document sitting on another page or behind another filter.
const { document: fetchedDocument, loading: detailsLoading } = useSalesRepDocument(
  () => selectedId.value || undefined,
  { enabled: () => !selectedFromPage.value },
);

const selectedDocument = computed<SalesRepDocumentType | undefined>(
  () => selectedFromPage.value ?? fetchedDocument.value,
);

// Default featured = documents[0] of the pinned-first list. Captured only from the unfiltered first page.
const defaultFeaturedDocument = ref<SalesRepDocumentType>();

watchEffect(() => {
  if (!keyword.value && !category.value && page.value === 1 && documents.value.length) {
    defaultFeaturedDocument.value = documents.value[0];
  }
});

const featuredDocument = computed<SalesRepDocumentType | undefined>(() =>
  selectedId.value ? selectedDocument.value : defaultFeaturedDocument.value,
);

const featuredTypeLabel = computed(() =>
  featuredDocument.value ? documentTypeLabel(featuredDocument.value.name, featuredDocument.value.contentType) : "",
);

const featuredPanel = ref<HTMLElement>();

watch(selectedId, async (id) => {
  if (!id) {
    return;
  }
  await nextTick();
  featuredPanel.value?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
});

function selectDocument(document: SalesRepDocumentType): void {
  selectedId.value = document.id;
}

function clearSelection(): void {
  selectedId.value = "";
}

function formatSize(bytes: number): string {
  const size = getFileSize(bytes);
  return n(size.value, { notation: "compact", style: "unit", unit: size.unit, unitDisplay: "short" });
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.documents-page {
  &__title {
    @apply [word-break:break-word];
  }

  &__subtitle {
    @apply -mt-2 mb-2 text-sm text-neutral-600;
  }

  &__results {
    @apply flex flex-col gap-4;
  }

  &__search {
    @apply flex items-center gap-4;
  }

  &__search-input {
    @apply w-full flex-1;
  }

  &__controls {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  // auto-fill responsive grid capped at 5 per row (column floor = 1/5 of the row minus the 4 gutters).
  &__grid {
    @apply grid min-w-0 gap-4;

    grid-template-columns: repeat(auto-fill, minmax(max(10rem, calc((100% - 4rem) / 5)), 1fr));
  }

  &__skeleton {
    @apply h-52 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__featured {
    @apply relative flex flex-col gap-4 rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-4 md:flex-row md:gap-6 md:p-5;
  }

  &__featured-preview {
    @apply flex min-h-40 items-center justify-center overflow-hidden rounded bg-neutral-50 md:w-1/3 md:shrink-0;
  }

  &__featured-img {
    @apply max-h-64 w-full object-contain;
  }

  &__featured-icon {
    @apply size-20;
  }

  &__featured-content {
    @apply flex min-w-0 flex-1 flex-col items-start gap-3;
  }

  &__featured-badge {
    @apply self-start;
  }

  &__featured-name {
    @apply [word-break:break-word];
  }

  &__featured-close {
    @apply absolute right-2 top-2;
  }

  &__featured-skeleton {
    @apply h-40 w-full animate-pulse rounded bg-neutral-100;
  }

  &__details-empty {
    @apply text-sm text-neutral-500;
  }

  &__meta {
    @apply m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-sm text-neutral-500;
  }

  &__meta-item {
    @apply inline-flex items-center gap-1.5;
  }

  &__summary {
    @apply m-0 text-sm [word-break:break-word];
  }

  &__actions {
    @apply flex flex-wrap gap-2;
  }

  &__pagination {
    @apply self-start;
  }
}

.document-card {
  @apply relative flex rounded-[--vc-radius] border border-neutral-200 bg-additional-50 transition-shadow;

  &:hover {
    @apply shadow-md;
  }

  &--active {
    @apply border-primary-500 ring-2 ring-primary-100;
  }

  &__select {
    @apply flex w-full min-w-0 flex-col gap-2 p-3 text-left;
  }

  // Hidden = transparent and click-through, so the invisible buttons never swallow a card-select click.
  &__overlay {
    @apply pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 rounded-[--vc-radius] bg-additional-50/80 opacity-0 transition-opacity;
  }

  &:hover .document-card__overlay,
  &:focus-within .document-card__overlay {
    @apply opacity-100;
  }

  &:hover .document-card__action,
  &:focus-within .document-card__action {
    @apply pointer-events-auto;
  }

  &__action {
    @apply w-28;
  }

  &__preview {
    @apply relative flex h-32 items-center justify-center overflow-hidden rounded bg-neutral-50;
  }

  &__preview-img {
    @apply size-full object-cover;
  }

  &__preview-icon {
    @apply size-14;
  }

  &__badge {
    @apply absolute left-2 top-2 rounded bg-neutral-900/70 px-1.5 py-0.5 text-xs font-semibold uppercase text-additional-50;
  }

  &__name {
    @apply line-clamp-2 text-sm font-medium [word-break:break-word];
  }

  &__category {
    @apply text-xs text-neutral-500;
  }

  &__meta {
    @apply mt-0.5 text-xs text-neutral-400;
  }
}
</style>
