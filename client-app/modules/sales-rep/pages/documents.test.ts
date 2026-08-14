import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import Documents from "./documents.vue";
import type { SalesRepDocumentCategoryType, SalesRepDocumentType } from "../types";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<SalesRepDocumentType[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    keyword: ref(""),
    category: ref<string | undefined>(undefined),
    page: ref(1),
    pages: ref(1),
    totalCount: ref(0),
    categories: ref<SalesRepDocumentCategoryType[]>([]),
    selectedId: ref(""),
  };
});

vi.mock("../composables/useSalesRepDocuments", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepDocuments: () => ({
      items: state.items,
      loading: state.loading,
      error: state.error,
      keyword: state.keyword,
      category: state.category,
      page: state.page,
      pages: state.pages,
      totalCount: state.totalCount,
      categories: state.categories,
      categoriesLoading: ref(false),
      categoriesError: ref(null),
    }),
  };
});
vi.mock("../composables/useSalesRepDocument", async () => {
  const { ref } = await import("vue");
  return {
    useSalesRepDocument: () => ({ document: ref(undefined), loading: ref(false), error: ref(null) }),
  };
});
// The ?doc= deep link; a plain ref stands in for the route-backed writable computed.
vi.mock("@/core/composables/useRouteQueryParam", () => ({
  useRouteQueryParam: () => state.selectedId,
}));
const downloadFileMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/files", () => ({
  downloadFile: downloadFileMock,
}));

// The authenticated open path (VCST-5730): a plain anchor would navigate without a bearer token.
const openAuthorizedFileMock = vi.hoisted(() => vi.fn());
vi.mock("../files", () => ({
  openAuthorizedFile: openAuthorizedFileMock,
}));

function makeDocument(overrides: Partial<SalesRepDocumentType> = {}): SalesRepDocumentType {
  return {
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
    previewUrl: "",
    ...overrides,
  };
}

const createWrapper = createWrapperFactory(mount, Documents, {
  global: {
    renderStubDefaultSlot: false,
    mocks: { $d: (value: unknown) => String(value) },
    stubs: {
      // Renders its slot so tests can read which document the featured panel names.
      VcTypography: { template: "<div><slot /></div>" },
      VcInput: true,
      VcButton: true,
      VcBadge: true,
      VcIcon: true,
      VcImage: true,
      VcEmptyView: true,
      VcPagination: true,
    },
  },
});

const emptyViews = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findAll("vc-empty-view-stub");

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.keyword.value = "";
  state.category.value = undefined;
  state.page.value = 1;
  state.pages.value = 1;
  state.totalCount.value = 0;
  state.categories.value = [];
  state.selectedId.value = "";
  downloadFileMock.mockClear();
  openAuthorizedFileMock.mockClear();
});

describe("Documents category tabs", () => {
  it("renders a tab per category with a highlighted count, after the All baseline", () => {
    state.items.value = [makeDocument()];
    state.categories.value = [
      { name: "Catalogs", count: 2 },
      { name: "Guides", count: 5 },
    ];

    const wrapper = createWrapper();
    const tabs = wrapper.findAll(".sales-rep-rule-chips__tab");

    expect(tabs.map((tab) => tab.find(".sales-rep-rule-chips__label").text())).toEqual([
      "sales_rep.documents.page.all_tab", // t() is mocked to the key
      "Catalogs",
      "Guides",
    ]);

    // The count is a separate accent-styled element (design mock), not baked into the label;
    // the All baseline carries the library total.
    expect(tabs.map((tab) => tab.find(".sales-rep-rule-chips__count").text())).toEqual(["7", "2", "5"]);
  });

  it("selects the category and resets the page when a tab is clicked", async () => {
    state.items.value = [makeDocument()];
    state.categories.value = [{ name: "Catalogs", count: 2 }];
    state.page.value = 3;

    const wrapper = createWrapper();
    await wrapper.findAll(".sales-rep-rule-chips__tab")[1].trigger("click");

    expect(state.category.value).toBe("Catalogs");
    expect(state.page.value).toBe(1);
  });

  it("offers no tab strip when the library has no categories", () => {
    state.items.value = [makeDocument()];

    const wrapper = createWrapper();

    expect(wrapper.find(".sales-rep-rule-chips").exists()).toBe(false);
  });
});

describe("Documents states", () => {
  it("shows the no-data view, not an error, when the response was simply empty", () => {
    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("empty");
  });

  // The query runs with keepPreviousResult, so cards survive a failed refetch and would otherwise
  // be presented as the current result (VCST-5586).
  it("replaces the grid with the failure view when the query failed but stale cards remain", () => {
    state.items.value = [makeDocument()];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(wrapper.find(".document-card").exists()).toBe(false);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });

  it("shows the search empty state when a keyword matched nothing and no request failed", () => {
    state.keyword.value = "acme";

    const wrapper = createWrapper();
    const views = emptyViews(wrapper);

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("search");
  });
});

describe("Documents page order", () => {
  // The mock's layout: featured panel first, then the category tabs, then the search field, then the grid.
  it("renders featured panel -> category tabs -> search -> grid", () => {
    state.items.value = [makeDocument()];
    state.categories.value = [{ name: "Catalogs", count: 2 }];

    const html = createWrapper().html();
    const order = [
      html.indexOf("documents-page__featured"),
      html.indexOf("sales-rep-rule-chips"),
      html.indexOf("documents-page__search"),
      html.indexOf("documents-page__grid"),
    ];

    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((left, right) => left - right));
  });
});

describe("Documents featured panel", () => {
  it("features the newest document when nothing is selected", () => {
    state.items.value = [makeDocument(), makeDocument({ id: "doc-2", name: "Price list.xlsx" })];

    const wrapper = createWrapper();
    const featured = wrapper.find(".documents-page__featured");

    expect(featured.exists()).toBe(true);
    // The list is server-sorted createdDate:desc, so the first item of the default list is the newest.
    expect(featured.find(".documents-page__featured-name").text()).toBe("Spring catalog.pdf");
    // No badge: the "Latest release" chip was removed pending a real tagging system.
    expect(featured.find("vc-badge-stub").exists()).toBe(false);
    // No explicit selection -> nothing to close.
    expect(featured.find(".documents-page__featured-close").exists()).toBe(false);
  });

  it("features the selected document when it is not the newest", async () => {
    state.items.value = [makeDocument(), makeDocument({ id: "doc-2", name: "Price list.xlsx" })];

    const wrapper = createWrapper();
    await wrapper.findAll(".document-card")[1].trigger("click");

    expect(state.selectedId.value).toBe("doc-2");
    expect(wrapper.find(".document-card--active").text()).toContain("Price list.xlsx");

    const featured = wrapper.find(".documents-page__featured");
    expect(featured.find(".documents-page__featured-name").text()).toBe("Price list.xlsx");
    expect(featured.find("vc-badge-stub").exists()).toBe(false);
    expect(featured.find(".documents-page__featured-close").exists()).toBe(true);
    expect(featured.find(".documents-page__summary").exists()).toBe(true);
  });

  it("hides the panel entirely while the library is empty", () => {
    const wrapper = createWrapper();

    expect(wrapper.find(".documents-page__featured").exists()).toBe(false);
  });

  // Open must not be an anchor (a navigation carries no bearer token); it goes through the
  // authenticated fetch util, while Download keeps the shared downloadFile path.
  it("wires Open to the authorized fetch util and Download to downloadFile", async () => {
    state.items.value = [makeDocument()];
    state.selectedId.value = "doc-1";

    const wrapper = createWrapper();
    const actions = wrapper.find(".documents-page__actions").findAll("vc-button-stub");

    expect(actions).toHaveLength(2);
    expect(actions[0].attributes("externallink")).toBeUndefined();

    await actions[0].trigger("click");
    expect(openAuthorizedFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1", "application/pdf");

    await actions[1].trigger("click");
    expect(downloadFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-1", "Spring catalog.pdf");
  });
});
