<template>
  <div class="documents-page">
    <VcTypography class="documents-page__title" tag="h1">
      {{ t("sales_rep.documents.page.title") }}
    </VcTypography>

    <div class="documents-page__results">
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

      <!-- Category tabs with counts ("All 10 | Catalogs 2 | …"); hidden until there is a category to pick. -->
      <div v-if="categoryRules.length" class="documents-page__controls">
        <SalesRepRuleChips
          v-model="category"
          :rules="categoryRules"
          :loading="categoriesLoading"
          :all-label="allTabLabel"
        />
      </div>

      <!-- A failure gets its own view: it must not land in the empty state, which would read as "no
           documents" or, with a keyword active, offer a Reset search that can't help (VCST-5586). -->
      <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.documents.page.load_failed')" variant="error" />

      <!-- Empty here means "nothing matches" (keyword/category active), not "no documents"; reset is keyword-only. -->
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
        <div class="documents-page__count">
          {{ t("sales_rep.documents.page.results_count", { count: formatStatCount(totalCount) }, totalCount) }}
        </div>

        <div class="documents-page__layout">
          <!-- First load: placeholder cards, so the grid keeps its footprint. -->
          <div v-if="loading && !documents.length" class="documents-page__grid" aria-hidden="true">
            <div v-for="index in DOCUMENTS_PAGE_SIZE" :key="index" class="documents-page__skeleton" />
          </div>

          <div v-else class="documents-page__grid">
            <button
              v-for="document in documents"
              :key="document.id"
              type="button"
              :class="['document-card', { 'document-card--active': document.id === selectedId }]"
              :aria-pressed="document.id === selectedId"
              @click="selectDocument(document)"
            >
              <span class="document-card__preview">
                <!-- Only previewUrl may back an <img>: the download endpoint (`url`) needs auth
                     headers a plain image request cannot send. No preview -> large file-type icon. -->
                <VcImage
                  v-if="document.previewUrl"
                  :src="document.previewUrl"
                  :alt="document.name"
                  class="document-card__preview-img"
                  lazy
                />

                <VcImage v-else :src="documentIcon(document.contentType)" alt="" class="document-card__preview-icon" />

                <span class="document-card__badge">{{ documentTypeLabel(document.name, document.contentType) }}</span>
              </span>

              <span class="document-card__name" :title="document.name">{{ document.name }}</span>

              <span v-if="document.category" class="document-card__category">{{ document.category }}</span>
            </button>
          </div>

          <!-- Inline details panel (no separate route); selection is deep-linked via ?doc=. -->
          <aside v-if="selectedId" class="documents-page__panel">
            <VcWidget size="sm" :title="selectedDocument?.name ?? t('sales_rep.documents.details.title')">
              <template #append>
                <VcButton
                  :aria-label="t('sales_rep.documents.details.close')"
                  icon="x"
                  icon-size="1rem"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click="clearSelection"
                />
              </template>

              <div v-if="selectedDocument" class="documents-page__details">
                <VcImage
                  v-if="selectedDocument.previewUrl"
                  :src="selectedDocument.previewUrl"
                  :alt="selectedDocument.name"
                  class="documents-page__details-preview"
                  lazy
                />

                <dl class="documents-page__meta">
                  <template v-if="selectedDocument.category">
                    <dt>{{ t("sales_rep.documents.details.category") }}</dt>

                    <dd>{{ selectedDocument.category }}</dd>
                  </template>

                  <dt>{{ t("sales_rep.documents.details.type") }}</dt>

                  <dd>{{ documentTypeLabel(selectedDocument.name, selectedDocument.contentType) }}</dd>

                  <dt>{{ t("sales_rep.documents.details.size") }}</dt>

                  <dd>{{ formatSize(selectedDocument.size) }}</dd>

                  <dt>{{ t("sales_rep.documents.details.created") }}</dt>

                  <dd>{{ $d(selectedDocument.createdDate) }}</dd>

                  <dt>{{ t("sales_rep.documents.details.updated") }}</dt>

                  <dd>{{ $d(selectedDocument.modifiedDate) }}</dd>

                  <template v-if="selectedDocument.pageCount">
                    <dt>{{ t("sales_rep.documents.details.pages") }}</dt>

                    <dd>{{ formatStatCount(selectedDocument.pageCount) }}</dd>
                  </template>
                </dl>

                <p v-if="selectedDocument.summary" class="documents-page__summary">
                  {{ selectedDocument.summary }}
                </p>

                <div class="documents-page__actions">
                  <!-- Not a plain anchor: a browser navigation to `url` carries no bearer token, so the
                       open goes through the authenticated fetch → blob object URL (see files.ts). -->
                  <VcButton
                    size="sm"
                    append-icon="external-link"
                    @click="openAuthorizedFile(selectedDocument.url, selectedDocument.contentType)"
                  >
                    {{ t("sales_rep.documents.details.open") }}
                  </VcButton>

                  <VcButton
                    size="sm"
                    variant="outline"
                    prepend-icon="download"
                    @click="downloadFile(selectedDocument.url, selectedDocument.name)"
                  >
                    {{ t("sales_rep.documents.details.download") }}
                  </VcButton>
                </div>
              </div>

              <!-- A deep-linked id that resolved to nothing (deleted, or not readable). -->
              <div v-else-if="!detailsLoading" class="documents-page__details-empty">
                {{ t("sales_rep.documents.details.not_found") }}
              </div>
            </VcWidget>
          </aside>
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
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouteQueryParam } from "@/core/composables/useRouteQueryParam";
import { downloadFile } from "@/shared/files";
import { getFileSize } from "@/ui-kit/utilities";
import SalesRepRuleChips from "../components/sales-rep-rule-chips.vue";
import { useSalesRepDocument } from "../composables/useSalesRepDocument";
import { useSalesRepDocuments } from "../composables/useSalesRepDocuments";
import { DOCUMENTS_PAGE_SIZE } from "../constants";
import { openAuthorizedFile } from "../files";
import { documentIcon, documentTypeLabel, formatStatCount } from "../utils";
import type { SalesRepDocumentType, SalesRepRuleType } from "../types";

const { t, n } = useI18n();

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
} = useSalesRepDocuments({ withCategories: true });

const failed = computed(() => Boolean(error.value));

// Category tabs reuse the shared rule chips: each category is a "rule" labeled "{name} {count}",
// and the synthetic baseline tab is "All {total}".
const categoryRules = computed<SalesRepRuleType[]>(() =>
  categories.value.map((entry) => ({ name: entry.name, label: `${entry.name} ${formatStatCount(entry.count)}` })),
);

const totalInLibrary = computed(() => categories.value.reduce((sum, entry) => sum + entry.count, 0));
const allTabLabel = computed(() =>
  t("sales_rep.documents.page.all_tab", { count: formatStatCount(totalInLibrary.value) }),
);

// Unapplied search term; committed to the query on Enter or the search button.
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

// Selection is deep-linked (?doc=), so a shared link opens the page with the panel already up.
const selectedId = useRouteQueryParam<string>("doc", { defaultValue: "" });

const selectedFromPage = computed(() => documents.value.find((document) => document.id === selectedId.value));

// The selected card is usually in the loaded page (no request then); the by-id query covers a
// deep-linked document sitting on another page or behind another filter.
const { document: fetchedDocument, loading: detailsLoading } = useSalesRepDocument(
  () => selectedId.value || undefined,
  { enabled: () => !selectedFromPage.value },
);

const selectedDocument = computed<SalesRepDocumentType | undefined>(
  () => selectedFromPage.value ?? fetchedDocument.value,
);

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

  // Own the search→content spacing (gap-4 = 1rem, matching My customers).
  &__results {
    @apply flex flex-col gap-4;
  }

  &__search {
    @apply flex;
  }

  &__search-input {
    @apply w-full;
  }

  &__controls {
    @apply flex flex-wrap items-center justify-between gap-3;
  }

  &__count {
    @apply text-sm text-neutral-500;
  }

  // Grid + optional details rail; the rail splits off at xl, mirroring the hub dashboard.
  &__layout {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  // ~2 cards per row on phones, growing to 4–5 on desktop (auto-fill keeps it responsive).
  &__grid {
    @apply grid min-w-0 flex-1 gap-4;

    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  }

  &__skeleton {
    @apply h-52 animate-pulse rounded-[--vc-radius] bg-neutral-100;
  }

  &__panel {
    @apply min-w-0 xl:w-80 xl:shrink-0;
  }

  &__details {
    @apply flex flex-col gap-3;
  }

  &__details-preview {
    @apply max-h-40 w-full rounded border border-neutral-200 object-contain;
  }

  &__details-empty {
    @apply text-sm text-neutral-500;
  }

  &__meta {
    @apply m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm;

    dt {
      @apply font-medium text-neutral-500;
    }

    dd {
      @apply m-0 [word-break:break-word];
    }
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
  @apply flex flex-col gap-2 rounded-[--vc-radius] border border-neutral-200 bg-additional-50 p-3 text-left transition-shadow;

  &:hover {
    @apply shadow-md;
  }

  &--active {
    @apply border-primary-500 ring-2 ring-primary-100;
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
}
</style>
