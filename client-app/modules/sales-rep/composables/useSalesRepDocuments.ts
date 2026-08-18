import { computed, ref, toValue, watch } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepDocumentCategoriesDocument, SalesRepDocumentsDocument } from "../api/graphql/types";
import { DOCUMENTS_PAGE_SIZE, HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepDocumentsQuery } from "../api/graphql/types";
import type { SalesRepDocumentCategoryType, SalesRepDocumentType } from "../types";
import type { Ref } from "vue";

type SalesRepDocumentWireType = NonNullable<NonNullable<SalesRepDocumentsQuery["salesRepDocuments"]>["items"]>[number];

// Shared mapper for the list and the by-id lookup. An absent modifiedDate falls back to createdDate.
export function mapSalesRepDocument(document: SalesRepDocumentWireType): SalesRepDocumentType {
  return {
    id: document.id,
    name: document.name,
    displayName: document.displayName || document.name,
    category: document.category ?? "",
    isPinned: document.isPinned,
    contentType: document.contentType ?? "",
    size: document.size,
    createdDate: document.createdDate as string,
    modifiedDate: (document.modifiedDate ?? document.createdDate) as string,
    url: document.url,
    summary: document.summary ?? "",
    pageCount: document.pageCount ?? undefined,
    previewUrl: document.previewUrl ?? "",
  };
}

type UseSalesRepDocumentsOptionsType = {
  // Expanded union (not MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  pageSize?: number | Ref<number | undefined> | (() => number | undefined);
  // Also fetch the category tabs (the browse page); the widget skips that extra query.
  withCategories?: boolean;
  // Server default is already "isPinned:desc;createdDate:desc"; callers still pass it explicitly.
  sort?: string;
};

// Fetches whenever it runs; "hidden ⇒ zero requests" is owned by the layout mounting only visible blocks.
export function useSalesRepDocuments(options: UseSalesRepDocumentsOptionsType = {}) {
  const keyword = ref("");
  const category = ref<string | undefined>(undefined);
  const page = ref(1);

  const pageSize = computed(() => toValue(options.pageSize) ?? DOCUMENTS_PAGE_SIZE);

  const variables = computed(() => ({
    first: pageSize.value,
    // xAPI connections take the offset as the cursor.
    after: String((page.value - 1) * pageSize.value),
    keyword: keyword.value,
    category: category.value,
    sort: options.sort,
  }));

  const { result, loading, error, onError } = useSalesRepHubQuery(SalesRepDocumentsDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the surfaces show their own error view instead.
    Logger.error("[sales-rep] salesRepDocuments failed:", err);
  });

  const items = computed<SalesRepDocumentType[]>(() =>
    (result.value?.salesRepDocuments?.items ?? [])
      .filter((document): document is NonNullable<typeof document> => document != null)
      .map(mapSalesRepDocument),
  );

  const totalCount = computed(() => result.value?.salesRepDocuments?.totalCount ?? 0);

  const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)));

  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  // Category tabs. Keyword flows in so the counts describe the filtered set; enabled only for the browse page.
  const categoriesVariables = computed(() => ({ keyword: keyword.value }));

  const {
    result: categoriesResult,
    loading: categoriesLoading,
    error: categoriesError,
    onError: onCategoriesError,
  } = useSalesRepHubQuery(SalesRepDocumentCategoriesDocument, categoriesVariables, {
    fetchPolicy: HUB_FETCH_POLICY,
    enabled: options.withCategories === true,
  });

  onCategoriesError((err) => {
    Logger.error("[sales-rep] salesRepDocumentCategories failed:", err);
  });

  const categories = computed<SalesRepDocumentCategoryType[]>(() =>
    (categoriesResult.value?.salesRepDocumentCategories ?? [])
      .filter((entry): entry is NonNullable<typeof entry> => entry != null)
      .map((entry) => ({ name: entry.name ?? "", count: entry.count ?? 0 })),
  );

  return {
    loading,
    error,
    keyword,
    category,
    page,
    pages,
    items,
    totalCount,
    categories,
    categoriesLoading,
    categoriesError,
  };
}
