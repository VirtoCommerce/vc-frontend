import { describe, it, expect, beforeEach, vi } from "vitest";

const hoisted = vi.hoisted(() => {
  const mockRouter = {
    currentRoute: {
      value: {
        matched: [] as { name?: string }[],
      },
    },
  };

  const matchingRouteName = { value: "" };

  const menuData = {
    header: {
      mobile: {
        main: [{ id: "catalog", title: "Catalog", icon: "icon", isCatalogItem: true }],
        purchasing: {
          id: "purchasing",
          title: "Purchasing",
          icon: "icon",
          children: [
            { id: "dashboard", route: { name: "Dashboard" }, title: "Dashboard", icon: "icon", priority: 10 },
            { id: "orders", route: { name: "Orders" }, title: "Orders", icon: "icon", priority: 20 },
            { id: "lists", route: { name: "Lists" }, title: "Lists", icon: "icon", priority: 30 },
            {
              id: "saved-for-later",
              route: { name: "SavedForLater" },
              title: "SavedForLater",
              icon: "icon",
              priority: 60,
            },
          ],
        },
        marketing: {
          id: "marketing",
          title: "Marketing",
          icon: "icon",
          children: [
            {
              id: "notifications",
              route: { name: "Notifications" },
              title: "Notifications",
              icon: "icon",
              priority: 10,
            },
            {
              id: "points-history",
              route: { name: "PointsHistory" },
              title: "Points History",
              icon: "icon",
              priority: 20,
            },
          ],
        },
        user: {
          id: "user",
          title: "User",
          icon: "icon",
          children: [
            { id: "profile", route: { name: "Profile" }, title: "Profile", icon: "icon", priority: 10 },
            { id: "addresses", route: { name: "Addresses" }, title: "Addresses", icon: "icon", priority: 20 },
            {
              id: "change-password",
              route: { name: "ChangePasswordAccount" },
              title: "Change Password",
              icon: "icon",
              priority: 30,
            },
            {
              id: "saved-cards",
              route: { name: "SavedCreditCards" },
              title: "Saved Cards",
              icon: "icon",
              priority: 40,
            },
          ],
        },
        corporate: {
          id: "corporate",
          title: "Corporate",
          icon: "icon",
          children: [
            { id: "company-info", route: { name: "CompanyInfo" }, title: "Company Info", icon: "icon", priority: 10 },
            {
              id: "company-members",
              route: { name: "CompanyMembers" },
              title: "Company Members",
              icon: "icon",
              priority: 20,
            },
          ],
        },
      },
    },
  };

  return {
    mockRouter,
    matchingRouteName,
    menuData,
  };
});

// Mock dependencies
vi.mock("@/core/globals", () => ({
  globals: {
    router: hoisted.mockRouter,
  },
}));

vi.mock("@/config/menu.json", () => ({
  default: hoisted.menuData,
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({
    currentCurrency: { value: { code: "USD" } },
  }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({
    themeContext: { value: { catalogId: "test", settings: {} } },
  }),
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: () => ({
    getSettingValue: () => undefined,
  }),
}));

vi.mock("@/core/api/graphql", () => ({
  getChildCategories: vi.fn(() => Promise.resolve([])),
  getMenu: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/core/utilities", () => ({
  convertToExtendedMenuLink: vi.fn((item) => item),
  getFilterExpressionForCategorySubtree: vi.fn(() => ""),
  getFilterExpressionForInStockVariations: vi.fn(() => ""),
  getFilterExpressionForZeroPrice: vi.fn(() => ""),
  Logger: { error: vi.fn() },
  categoryToExtendedMenuLink: vi.fn((item) => item),
  getTranslatedMenuLink: vi.fn((item) => item),
  isActiveRoute: vi.fn(() => false),
}));

async function importComposable() {
  const mod = await import("@/core/composables/useNavigations");
  return mod._useNavigations();
}

describe("useNavigations - mobilePreSelectedMenuItem", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    hoisted.mockRouter.currentRoute.value.matched = [];
    hoisted.matchingRouteName.value = "";
  });

  describe("Dashboard route", () => {
    it("returns undefined when on Dashboard page", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Dashboard" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value).toBeUndefined();
    });
  });

  describe("Special routes (Catalog, Category, Product)", () => {
    it("returns mobileCatalogMenuItem for Catalog route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Catalog" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("catalog");
    });

    it("returns mobileCatalogMenuItem for Category route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Category" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("catalog");
    });

    it("returns mobileCatalogMenuItem for Product route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Product" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("catalog");
    });
  });

  describe("Purchasing section routes", () => {
    it("returns mobilePurchasingMenuItem for Orders route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Orders" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("purchasing");
    });

    it("returns mobilePurchasingMenuItem for Lists route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Lists" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("purchasing");
    });

    it("returns mobilePurchasingMenuItem for SavedForLater route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "SavedForLater" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("purchasing");
    });
  });

  describe("Marketing section routes", () => {
    it("returns mobileMarketingMenuItem for Notifications route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Notifications" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("marketing");
    });

    it("returns mobileMarketingMenuItem for PointsHistory route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "PointsHistory" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("marketing");
    });
  });

  describe("User section routes", () => {
    it("returns mobileUserMenuItem for Profile route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Profile" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("user");
    });

    it("returns mobileUserMenuItem for Addresses route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Addresses" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("user");
    });

    it("returns mobileUserMenuItem for ChangePasswordAccount route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "ChangePasswordAccount" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("user");
    });

    it("returns mobileUserMenuItem for SavedCreditCards route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "SavedCreditCards" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("user");
    });
  });

  describe("Corporate section child routes", () => {
    it("returns mobileCorporateMenuItem for CompanyInfo route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "CompanyInfo" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("corporate");
    });

    it("returns mobileCorporateMenuItem for CompanyMembers route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "CompanyMembers" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("corporate");
    });
  });

  describe("Unknown routes", () => {
    it("returns undefined for unknown route", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "UnknownRoute" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value).toBeUndefined();
    });

    it("returns undefined when no route is matched", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value).toBeUndefined();
    });
  });

  describe("Priority: special routes over child routes", () => {
    it("prefers Catalog special route over any child route match", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Catalog" }, { name: "Orders" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("catalog");
    });

    it("prefers Company special route over corporate child route match", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Company" }, { name: "CompanyInfo" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value?.id).toBe("corporate");
    });

    it("Dashboard takes precedence over everything", async () => {
      hoisted.mockRouter.currentRoute.value.matched = [{ name: "Dashboard" }, { name: "Catalog" }, { name: "Orders" }];
      const navigations = await importComposable();
      expect(navigations.mobilePreSelectedMenuItem.value).toBeUndefined();
    });
  });
});
