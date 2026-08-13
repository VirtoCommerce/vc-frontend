import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { SalesRepDocumentCategoriesDocument, SalesRepDocumentsDocument } from "../api/graphql/types";
import { DOCUMENTS_PAGE_SIZE } from "../constants";
import { useSalesRepDocuments } from "./useSalesRepDocuments";
import type { SalesRepDocumentCategoriesQuery, SalesRepDocumentsQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: hoistedRef } = await import("vue");
  const result = hoistedRef<SalesRepDocumentsQuery | undefined>(undefined);
  const categoriesResult = hoistedRef<SalesRepDocumentCategoriesQuery | undefined>(undefined);
  const loading = hoistedRef(false);
  const error = hoistedRef<Error | null>(null);
  // Implementation installed after imports (the documents it routes on aren't loaded yet here).
  const useQuery = vi.fn();
  return { result, categoriesResult, loading, error, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: queryMock.useQuery,
}));

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

// One mock serves both ops; the document arg picks the result stream. (mockClear in beforeEach
// resets calls but keeps this implementation.)
queryMock.useQuery.mockImplementation((document: unknown) => ({
  result: document === SalesRepDocumentsDocument ? queryMock.result : queryMock.categoriesResult,
  loading: queryMock.loading,
  error: queryMock.error,
  onError: vi.fn(),
}));

/** The useQuery call for `document`, or undefined when that op was never queried. */
function callFor(document: unknown): unknown[] | undefined {
  return queryMock.useQuery.mock.calls.find(([calledDocument]) => calledDocument === document);
}

/** The reactive `variables` computed the composable handed to the documents query. */
function passedVariables(): { first: number; after: string; keyword: string; category?: string } {
  const variables = callFor(SalesRepDocumentsDocument)?.[1] as
    { value: ReturnType<typeof passedVariables> } | undefined;
  if (!variables) {
    throw new Error("useQuery was not called with variables");
  }
  return variables.value;
}

function documentsResult(
  totalCount: number,
  items: NonNullable<SalesRepDocumentsQuery["salesRepDocuments"]>["items"],
): SalesRepDocumentsQuery {
  return { salesRepDocuments: { totalCount, items } };
}

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.categoriesResult.value = undefined;
  queryMock.loading.value = false;
  queryMock.error.value = null;
  queryMock.useQuery.mockClear();
});

describe("useSalesRepDocuments", () => {
  it("queries with offset-as-cursor paging, applied keyword and category, no explicit sort", () => {
    const { page, keyword, category } = useSalesRepDocuments();

    // Default sort omitted → the server default (createdDate:desc).
    expect(passedVariables()).toEqual({
      first: DOCUMENTS_PAGE_SIZE,
      after: "0",
      keyword: "",
      category: undefined,
    });

    page.value = 3;
    expect(passedVariables().after).toBe(String((3 - 1) * DOCUMENTS_PAGE_SIZE));

    keyword.value = "catalog";
    expect(passedVariables().keyword).toBe("catalog");

    category.value = "Lookbooks";
    expect(passedVariables().category).toBe("Lookbooks");
  });

  it("takes a reactive page size (the widget's saved row cap) for both `first` and the offset", () => {
    const pageSize = ref<number | undefined>(5);
    const { page } = useSalesRepDocuments({ pageSize });

    expect(passedVariables().first).toBe(5);

    page.value = 2;
    expect(passedVariables().after).toBe("5");

    pageSize.value = 7;
    expect(passedVariables().first).toBe(7);
  });

  it("requests keepPreviousResult so the grid doesn't flash empty between pages", () => {
    useSalesRepDocuments();
    const options = callFor(SalesRepDocumentsDocument)?.[2] as { keepPreviousResult?: boolean };
    expect(options.keepPreviousResult).toBe(true);
  });

  it("maps the wire shape to the view model, defaulting blanks and falling back modifiedDate → createdDate", () => {
    const { items } = useSalesRepDocuments();
    queryMock.result.value = documentsResult(2, [
      {
        id: "doc-1",
        name: "Spring catalog.pdf",
        category: "Catalogs",
        contentType: "application/pdf",
        size: 4400000,
        createdDate: "2026-05-01T00:00:00Z",
        modifiedDate: "2026-05-22T00:00:00Z",
        url: "/api/sales-rep/documents/doc-1",
        summary: "All spring products.",
        pageCount: 48,
        previewUrl: "https://example.org/preview.png",
      },
      // category/contentType/modifiedDate/summary/pageCount/previewUrl absent
      {
        id: "doc-2",
        name: "notes",
        size: 10,
        createdDate: "2026-01-01T00:00:00Z",
        url: "/api/sales-rep/documents/doc-2",
      },
    ]);

    expect(items.value).toEqual([
      {
        id: "doc-1",
        name: "Spring catalog.pdf",
        category: "Catalogs",
        contentType: "application/pdf",
        size: 4400000,
        createdDate: "2026-05-01T00:00:00Z",
        modifiedDate: "2026-05-22T00:00:00Z",
        url: "/api/sales-rep/documents/doc-1",
        summary: "All spring products.",
        pageCount: 48,
        previewUrl: "https://example.org/preview.png",
      },
      {
        id: "doc-2",
        name: "notes",
        category: "",
        contentType: "",
        size: 10,
        createdDate: "2026-01-01T00:00:00Z",
        // Never modified → "updated" when it was created.
        modifiedDate: "2026-01-01T00:00:00Z",
        url: "/api/sales-rep/documents/doc-2",
        summary: "",
        pageCount: undefined,
        previewUrl: "",
      },
    ]);
  });

  it("derives pages from totalCount, never below 1, and clamps the current page when the set shrinks", async () => {
    const { page, pages } = useSalesRepDocuments();

    expect(pages.value).toBe(1); // no result yet

    queryMock.result.value = documentsResult(DOCUMENTS_PAGE_SIZE * 2 + 1, []);
    expect(pages.value).toBe(3);

    page.value = 3;
    await nextTick();
    expect(page.value).toBe(3); // still valid — no clamp

    queryMock.result.value = documentsResult(DOCUMENTS_PAGE_SIZE, []);
    await nextTick();
    expect(pages.value).toBe(1);
    expect(page.value).toBe(1); // clamped back to the last valid page
  });

  it("holds the categories query disabled unless the caller asks for tabs", () => {
    useSalesRepDocuments();
    let options = callFor(SalesRepDocumentCategoriesDocument)?.[2] as { enabled?: boolean };
    expect(options.enabled).toBe(false);

    queryMock.useQuery.mockClear();

    useSalesRepDocuments({ withCategories: true });
    options = callFor(SalesRepDocumentCategoriesDocument)?.[2] as { enabled?: boolean };
    expect(options.enabled).toBe(true);
  });

  it("maps categories, skipping null entries", () => {
    const { categories } = useSalesRepDocuments({ withCategories: true });

    queryMock.categoriesResult.value = {
      salesRepDocumentCategories: [{ name: "Catalogs", count: 2 }, null as never, { name: "Guides", count: 5 }],
    };

    expect(categories.value).toEqual([
      { name: "Catalogs", count: 2 },
      { name: "Guides", count: 5 },
    ]);
  });

  it("surfaces the query error so the surfaces can show a failure state", () => {
    const { error } = useSalesRepDocuments();

    expect(error).toBe(queryMock.error);
  });
});
