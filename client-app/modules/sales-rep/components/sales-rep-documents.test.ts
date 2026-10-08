import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { getBlockRegistry, LAYOUT_SCOPES, registerBlock, useLayout } from "@/shared/dashboard";
import { DOCUMENTS_BLOCK_ID, DOCUMENTS_DEFAULT_ROWS } from "../constants";
import { registerSalesRepBlocks } from "../layout/blocks";
import { documentsBlock } from "../layout/documents-block";
import SalesRepDocuments from "./sales-rep-documents.vue";
import type { SalesRepDocumentType } from "../types";
import LayoutSurface from "@/shared/dashboard/components/layout-surface.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";
import VcEmptyView from "@/ui-kit/components/molecules/empty-view/vc-empty-view.vue";
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
// Keep the real isInlineRenderable (it drives the Open button's v-if); only stub the side-effecting open.
const openAuthorizedFileMock = vi.hoisted(() => vi.fn());
vi.mock("../files", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../files")>()),
  openAuthorizedFile: openAuthorizedFileMock,
}));

// VCST-6083: a non-inline type gets a Download action, which goes straight to the shared download util.
const downloadFileMock = vi.hoisted(() => vi.fn());
vi.mock("@/shared/files", () => ({
  downloadFile: downloadFileMock,
}));

// The layout operations behind the page's `useLayout`; the widget's own data query is the mocked composable above.
const layoutApi = vi.hoisted(() => ({ getLayout: vi.fn(), saveLayout: vi.fn() }));

vi.mock("@/core/api/graphql/account/queries/getLayout", () => ({ getLayout: layoutApi.getLayout }));
vi.mock("@/core/api/graphql/account/mutations/saveLayout", () => ({ saveLayout: layoutApi.saveLayout }));
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

// As init() does for a rep carrying documents:read (VCST-5730): the dashboard's defaults, then the widget.
const DASHBOARD = LAYOUT_SCOPES.salesRepDashboard;
registerSalesRepBlocks();
registerBlock(DASHBOARD, documentsBlock);

// The dashboard page in miniature: the page owns the layout and hands it to the surface.
const DashboardPage = defineComponent({
  setup() {
    const layout = useLayout(DASHBOARD);
    return () => h(LayoutSurface, { layout, cards: [] });
  },
});

function mountDashboard() {
  return mount(DashboardPage, {
    attachTo: document.body,
    global: {
      // VcEmptyView is real: with every block hidden the layout's empty state renders first, and its buttons live
      // in slots a stub does not render.
      components: { VcButton, VcEmptyView, VcWidget, VcWidgetSkeleton },
      stubs: {
        VcIcon: true,
        VcShape: true,
        VcAlert: true,
        VcLoaderOverlay: true,
        VcLink: true,
        VcImage: true,
        VcInput: true,
        VcStatCard: true,
        // `i18n-t` because vue-i18n is mocked down to `useI18n`.
        VcTypography: true,
        "i18n-t": true,
      },
    },
  });
}

/** A saved dashboard document with every block but the listed ones hidden. */
function savedWithOnlyVisible(...visible: string[]) {
  return {
    regions: [
      {
        blocks: getBlockRegistry(DASHBOARD).map(({ id }) => ({
          type: id,
          hidden: !visible.includes(id),
        })),
      },
    ],
  };
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
  layoutApi.getLayout.mockReset().mockResolvedValue(null);
  layoutApi.saveLayout.mockReset();
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

  it("hides Open for a type that cannot be viewed in a tab", () => {
    // Open only ever opens; a non-inline type would fall back to a download, so the button is hidden.
    state.items.value = [
      makeDocument({ contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
    ];

    const wrapper = createWrapper();

    expect(wrapper.find(".sales-rep-documents__open").exists()).toBe(false);
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

// VCST-6083: the widget listed DOC/XLS/ZIP rows with no action at all, while /company/documents offers
// Download for the same document. Every listed row must carry an action.
describe("SalesRepDocuments non-inline documents", () => {
  const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const ZIP = "application/zip";

  beforeEach(() => {
    downloadFileMock.mockClear();
  });

  it.each([DOCX, XLSX, ZIP])("offers a Download action for %s", (contentType) => {
    state.items.value = [makeDocument({ contentType, name: "Price list.xlsx", displayName: "Price list" })];

    const wrapper = createWrapper();
    const download = wrapper.find(".sales-rep-documents__download");

    expect(download.exists()).toBe(true);
    expect(download.element.tagName).toBe("BUTTON");
    expect(download.text()).toBe("sales_rep.documents.details.download");
  });

  it("downloads the document through the shared download util", async () => {
    state.items.value = [
      makeDocument({ id: "doc-2", contentType: XLSX, name: "Price list.xlsx", url: "/api/sales-rep/documents/doc-2" }),
    ];

    const wrapper = createWrapper();
    await wrapper.find(".sales-rep-documents__download").trigger("click");

    expect(downloadFileMock).toHaveBeenCalledWith("/api/sales-rep/documents/doc-2", "Price list.xlsx");
    expect(openAuthorizedFileMock).not.toHaveBeenCalled();
  });

  it("keeps a single Open action for an inline-renderable document", () => {
    state.items.value = [makeDocument()];

    const wrapper = createWrapper();

    expect(wrapper.find(".sales-rep-documents__open").exists()).toBe(true);
    expect(wrapper.find(".sales-rep-documents__download").exists()).toBe(false);
  });

  it("gives every row in a mixed list exactly one action", () => {
    state.items.value = [
      makeDocument(),
      makeDocument({ id: "doc-2", contentType: DOCX, name: "Credit application.docx" }),
      makeDocument({ id: "doc-3", contentType: ZIP, name: "Contract pack.zip" }),
    ];

    const wrapper = createWrapper();
    const rows = wrapper.findAll(".sales-rep-documents__row");

    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.findAll("button")).toHaveLength(1);
    }
  });
});

// The security invariant behind VCST-5730 §4.5: a hidden widget must issue ZERO document requests.
// The mechanism is the layout render path itself — <LayoutSurface> mounts only a region's visible
// blocks (the hidden tray renders titles, never components) — so the proof is that the composable
// (the only caller of the documents query) never runs while the block is hidden.
describe("hidden documents widget", () => {
  async function mountDashboardWithEverythingHidden() {
    // Every dashboard block hidden — no widget mounts, so no widget query can fire.
    layoutApi.getLayout.mockResolvedValue(savedWithOnlyVisible());

    const wrapper = mountDashboard();
    await flushPromises();

    return wrapper;
  }

  it("never runs the documents composable while the block is hidden, and runs it once restored", async () => {
    const wrapper = await mountDashboardWithEverythingHidden();

    expect(state.useSalesRepDocuments).not.toHaveBeenCalled();

    // Enter edit mode and restore the widget from the tray: only then may the query exist. With every
    // block hidden the surface shows its empty state, whose own button is the way into edit mode.
    await wrapper.find("[data-layout-empty-edit]").trigger("click");
    await flushPromises();
    expect(state.useSalesRepDocuments).not.toHaveBeenCalled();

    await wrapper.find(`[data-restore-id="${DOCUMENTS_BLOCK_ID}"]`).trigger("click");
    // Two rounds: the restore re-renders, then the async widget chunk resolves and mounts.
    await flushPromises();
    await flushPromises();

    expect(state.useSalesRepDocuments).toHaveBeenCalledTimes(1);
  });
});

// SAVE LAYOUT sends the draft as one full-document replace, so a hide only survives if the hidden documents
// block is in the payload — a block missing from it is simply gone after the save.
describe("saving the dashboard with the documents widget hidden", () => {
  it("sends the hidden documents block in the save payload", async () => {
    // Only the documents widget on screen, so it is the only widget that mounts.
    layoutApi.getLayout.mockResolvedValue(savedWithOnlyVisible(DOCUMENTS_BLOCK_ID));
    const wrapper = mountDashboard();
    await flushPromises();

    await wrapper.find("[data-layout-edit-toggle]").trigger("click");
    // Two rounds: the edit mode re-renders, then the async widget chunk resolves and mounts.
    await flushPromises();
    await flushPromises();

    await wrapper.find(`[data-block-id="${DOCUMENTS_BLOCK_ID}"] .layout-widget__hide`).trigger("click");
    await wrapper.find("[data-layout-save]").trigger("click");

    const command = layoutApi.saveLayout.mock.calls[0][0] as {
      regions: { id: string; blocks: { id: string; type: string; hidden: boolean }[] }[];
    };
    const mainRight = command.regions.find((region) => region.id === "mainRight");
    expect(mainRight?.blocks).toContainEqual(
      expect.objectContaining({ id: DOCUMENTS_BLOCK_ID, type: DOCUMENTS_BLOCK_ID, hidden: true }),
    );
  });
});
