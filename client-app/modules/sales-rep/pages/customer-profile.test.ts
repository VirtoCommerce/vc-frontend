import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import CustomerProfile from "./customer-profile.vue";

const state = await vi.hoisted(async () => {
  const { ref } = await import("vue");
  return {
    customer: ref<Record<string, unknown> | undefined>(undefined),
    loading: ref(false),
    failed: ref(false),
    notFound: ref(false),
  };
});

vi.mock("../composables/useSalesRepCustomer", () => ({
  useSalesRepCustomer: () => ({
    customer: state.customer,
    loading: state.loading,
    failed: state.failed,
    notFound: state.notFound,
  }),
}));
vi.mock("../composables/useSalesRepCustomerWidgets", async () => {
  const { ref } = await import("vue");
  return { useSalesRepCustomerWidgets: () => ({ cards: ref([]) }) };
});
vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");
  return { useBreadcrumbs: () => ref([]), usePageHead: vi.fn() };
});

const createWrapper = createWrapperFactory(mount, CustomerProfile, {
  props: { organizationId: "org-1" },
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcBreadcrumbs: true,
      VcEmptyView: true,
      VcButton: true,
      VcTypography: true,
      VcImage: true,
      VcIcon: true,
      LayoutSurface: true,
    },
  },
});

const emptyView = (wrapper: ReturnType<typeof createWrapper>) => wrapper.find("vc-empty-view-stub");

beforeEach(() => {
  state.customer.value = undefined;
  state.loading.value = false;
  state.failed.value = false;
  state.notFound.value = false;
});

describe("CustomerProfile states", () => {
  it("shows the profile once the customer resolved", () => {
    state.customer.value = { organizationId: "org-1", organizationName: "Acme" };

    const wrapper = createWrapper();

    expect(emptyView(wrapper).exists()).toBe(false);
    expect(wrapper.find("layout-surface-stub").exists()).toBe(true);
  });

  it("words an unserved or unknown organization as not found", () => {
    state.notFound.value = true;

    const wrapper = createWrapper();

    expect(emptyView(wrapper).attributes("text")).toBe("sales_rep.customer_profile.not_found");
    expect(emptyView(wrapper).attributes("variant")).toBe("empty");
  });

  // A server failure used to land in the not-found view, telling the rep this customer isn't theirs.
  it("words a failed read as a load failure, not as not found", () => {
    state.failed.value = true;

    const wrapper = createWrapper();

    expect(emptyView(wrapper).attributes("text")).toBe("sales_rep.customer_profile.load_failed");
    expect(emptyView(wrapper).attributes("variant")).toBe("error");
    expect(wrapper.find("layout-surface-stub").exists()).toBe(false);
  });
});
