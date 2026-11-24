import { beforeEach, describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { useBreadcrumbs } from "./useBreadcrumbs";

const i18n = await vi.hoisted(async () => {
  const { ref: createRef } = await import("vue");
  return { locale: createRef("en") };
});

const messages: Record<string, Record<string, string>> = {
  en: { "common.links.home": "Home", "common.links.loyalty_catalog": "Loyalty catalog" },
  de: { "common.links.home": "Startseite" },
};

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => messages[i18n.locale.value]?.[key] ?? key,
  }),
}));

const currentRoute = { path: "/" };

vi.mock("vue-router", () => ({
  useRoute: () => currentRoute,
}));

describe("useBreadcrumbs", () => {
  beforeEach(() => {
    i18n.locale.value = "en";
  });

  it("should add a homepage link at the beginning of the breadcrumbs array", () => {
    const breadcrumbs = [{ title: "Products", route: "/products" }];
    const result = useBreadcrumbs(breadcrumbs);

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "Products", route: "/products" },
    ]);
  });

  it("should work with an empty array of breadcrumbs", () => {
    const breadcrumbs: IBreadcrumb[] = [];
    const result = useBreadcrumbs(breadcrumbs);

    expect(result.value).toEqual([{ title: "Home", route: "/" }]);
  });

  it("should work with a function that returns breadcrumbs", () => {
    const getBreadcrumbs = () => [
      { title: "Products", route: "/products" },
      { title: "Category", route: "/products/category" },
    ];

    const result = useBreadcrumbs(getBreadcrumbs);

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "Products", route: "/products" },
      { title: "Category", route: "/products/category" },
    ]);
  });

  it("should work with a reactive reference to breadcrumbs", () => {
    const breadcrumbsRef = ref([{ title: "Products", route: "/products" }]);

    const result = useBreadcrumbs(breadcrumbsRef);

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "Products", route: "/products" },
    ]);

    // Update the reactive reference
    breadcrumbsRef.value = [
      { title: "Products", route: "/products" },
      { title: "Category", route: "/products/category" },
    ];

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "Products", route: "/products" },
      { title: "Category", route: "/products/category" },
    ]);
  });

  it("should work with a computed reference to breadcrumbs", () => {
    const source = ref("products");
    const breadcrumbsComputed = computed(() => [{ title: source.value, route: `/${source.value}` }]);

    const result = useBreadcrumbs(breadcrumbsComputed);

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "products", route: "/products" },
    ]);

    // Update the source
    source.value = "categories";

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "categories", route: "/categories" },
    ]);
  });

  it("should handle breadcrumbs with route objects", () => {
    const breadcrumbs = [{ title: "Orders", route: { name: "Orders" } }, { title: "Order #123" }];

    const result = useBreadcrumbs(breadcrumbs);

    expect(result.value).toEqual([
      { title: "Home", route: "/" },
      { title: "Orders", route: { name: "Orders" } },
      { title: "Order #123" },
    ]);
  });

  it("translates the homepage link again when the locale changes", () => {
    const result = useBreadcrumbs([{ title: "Products", route: "/products" }]);

    expect(result.value[0]).toEqual({ title: "Home", route: "/" });

    i18n.locale.value = "de";

    expect(result.value).toEqual([
      { title: "Startseite", route: "/" },
      { title: "Products", route: "/products" },
    ]);
  });

  describe("loyalty-catalog namespace", () => {
    it("should prepend a Loyalty catalog crumb on inner /loyalty-catalog routes", () => {
      currentRoute.path = "/loyalty-catalog/camcorders/aerial-drones/3dr-solo";
      try {
        const breadcrumbs = [{ title: "3DR Solo" }];
        const result = useBreadcrumbs(breadcrumbs);

        expect(result.value).toEqual([
          { title: "Home", route: "/" },
          { title: "Loyalty catalog", route: "/loyalty-catalog" },
          { title: "3DR Solo" },
        ]);
      } finally {
        currentRoute.path = "/";
      }
    });

    it("should NOT prepend a Loyalty catalog crumb on the namespace root itself", () => {
      currentRoute.path = "/loyalty-catalog";
      try {
        const result = useBreadcrumbs([]);
        expect(result.value).toEqual([{ title: "Home", route: "/" }]);
      } finally {
        currentRoute.path = "/";
      }
    });
  });
});
