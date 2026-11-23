import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, unref } from "vue";
import { BrowserTargetType } from "@/core/enums";
import Quotes from "./quotes.vue";
import type { PropType } from "vue";

// The module locale arrives after the page is set up, as it does on a full-page load.
const mocks = vi.hoisted(() => ({
  messages: {} as { value: Record<string, string> },
  usePageHead: vi.fn(),
}));

vi.mock("vue-i18n", async () => {
  const { ref: vueRef } = await import("vue");

  mocks.messages = vueRef<Record<string, string>>({});

  return {
    useI18n: () => ({ t: (key: string) => mocks.messages.value[key] ?? key }),
  };
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn(), resolve: () => ({ href: "/" }) }),
}));

vi.mock("@/core/composables", () => ({
  usePageHead: mocks.usePageHead,
  useBrowserTarget: () => ({ browserTarget: ref(BrowserTargetType.BLANK) }),
  useRouteQueryParam: () => ref("createdDate:desc"),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store", userId: "user", currencyCode: "USD", cultureName: "en-US" },
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock("../components/quote-status.vue", () => ({
  default: defineComponent({ name: "QuoteStatus", setup: () => () => h("span") }),
}));

vi.mock("../useUserQuotes", () => ({
  useUserQuotes: () => ({
    quotes: ref([{ id: "quote-1", number: "Q-0001", status: "Draft", createdDate: new Date("2026-01-01") }]),
    fetching: ref(false),
    pages: ref(1),
    page: ref(1),
    keyword: ref(""),
    sort: ref({ column: "createdDate", direction: "desc" }),
    fetchQuotes: vi.fn(),
  }),
}));

const VcWidgetStub = defineComponent({
  name: "VcWidget",

  setup(_, { slots }) {
    return () => h("div", slots["default-container"]?.());
  },
});

// Renders the column headers the way the kit table does: from the `columns` prop.
const VcTableStub = defineComponent({
  name: "VcTable",
  props: { columns: { type: Array as PropType<{ id: string; title: string }[]>, default: () => [] } },

  setup(props) {
    return () =>
      h("table", [
        h(
          "thead",
          props.columns.map((column) => h("th", { "data-test-id": `column-${column.id}` }, column.title)),
        ),
      ]);
  },
});

const QUOTES_LOCALE = {
  "quotes.meta.title": "Quote requests",
  "quotes.quote_number_label": "Quote number",
  "quotes.date_label": "Date",
  "quotes.status_label": "Status",
  "quotes.total_label": "Total",
};

function createComponent() {
  return mount(Quotes, {
    global: {
      mocks: { $t: (key: string) => mocks.messages.value[key] ?? key, $d: String },
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

describe("Quotes when the module locale loads after setup", () => {
  beforeEach(() => {
    mocks.messages.value = {};
    mocks.usePageHead.mockClear();
  });

  it("renders translated column headers once the locale arrives", async () => {
    const wrapper = createComponent();

    mocks.messages.value = QUOTES_LOCALE;
    await nextTick();

    expect(wrapper.findAll("th").map((th) => th.text())).toEqual(["Quote number", "Date", "Status", "Total"]);
  });

  it("gives the page a title that follows the locale", async () => {
    createComponent();

    mocks.messages.value = QUOTES_LOCALE;
    await nextTick();

    const [{ title }] = mocks.usePageHead.mock.calls[0] as [{ title: unknown }];

    expect(unref(title)).toBe("Quote requests");
  });
});
