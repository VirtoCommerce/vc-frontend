import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useSlugInfo } from "./useSlugInfo";
import type { Ref } from "vue";

interface IQueryState {
  load: () => void;
  result: Ref<unknown>;
  loading: Ref<boolean>;
  error: Ref<unknown>;
}

const api = vi.hoisted(() => ({
  objectType: "",
  page: {} as IQueryState,
  pageDocument: {} as IQueryState,
}));

vi.mock("@/core/api/graphql", () => ({
  useGetSlugInfo: () => ({
    result: ref({ slugInfo: { entityInfo: { objectType: api.objectType, objectId: "id-1" } } }),
    loading: ref(false),
    error: ref(null),
  }),
  useGetPage: () => api.page,
  useGetPageDocument: () => api.pageDocument,
}));

vi.mock("@/core/composables/useLanguages", () => ({ useLanguages: () => ({ previousCultureSlug: ref() }) }));

vi.mock("@/core/globals", () => ({ globals: { storeId: "store", userId: "user", cultureName: "en-US" } }));

function createQueryState(): IQueryState {
  return { load: vi.fn(), result: ref(), loading: ref(false), error: ref(null) };
}

describe("useSlugInfo loading", () => {
  beforeEach(() => {
    api.page = createQueryState();
    api.pageDocument = createQueryState();
  });

  it.each([
    ["ContentFile", "page", { page: { content: "{}" } }],
    ["Pages", "pageDocument", { pageDocument: { content: "{}" } }],
  ] as const)("keeps a %s slug loading until its content query answers", (objectType, query, result) => {
    api.objectType = objectType;
    const { loading } = useSlugInfo("about");

    expect(loading.value).toBe(true);

    api[query].result.value = result;

    expect(loading.value).toBe(false);
  });

  it("stops loading when the content query fails", () => {
    api.objectType = "ContentFile";
    const { loading } = useSlugInfo("about");

    api.page.error.value = new Error("Network error");

    expect(loading.value).toBe(false);
  });

  it("does not wait for content on a catalog object", () => {
    api.objectType = "Category";
    const { loading } = useSlugInfo("printers");

    expect(loading.value).toBe(false);
  });
});
