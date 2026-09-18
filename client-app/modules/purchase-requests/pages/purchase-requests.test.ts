import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import PurchaseRequests from "./purchase-requests.vue";
import type { VueWrapper } from "@vue/test-utils";

const routerPush = vi.fn();

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/core/composables/usePageHead", () => ({
  usePageHead: vi.fn(),
}));

vi.mock("@/modules/purchase-requests/composables/usePurchaseRequests", () => ({
  usePurchaseRequests: () => ({
    loading: ref(false),
    purchaseRequests: ref([
      { id: "pr-1", number: "PR-0001", createdDate: new Date("2026-01-01") },
      { id: "pr-2", number: "PR-0002", createdDate: new Date("2026-01-02") },
    ]),
    pages: ref(1),
    page: ref(1),
    sort: ref({ column: "createdDate", direction: "desc" }),
  }),
}));

vi.mock("@/modules/purchase-requests/components/from-file.vue", () => ({
  default: defineComponent({ name: "FromFile", setup: () => () => h("div") }),
}));

const VcWidgetStub = defineComponent({
  name: "VcWidget",

  setup(_, { slots }) {
    return () => h("div", slots["default-container"]?.());
  },
});

const VcTableStub = defineComponent({
  name: "VcTable",
  props: { items: { type: Array, default: () => [] } },

  setup(_, { slots }) {
    return () => h("table", [h("tbody", slots["desktop-body"]?.())]);
  },
});

function createComponent() {
  return mount(PurchaseRequests, {
    global: {
      mocks: { $t: (key: string) => key, $d: String },
      stubs: {
        VcWidget: VcWidgetStub,
        VcTable: VcTableStub,
        VcTypography: true,
        VcEmptyView: true,
      },
    },
  });
}

function secondRow(wrapper: VueWrapper) {
  return wrapper.findAll("tbody tr")[1];
}

describe("PurchaseRequests", () => {
  beforeEach(() => {
    routerPush.mockClear();
  });

  it("opens a purchase request when its row is clicked", async () => {
    const wrapper = createComponent();

    await secondRow(wrapper).trigger("click");

    expect(routerPush).toHaveBeenCalledWith({ name: "PurchaseRequest", params: { purchaseRequestId: "pr-2" } });
  });

  it.each([
    ["Enter", { key: "Enter" }],
    ["Space", { key: " " }],
  ])("opens a purchase request when %s is pressed on its focused row", async (_label, event) => {
    const wrapper = createComponent();

    await secondRow(wrapper).trigger("keydown", event);

    expect(routerPush).toHaveBeenCalledWith({ name: "PurchaseRequest", params: { purchaseRequestId: "pr-2" } });
  });

  it("exposes every row to keyboard users", () => {
    const rows = createComponent().findAll("tbody tr");

    expect(rows).toHaveLength(2);

    for (const row of rows) {
      expect(row.attributes("tabindex")).toBe("0");
    }
  });
});
