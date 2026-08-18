import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENTS_BLOCK_ID, DOCUMENTS_DEFAULT_ROWS } from "../constants";
import { documentsBlock } from "../layout/documents-block";
import { getBlockRegistry, registerBlock } from "../layout/registry";
import LayoutSurface from "./layout-surface.vue";
import SalesRepDocuments from "./sales-rep-documents.vue";
import type { SalesRepDocumentType } from "../types";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcWidget from "@/ui-kit/components/organisms/widget/vc-widget.vue";
import VcWidgetSkeleton from "@/ui-kit/components/organisms/widget-skeleton/vc-widget-skeleton.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    items: ref<SalesRepDocumentType[]>([]),
    loading: ref(false),
    error: ref<Error | null>(null),
    useSalesRepDocuments: vi.fn(),
  };
});

vi.mock("../composables/useSalesRepDocuments", () => ({
  useSalesRepDocuments: state.useSalesRepDocuments,
}));

// The authenticated open path (VCST-5730): a plain anchor would navigate without a bearer token.
const openAuthorizedFileMock = vi.hoisted(() => vi.fn());
vi.mock("../files", () => ({
  openAuthorizedFile: openAuthorizedFileMock,
}));

// The layout query behind <LayoutSurface>; the widget's own data query is the mocked composable above.
const apolloMock = await vi.hoisted(async () => {
  const { ref, shallowRef } = await import("vue");
  return {
    result: shallowRef<unknown>(undefined),
    loading: ref(false),
    error: ref<Error | undefined>(),
    mutate: vi.fn(),
  };
});

vi.mock("@vue/apollo-composable", () => ({
  useQuery: () => ({
    result: apolloMock.result,
    loading: apolloMock.loading,
    error: apolloMock.error,
    onError: vi.fn(),
  }),
  useMutation: () => ({ mutate: apolloMock.mutate, loading: apolloMock.loading }),
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    d: () => "May 22",
    n: (value: number, options?: { unit?: string }) => `${value} ${options?.unit ?? ""}`.trim(),
  }),
}));
vi.mock("sortablejs", () => ({
  default: class {
    option = vi.fn();
    destroy = vi.fn();
  },
}));

function makeDocument(overrides: Partial<SalesRepDocumentType> = {}): SalesRepDocumentType {
  return {
    id: "doc-1",
    name: "Spring catalog.pdf",
    displayName: "Spring catalog",
    category: "Catalogs",
    isPinned: false,
    contentType: "application/pdf",
    size: 4400000,
    createdDate: "2026-05-01T00:00:00Z",
    modifiedDate: "2026-05-22T00:00:00Z",
    url: "/api/sales-rep/documents/doc-1",
    summary: "",
    pageCount: undefined,
    previewUrl: "",
    ...overrides,
  };
}

// Plain mount (not createWrapperFactory): this file mocks the vue-i18n module, and the shared
// factory's defaults build a real i18n plugin from it.
function createWrapper() {
  return mount(SalesRepDocuments, {
    global: {
      renderStubDefaultSlot: false,
      stubs: {
        // The content lives in named slots, which a plain stub would not render.
        VcWidget: { template: '<div><slot name="append" /><slot name="default-container" /></div>' },
        // VcButton stays real: the Open action renders as a genuine <button> the test clicks.
        VcEmptyView: true,
        VcIcon: true,
        VcLink: true,
        VcImage: true,
      },
      components: { VcButton },
    },
  });
}

enableAutoUnmount(afterEach);

beforeEach(() => {
  state.items.value = [];
  state.loading.value = false;
  state.error.value = null;
  state.useSalesRepDocuments.mockClear();
  openAuthorizedFileMock.mockClear();
  state.useSalesRepDocuments.mockImplementation(() => ({
    items: state.items,
    loading: state.loading,
    error: state.error,
  }));
  apolloMock.loading.value = false;
  apolloMock.result.value = { salesRepLayout: null };
});

describe("SalesRepDocuments states", () => {
  it("renders a row per document, named by displayName, with the file meta line", () => {
    state.items.value = [
      makeDocument({ pageCount: 48 }),
      makeDocument({ id: "doc-2", name: "Price list.xlsx", displayName: "Price list" }),
    ];

    const wrapper = createWrapper();
    const rows = wrapper.findAll(".sales-rep-documents__row");

    expect(rows).toHaveLength(2);
    // The display name, never the raw file name.
    expect(rows[0].find(".sales-rep-documents__name").text()).toBe("Spring catalog");
    expect(rows[1].find(".sales-rep-documents__name").text()).toBe("Price list");
    // "<pages> · Published <date>" — the row icon already conveys the type; no size (team feedback).
    const meta = rows[0].find(".sales-rep-documents__meta").text();
    expect(meta).toContain("sales_rep.documents.details.pages_count");
    expect(meta).toContain("sales_rep.documents.published");
    expect(meta).not.toContain("PDF");
    expect(meta).not.toContain("megabyte");
    // No page count -> the meta degrades to the published date alone.
    const metaWithoutPages = rows[1].find(".sales-rep-documents__meta").text();
    expect(metaWithoutPages).toBe("sales_rep.documents.published");
  });

  // Team feedback: the row action is a secondary (blue) button, not the primary (orange) default.
  it("renders the Open action as a secondary outline button", () => {
    state.items.value = [makeDocument()];

    const wrapper = createWrapper();
    const open = wrapper.find(".sales-rep-documents__open");

    expect(open.classes()).toContain("vc-button--outline--secondary");
  });

  // Not an anchor: a browser navigation carries no bearer token, so Open goes through the
  // authenticated fetch → blob object URL util instead of an href.
  it("opens a document through the authorized fetch util, not a plain anchor", async () => {
    state.items.value = [makeDocument()];

    const wrapper = createWrapper();
    const open = wrapper.find(".sales-rep-documents__open");

    expect(open.element.tagName).toBe("BUTTON");
    expect(open.attributes("href")).toBeUndefined();

    await open.trigger("click");

    expect(openAuthorizedFileMock).toHaveBeenCalledWith(
      "/api/sales-rep/documents/doc-1",
      "application/pdf",
      "Spring catalog.pdf",
    );
  });

  it("asks for the default row cap when rendered outside a layout", () => {
    createWrapper();

    const options = state.useSalesRepDocuments.mock.calls.at(-1)?.[0] as {
      pageSize: () => number | undefined;
    };
    expect(options.pageSize()).toBe(DOCUMENTS_DEFAULT_ROWS);
  });

  it("shows the no-data view when the response was empty", () => {
    const wrapper = createWrapper();
    const views = wrapper.findAll("vc-empty-view-stub");

    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBeUndefined();
  });

  // VCST-5586: apollo keeps the previous rows on a failed refetch, so the failure view has to win.
  it("replaces the rows with the failure view when the query failed but stale rows remain", () => {
    state.items.value = [makeDocument()];
    state.error.value = new Error("boom");

    const wrapper = createWrapper();
    const views = wrapper.findAll("vc-empty-view-stub");

    expect(wrapper.findAll(".sales-rep-documents__row")).toHaveLength(0);
    expect(views).toHaveLength(1);
    expect(views[0].attributes("variant")).toBe("error");
  });
});

// The security invariant behind VCST-5730 §4.5: a hidden widget must issue ZERO document requests.
// The mechanism is the layout render path itself — <LayoutSurface> mounts only a region's visible
// blocks (the hidden tray renders titles, never components) — so the proof is that the composable
// (the only caller of the documents query) never runs while the block is hidden.
describe("hidden documents widget", () => {
  async function mountDashboardWithEverythingHidden() {
    // The block registers at init behind the permission check; tests register it themselves.
    registerBlock("dashboard", documentsBlock);

    // Every dashboard block hidden — no widget mounts, so no widget query can fire.
    apolloMock.result.value = {
      salesRepLayout: {
        regions: [{ blocks: getBlockRegistry("dashboard").map(({ id }) => ({ type: id, hidden: true })) }],
      },
    };

    const wrapper = mount(LayoutSurface, {
      props: { scope: "dashboard" as const, cards: [] },
      attachTo: document.body,
      global: {
        components: { VcButton, VcWidget, VcWidgetSkeleton },
        stubs: {
          VcIcon: true,
          VcShape: true,
          VcAlert: true,
          VcLoaderOverlay: true,
          VcLink: true,
          VcImage: true,
          VcEmptyView: true,
          VcInput: true,
        },
      },
    });
    await flushPromises();

    return wrapper;
  }

  it("never runs the documents composable while the block is hidden, and runs it once restored", async () => {
    const wrapper = await mountDashboardWithEverythingHidden();

    expect(state.useSalesRepDocuments).not.toHaveBeenCalled();

    // Enter edit mode and restore the widget from the tray: only then may the query exist.
    await wrapper.find("[data-layout-edit-toggle]").trigger("click");
    await flushPromises();
    expect(state.useSalesRepDocuments).not.toHaveBeenCalled();

    await wrapper.find(`[data-restore-id="${DOCUMENTS_BLOCK_ID}"]`).trigger("click");
    // Two rounds: the restore re-renders, then the async widget chunk resolves and mounts.
    await flushPromises();
    await flushPromises();

    expect(state.useSalesRepDocuments).toHaveBeenCalledTimes(1);
  });
});
