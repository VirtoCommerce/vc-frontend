import { beforeEach, describe, expect, it, vi } from "vitest";
import { SalesRepDocumentsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepPinnedDocument } from "./useSalesRepPinnedDocument";
import type { SalesRepDocumentsQuery } from "../api/graphql/types";

// vi.hoisted runs before this file's imports, so it must import vue itself.
const queryMock = await vi.hoisted(async () => {
  const { ref: hoistedRef } = await import("vue");
  const result = hoistedRef<SalesRepDocumentsQuery | undefined>(undefined);
  const loading = hoistedRef(false);
  const error = hoistedRef<Error | null>(null);
  const useQuery = vi.fn(() => ({ result, loading, error, onError: vi.fn() }));
  return { result, loading, error, useQuery };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: queryMock.useQuery,
}));

beforeEach(() => {
  queryMock.result.value = undefined;
  queryMock.loading.value = false;
  queryMock.error.value = null;
  queryMock.useQuery.mockClear();
});

describe("useSalesRepPinnedDocument", () => {
  it("asks for exactly the one pinned document, on the hub fetch policy", () => {
    useSalesRepPinnedDocument();

    const [document, variables, options] = queryMock.useQuery.mock.calls[0] as unknown[];
    expect(document).toBe(SalesRepDocumentsDocument);
    expect(variables).toEqual({ first: 1, pinned: true });
    expect((options as { fetchPolicy?: string }).fetchPolicy).toBe(HUB_FETCH_POLICY);
  });

  it("maps the pinned document, or undefined when nothing is pinned (fallback stays with the caller)", () => {
    const { document } = useSalesRepPinnedDocument();

    expect(document.value).toBeUndefined();

    // Nothing pinned → an empty page.
    queryMock.result.value = { salesRepDocuments: { totalCount: 0, items: [] } };
    expect(document.value).toBeUndefined();

    queryMock.result.value = {
      salesRepDocuments: {
        totalCount: 1,
        items: [
          {
            id: "doc-9",
            name: "Lookbook.pdf",
            displayName: "Summer lookbook",
            isPinned: true,
            size: 100,
            createdDate: "2026-06-01T00:00:00Z",
            url: "/api/sales-rep/documents/doc-9",
          },
        ],
      },
    };

    expect(document.value).toMatchObject({ id: "doc-9", displayName: "Summer lookbook", isPinned: true });
  });
});
