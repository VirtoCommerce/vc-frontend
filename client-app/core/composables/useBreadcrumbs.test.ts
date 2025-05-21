import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { useBreadcrumbs } from "./useBreadcrumbs";

// Mock the useI18n composable
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => (key === "common.links.home" ? "Home" : key),
  }),
}));

describe("useBreadcrumbs", () => {
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
});
