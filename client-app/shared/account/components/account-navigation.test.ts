import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AccountNavigation from "./account-navigation.vue";

type MenuItemType = { title: string; priority?: number; children?: { id: string }[] };
type SectionType = {
  id: string;
  title: string;
  priority?: number;
  children: { id: string }[];
  isVisible?: { value: boolean };
};

const h = vi.hoisted(() => ({
  isCorporateMember: { value: false },
  purchasing: { value: undefined as MenuItemType | undefined },
  marketing: { value: undefined as MenuItemType | undefined },
  user: { value: undefined as MenuItemType | undefined },
  corporate: { value: undefined as MenuItemType | undefined },
  registered: { value: [] as SectionType[] },
}));

vi.mock("@/core/composables", () => ({
  useNavigations: () => ({
    desktopPurchasingMenuItems: h.purchasing,
    desktopMarketingMenuItems: h.marketing,
    desktopUserMenuItems: h.user,
    desktopCorporateMenuItems: h.corporate,
    registeredAccountSections: h.registered,
  }),
}));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ isCorporateMember: h.isCorporateMember }),
}));

vi.mock("@/core/utilities", () => ({
  // Passthrough — the merge logic under test, not translation, is what matters here.
  getTranslatedMenuLink: (link: unknown) => link,
}));

const stubs = {
  VcWidget: { props: ["title"], template: `<div :data-title="title"><slot name="default-container" /></div>` },
  ExtensionPoint: { template: `<div><slot /></div>` },
  LinkDefault: { props: ["item"], template: `<span />` },
};

function renderedSectionTitles() {
  return mount(AccountNavigation, { global: { stubs } })
    .findAll("[data-title]")
    .map((w) => w.attributes("data-title"));
}

describe("account-navigation sections merge", () => {
  beforeEach(() => {
    h.isCorporateMember.value = false;
    h.purchasing.value = { title: "Purchasing", priority: 10, children: [{ id: "orders" }] };
    h.marketing.value = { title: "Marketing", priority: 20, children: [{ id: "coupons" }] };
    h.user.value = { title: "User", priority: 40, children: [{ id: "profile" }] };
    h.corporate.value = { title: "Corporate", priority: 30, children: [{ id: "info" }] };
    h.registered.value = [];
  });

  it("orders built-in sections by priority and hides Corporate for personal accounts", () => {
    expect(renderedSectionTitles()).toEqual(["Purchasing", "Marketing", "User"]);
  });

  it("inserts Corporate (by priority) for corporate members", () => {
    h.isCorporateMember.value = true;
    expect(renderedSectionTitles()).toEqual(["Purchasing", "Marketing", "Corporate", "User"]);
  });

  it("omits Marketing when it has no children", () => {
    h.marketing.value = { title: "Marketing", priority: 20, children: [] };
    expect(renderedSectionTitles()).toEqual(["Purchasing", "User"]);
  });

  it("interleaves a visible registered section by its priority", () => {
    h.registered.value = [
      { id: "hub", title: "Hub", priority: 5, children: [{ id: "mc" }], isVisible: { value: true } },
    ];
    expect(renderedSectionTitles()).toEqual(["Hub", "Purchasing", "Marketing", "User"]);
  });

  it("excludes a registered section whose isVisible is false", () => {
    h.registered.value = [
      { id: "hub", title: "Hub", priority: 5, children: [{ id: "mc" }], isVisible: { value: false } },
    ];
    expect(renderedSectionTitles()).toEqual(["Purchasing", "Marketing", "User"]);
  });
});
