import { useQuery } from "@vue/apollo-composable";
import { computed, ref, toValue, watch } from "vue";
import { Logger } from "@/core/utilities";
import { SalesRepDocumentCategoriesDocument, SalesRepDocumentsDocument } from "../api/graphql/types";
import { DOCUMENTS_PAGE_SIZE, HUB_FETCH_POLICY } from "../constants";
import type { SalesRepDocumentsQuery } from "../api/graphql/types";
import type { SalesRepDocumentCategoryType, SalesRepDocumentType } from "../types";
import type { Ref } from "vue";

type SalesRepDocumentWireType = NonNullable<NonNullable<SalesRepDocumentsQuery["salesRepDocuments"]>["items"]>[number];

// One mapper for the list and the by-id lookup (useSalesRepDocument), so both surfaces read the
// same view model. An absent modifiedDate falls back to createdDate: "Updated {date}" always has
// a date, and a never-modified file was last "updated" when it was created.
export function mapSalesRepDocument(document: SalesRepDocumentWireType): SalesRepDocumentType {
  return {
    id: document.id,
    name: document.name,
    // The backend never sends an empty displayName in practice; the raw name is a safety net.
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
  // Documents per page. The widget passes its saved row cap (reactive: a saved cap change refires
  // the query); the browse page omits it for the module default. Expanded union (not
  // MaybeRefOrGetter<… | undefined>) to avoid the redundant "undefined" — Sonar S4782.
  pageSize?: number | Ref<number | undefined> | (() => number | undefined);
  // Also fetch the category tabs (the browse page); the widget skips that extra query.
  withCategories?: boolean;
  // Server sort rule; omitted → server default, which is already "isPinned:desc;createdDate:desc"
  // (the browse page and widget still pass it explicitly so pinned-first doesn't rely on that default).
  sort?: string;
};

// Hidden-widget guarantee (VCST-5730): this composable fetches whenever it runs, so "hidden ⇒ zero
// requests" is owned by the layout render path — <LayoutSurface> mounts only a region's visible
// blocks (the hidden tray renders titles, never components), so a hidden documents widget never
// runs this composable at all. Pinned by sales-rep-documents.test.ts.
export function useSalesRepDocuments(options: UseSalesRepDocumentsOptionsType = {}) {
  // Applied search term (committed on enter/click by the page), not the live input.
  const keyword = ref("");
  // Selected category (a subfolder name); undefined → the "All" baseline.
  const category = ref<string | undefined>(undefined);
  const page = ref(1);

  const pageSize = computed(() => toValue(options.pageSize) ?? DOCUMENTS_PAGE_SIZE);

  const variables = computed(() => ({
    first: pageSize.value,
    // xAPI connections take the offset as the cursor.
    after: String((page.value - 1) * pageSize.value),
    keyword: keyword.value,
    category: category.value,
    // No user-facing sort control; callers may pin a fixed rule (browse page: pinned-first).
    sort: options.sort,
  }));

  // keepPreviousResult holds the current page while the next one loads, so the grid doesn't flash empty.
  const { result, loading, error, onError } = useQuery(SalesRepDocumentsDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the surfaces show their own error view instead (VCST-5586).
    Logger.error("[sales-rep] salesRepDocuments failed:", err);
  });

  const items = computed<SalesRepDocumentType[]>(() =>
    (result.value?.salesRepDocuments?.items ?? [])
      // Skip null connection items so one bad row doesn't blank the list.
      .filter((document): document is NonNullable<typeof document> => document != null)
      .map(mapSalesRepDocument),
  );

  const totalCount = computed(() => result.value?.salesRepDocuments?.totalCount ?? 0);

  const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)));

  // Clamp back to the last valid page when the set shrinks below the current page.
  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  // Category tabs (sorted by name server-side). `enabled: false` keeps the widget from paying for
  // a query only the browse page renders. The committed keyword flows in so the tab counts describe
  // the filtered set (zero-count categories are omitted by the server and their tabs disappear).
  const categoriesVariables = computed(() => ({ keyword: keyword.value }));

  const {
    result: categoriesResult,
    loading: categoriesLoading,
    error: categoriesError,
    onError: onCategoriesError,
  } = useQuery(SalesRepDocumentCategoriesDocument, categoriesVariables, {
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
