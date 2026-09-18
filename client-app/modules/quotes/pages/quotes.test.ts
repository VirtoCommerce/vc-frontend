import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { BrowserTargetType } from "@/core/enums";
import Quotes from "./quotes.vue";
import type { VueWrapper } from "@vue/test-utils";

const openedWindow = { focus: vi.fn() };

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    resolve: ({ name, params }: { name: string; params: Record<string, string> }) => ({
      href: `/${name}/${params.quoteId}`,
    }),
  }),
}));

vi.mock("@/core/composables", () => ({
  usePageHead: vi.fn(),
  useBrowserTarget: () => ({ browserTarget: ref(BrowserTargetType.BLANK) }),
  useRouteQueryParam: () => ref("createdDate:desc"),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store", userId: "user", currencyCode: "USD", cultureName: "en-US" },
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("../useUserQuotes", () => ({
  useUserQuotes: () => ({
    quotes: ref([
      { id: "quote-1", number: "Q-0001", status: "Draft", createdDate: new Date("2026-01-01") },
      { id: "quote-2", number: "Q-0002", status: "Approved", createdDate: new Date("2026-01-02") },
    ]),
    fetching: ref(false),
    pages: ref(1),
    page: ref(1),
    keyword: ref(""),
    sort: ref({ column: "createdDate", direction: "desc" }),
    fetchQuotes: vi.fn(),
  }),
}));

vi.mock("../components/quote-status.vue", () => ({
  default: defineComponent({ name: "QuoteStatus", setup: () => () => h("span") }),
}));

const VcWidgetStub = defineComponent({
  name: "VcWidget",

  setup(_, { slots }) {
    return () => h("div", slots["default-container"]?.());
  },
});

const VcTableStub = defineComponent({
  name: "VcTable",

  setup(_, { slots }) {
    return () => h("table", [h("tbody", slots["desktop-body"]?.())]);
  },
});

function createComponent() {
  return mount(Quotes, {
    global: {
      mocks: { $t: (key: string) => key, $d: String },
      stubs: {
        VcWidget: VcWidgetStub,
        VcTable: VcTableStub,
        VcTypography: true,
        VcButton: true,
        VcInput: true,
        VcEmptyView: true,
      },
    },
  });
}

function secondRow(wrapper: VueWrapper) {
  return wrapper.findAll("tbody tr")[1];
}

describe("Quotes", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "open",
      vi.fn(() => openedWindow),
    );
  });

  it("opens a quote when its row is clicked", async () => {
    const wrapper = createComponent();

    await secondRow(wrapper).trigger("click");

    expect(window.open).toHaveBeenCalledWith("/ViewQuote/quote-2", "_blank");
  });

  it.each([
    ["Enter", { key: "Enter" }],
    ["Space", { key: " " }],
  ])("opens a quote when %s is pressed on its focused row", async (_label, event) => {
    const wrapper = createComponent();

    await secondRow(wrapper).trigger("keydown", event);

    expect(window.open).toHaveBeenCalledWith("/ViewQuote/quote-2", "_blank");
  });

  it("exposes every row to keyboard users", () => {
    const rows = createComponent().findAll("tbody tr");

    expect(rows).toHaveLength(2);

    for (const row of rows) {
      expect(row.attributes("tabindex")).toBe("0");
    }
  });
});
