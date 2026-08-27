import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createWrapperFactory } from "@/core/utilities/tests";
import ActivityRow from "./activity-row.vue";
import type { SalesRepActivityItemType } from "../types";

vi.mock("@/core/globals", () => ({ globals: { storeId: "test-store", cultureName: "en-US", currencyCode: "USD" } }));

function item(overrides: Partial<SalesRepActivityItemType> = {}): SalesRepActivityItemType {
  return {
    category: "orders",
    type: "orderPlaced",
    occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    precision: "exact",
    count: 1,
    organizationId: "org1",
    organizationName: "Acme",
    orderId: "ord1",
    orderNumber: "CU0001",
    status: "New",
    statusDisplayValue: "New",
    orderTotal: "$100.00",
    searchTerm: "",
    productId: "",
    productCode: "",
    productName: "",
    productImageUrl: "",
    ...overrides,
  };
}

// Props-exposing stub so the link targets can be asserted, not just their presence.
const VcLinkStub = { name: "VcLinkStub", props: ["to"], template: "<a><slot /></a>" };
const findLink = (wrapper: ReturnType<typeof createWrapper>) => wrapper.findComponent({ name: "VcLinkStub" });

const createWrapper = createWrapperFactory(mount, ActivityRow, {
  global: {
    renderStubDefaultSlot: false,
    stubs: {
      VcIcon: true,
      VcLink: VcLinkStub,
      OrderStatus: true,
    },
  },
});

const timeText = (wrapper: ReturnType<typeof createWrapper>) => wrapper.find(".activity-row__time").text();

describe("ActivityRow honest timestamps", () => {
  // GA hour-buckets must never read as an exact moment (contract): compact rows carry the "~" marker…
  it("prefixes the relative time with ~ for an hour-precision compact row", () => {
    const wrapper = createWrapper({ props: { item: item({ precision: "hour" }), compact: true } });

    expect(timeText(wrapper).startsWith("~")).toBe(true);
  });

  it("keeps the plain relative time for an exact compact row", () => {
    const wrapper = createWrapper({ props: { item: item(), compact: true } });

    expect(timeText(wrapper).startsWith("~")).toBe(false);
  });

  // …and full rows use the "during the hour of" phrasing instead of a fake exact timestamp.
  it("uses the during-hour phrasing for an hour-precision full row", () => {
    const wrapper = createWrapper({
      props: { item: item({ category: "logins", type: "login", precision: "hour", count: 3 }) },
    });

    // Empty test messages: t() echoes the key, which is exactly what pins the phrasing choice.
    expect(timeText(wrapper)).toContain("sales_rep.activity.time.during_hour");
  });
});

describe("ActivityRow per-type rendering", () => {
  it("links an order row to the order page", () => {
    const wrapper = createWrapper({ props: { item: item() } });
    const link = findLink(wrapper);

    expect(link.props("to")).toEqual({ name: "OrderDetails", params: { orderId: "ord1" } });
    expect(link.text()).toBe("#CU0001");
  });

  // Search-term rows deep-link to the catalog search results exactly as the header search navigates.
  it("links a search row to the catalog search results for that term", () => {
    const wrapper = createWrapper({
      props: { item: item({ category: "searches", type: "search", precision: "hour", searchTerm: "gloves" }) },
    });
    const link = findLink(wrapper);

    expect(link.props("to")).toEqual({ name: "Search", query: { q: "gloves" } });
  });

  // By product id, never a slug: /product/{id} always resolves, whereas the tracked SEO segment alone
  // is not a valid catalog URL (VCST-5337).
  it("links a resolved product view by its id and shows the bucket size", () => {
    const wrapper = createWrapper({
      props: {
        item: item({
          category: "productViews",
          type: "productView",
          precision: "hour",
          count: 4,
          productId: "p1",
          productName: "Gloves",
          productCode: "SKU-1",
        }),
      },
    });
    const link = findLink(wrapper);

    expect(link.props("to")).toEqual({ name: "Product", params: { productId: "p1" } });
    expect(wrapper.find(".activity-row__count").exists()).toBe(true);
  });

  // Unresolvable codes still identify the product — as plain text, since there is nowhere to link.
  it("renders an unresolved product view as plain text", () => {
    const wrapper = createWrapper({
      props: { item: item({ category: "productViews", type: "productView", productCode: "GONE-1" }) },
    });

    expect(findLink(wrapper).exists()).toBe(false);
    expect(wrapper.text()).toContain("GONE-1");
  });

  // A category the backend adds later still renders as a dated row instead of a blank.
  it("falls back to the generic wording for an unknown type", () => {
    const wrapper = createWrapper({ props: { item: item({ category: "webinars", type: "webinarAttended" }) } });

    expect(wrapper.text()).toContain("sales_rep.activity.rows.unknown");
  });
});
