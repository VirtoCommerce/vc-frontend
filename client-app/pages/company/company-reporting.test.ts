import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import CompanyReporting from "./company-reporting.vue";
import type { Ref } from "vue";

type ScopeType = { organization: true; memberId?: string } | undefined;

const h = vi.hoisted(() => {
  const state = {} as {
    report: Record<string, Ref<unknown>>;
    members: {
      options: Ref<{ id: string; name: string }[]>;
      totalCount: Ref<number>;
      loading: Ref<boolean>;
      failed: Ref<boolean>;
    };
    memberId: Ref<string>;
    period: Ref<string>;
    scope: () => ScopeType;
  };
  return state;
});

vi.mock("@/shared/account/composables/useAccountSalesReport", () => ({
  useAccountSalesReport: (_period: unknown, scope: { value: ScopeType }) => {
    h.scope = () => scope.value;
    return h.report;
  },
}));
vi.mock("@/shared/company", () => ({
  COMPANY_REPORTING_ALL_MEMBERS: "",
  useOrganizationBuyerOptions: () => h.members,
  useCompanyReportingParams: () => ({ period: h.period, memberId: h.memberId }),
}));
vi.mock("@/shared/account", () => ({ useUser: () => ({ organization: ref({ id: "org-1" }) }) }));
vi.mock("@/shared/dashboard", () => ({ formatStatCount: (count: number) => String(count) }));
vi.mock("@/core/composables", () => ({ usePageHead: vi.fn() }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
    n: (value: number) => String(value),
  }),
}));

// Mirrors the panel's contract: its props, the `update:period` of its v-model and its `actions` slot.
vi.mock("@/shared/reporting", async () => {
  const { defineComponent: define } = await import("vue");
  return {
    ReportingPanel: define({
      name: "ReportingPanel",
      props: ["period", "data", "loading", "error", "withTiles", "withTable"],
      emits: { "update:period": (value: unknown) => typeof value === "string" },
      template: '<div class="panel"><slot name="actions" /><slot name="footnote-append" /></div>',
    }),
  };
});

const ReportingPanelStub = { name: "ReportingPanel" };

const VcSelectStub = defineComponent({
  name: "VcSelect",
  props: ["modelValue", "items", "disabled", "error", "message", "textField", "valueField"],
  emits: { change: (value: unknown) => value === undefined || typeof value === "string" },
  template: "<div />",
});

function mountPage() {
  return mount(CompanyReporting, {
    global: {
      stubs: {
        VcTypography: { template: "<div><slot /></div>" },
        VcWidget: { template: '<div><slot name="header" /><slot /></div>' },
        VcLink: { name: "VcLink", props: ["to"], template: "<a><slot /></a>" },
        VcIcon: true,
        VcEmptyView: { props: ["text"], template: "<div>{{ text }}</div>" },
        VcSelect: VcSelectStub,
      },
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
      },
    },
  });
}

beforeEach(() => {
  h.report = {
    data: ref(undefined),
    excludedCount: ref(0),
    hasOrders: ref(true),
    loading: ref(false),
    failed: ref(false),
  };
  h.members = {
    options: ref([
      { id: "c-1", name: "Alice" },
      { id: "c-2", name: "Bob" },
    ]),
    totalCount: ref(2),
    loading: ref(false),
    failed: ref(false),
  };
  h.memberId = ref("");
  h.period = ref("year");
});

describe("CompanyReporting", () => {
  it("shows the organization's report like the Sales Rep Hub Reporting page: tiles and table on", () => {
    const panel = mountPage().findComponent(ReportingPanelStub);

    expect(panel.props()).toMatchObject({ period: "year", loading: false, error: false });
    // Left at the panel's defaults, which are on.
    expect(panel.props("withTiles")).toBeUndefined();
    expect(panel.props("withTable")).toBeUndefined();
  });

  it("asks for the whole organization by default", () => {
    mountPage();

    expect(h.scope()).toEqual({ organization: true, memberId: undefined });
  });

  it("lists All members with their count first, then every member", () => {
    const select = mountPage().findComponent(VcSelectStub);

    expect(select.props("items")).toEqual([
      { id: "", name: 'pages.company.reporting.all_members:{"count":"2"}' },
      { id: "c-1", name: "Alice" },
      { id: "c-2", name: "Bob" },
    ]);
    expect(select.props("modelValue")).toBe("");
  });

  it("narrows the report to the picked member, and back to the organization", async () => {
    const select = mountPage().findComponent(VcSelectStub);

    select.vm.$emit("change", "c-2");
    await nextTick();

    expect(h.memberId.value).toBe("c-2");
    expect(h.scope()).toEqual({ organization: true, memberId: "c-2" });

    // The kit emits nothing when the picker is cleared: that is All members.
    select.vm.$emit("change", undefined);
    await nextTick();

    expect(h.memberId.value).toBe("");
  });

  it("shows no count while the members load, and names a failed list on the field", () => {
    h.members.loading.value = true;
    let select = mountPage().findComponent(VcSelectStub);

    expect(select.props("items")[0]).toEqual({ id: "", name: "pages.company.reporting.all_members_plain" });
    expect(select.props("disabled")).toBe(true);

    h.members.loading.value = false;
    h.members.failed.value = true;
    select = mountPage().findComponent(VcSelectStub);

    expect(select.props()).toMatchObject({ error: true, message: "pages.company.reporting.members_failed" });
  });

  it("shows the empty state for an organization that never ordered", () => {
    h.report.hasOrders.value = false;
    const wrapper = mountPage();

    expect(wrapper.find('[data-test-id="company-reporting-empty-section"]').exists()).toBe(true);
    expect(wrapper.findComponent(ReportingPanelStub).exists()).toBe(false);
  });

  it("shows a failed read rather than the empty state", () => {
    h.report.hasOrders.value = false;
    h.report.failed.value = true;

    expect(mountPage().findComponent(ReportingPanelStub).props("error")).toBe(true);
  });

  it("says how many orders in other currencies are left out", () => {
    h.report.excludedCount.value = 2;

    // In the panel's own footnote row, so it follows the panel's loading and error states.
    expect(mountPage().findComponent(ReportingPanelStub).text()).toContain(
      'shared.account.dashboard.excluded_orders:{"count":"2"}',
    );
  });

  it("links to the orders list", () => {
    expect(mountPage().findComponent({ name: "VcLink" }).props("to")).toEqual({ name: "Orders" });
  });
});
