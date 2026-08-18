<template>
  <LayoutWidget :title="title" size="md" class="sales-rep-documents">
    <template #append>
      <VcLink :to="{ name: DOCUMENTS_ROUTE_NAME }" class="sales-rep-documents__all-link">
        {{ t("sales_rep.documents.browse_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- VcWidget has no padding prop; #default-container is our seam for the inset, not .vc-widget__slot. -->
    <template #default-container>
      <div class="sales-rep-documents__body">
        <!-- A failure replaces the rows rather than sharing the empty view: apollo keeps the previous
             rows on a failed refetch, which would otherwise read as the current result (VCST-5586). -->
        <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.documents.load_failed')" variant="error" />

        <VcEmptyView
          v-else-if="!documents.length && !loading"
          :text="t('sales_rep.documents.empty')"
          icon="file-text"
        />

        <!-- First load: placeholder rows sized to the row cap, so the widget keeps its height. -->
        <ul v-else-if="loading && !documents.length" class="sales-rep-documents__list" aria-hidden="true">
          <li v-for="index in rowLimit" :key="index" class="sales-rep-documents__row">
            <div class="sales-rep-documents__skeleton" />
          </li>
        </ul>

        <ul v-else class="sales-rep-documents__list">
          <li v-for="document in documents" :key="document.id" class="sales-rep-documents__row">
            <VcImage :src="documentIcon(document.contentType)" alt="" class="sales-rep-documents__icon" />

            <div class="sales-rep-documents__details">
              <span class="sales-rep-documents__name" :title="document.displayName">{{ document.displayName }}</span>

              <span class="sales-rep-documents__meta">{{ documentMeta(document, t, d) }}</span>
            </div>

            <!-- Not a plain anchor: a browser navigation to `url` carries no bearer token, so the
                 open goes through the authenticated fetch → blob object URL (see files.ts). -->
            <VcButton
              class="sales-rep-documents__open"
              size="xs"
              color="secondary"
              variant="outline"
              append-icon="external-link"
              @click="openAuthorizedFile(document.url, document.contentType, document.name)"
            >
              {{ t("sales_rep.documents.open") }}
            </VcButton>
          </li>
        </ul>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBlockChrome } from "../composables/useBlockChrome";
import { useSalesRepDocuments } from "../composables/useSalesRepDocuments";
import { DOCUMENTS_DEFAULT_ROWS, DOCUMENTS_ROUTE_NAME } from "../constants";
import { openAuthorizedFile } from "../files";
import { documentIcon, documentMeta } from "../utils";
import LayoutWidget from "./layout-widget.vue";

interface IProps {
  // Widget heading; omit inside a layout, where LayoutWidget falls back to the block's titleKey.
  title?: string;
}

withDefaults(defineProps<IProps>(), {
  title: undefined,
});

const { t, d } = useI18n();

// Absent when this widget renders outside a layout, which then configures nothing.
const chrome = useBlockChrome();

// The saved cap, not the draft: it is a query variable, so it applies on save.
const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? DOCUMENTS_DEFAULT_ROWS);

// Hidden ⇒ zero requests: the layout mounts only visible blocks, so this composable (and its query)
// exists only while the widget shows — see the note in useSalesRepDocuments.ts.
const {
  items: documents,
  loading,
  error,
} = useSalesRepDocuments({ pageSize: () => rowLimit.value, sort: "isPinned:desc;createdDate:desc" });

const failed = computed(() => Boolean(error.value));
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-documents {
  &__body {
    @apply flex flex-col px-6 py-2;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }

  &__list {
    @apply m-0 flex list-none flex-col divide-y divide-neutral-100 p-0;
  }

  &__row {
    @apply flex items-center gap-3 py-3;
  }

  &__icon {
    @apply size-8 flex-none;
  }

  &__details {
    @apply flex min-w-0 grow flex-col;
  }

  &__name {
    @apply truncate text-sm font-medium;
  }

  &__meta {
    @apply mt-0.5 truncate text-xs text-neutral-500;
  }

  &__open {
    @apply flex-none;
  }

  &__skeleton {
    @apply h-9 w-full animate-pulse rounded bg-neutral-100;
  }
}
</style>
