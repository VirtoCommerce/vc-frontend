import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { DEFAULT_BRANDS_PER_PAGE } from "@/core/constants/brands";
import { useBrands } from "./useBrands";

const useGetBrandsMock = vi.hoisted(() => vi.fn());

vi.mock("@/core/api/graphql/catalog", () => ({
  useGetBrands: useGetBrandsMock,
}));

vi.mock("vue-i18n", () => {
  return {
    useI18n: vi.fn().mockReturnValue({
      t: (key: string) => key,
      te: (key: string) => key,
    }),
  };
});

describe("useBrands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [
            { id: "1", name: "Apple", featured: true },
            { id: "2", name: "Banana", featured: false },
            { id: "3", name: "Cherry", featured: false },
          ],
          totalCount: 3,
        },
      }),
      loading: ref(false),
    });
  });

  it("should initialize with default values", () => {
    const { loading, page, itemsPerPage, search, pages } = useBrands();

    expect(loading.value).toBe(false);
    expect(page.value).toBe(1);
    expect(itemsPerPage.value).toBe(DEFAULT_BRANDS_PER_PAGE);
    expect(search.value).toBe("");
    expect(pages.value).toBe(1);
  });

  it("should return all brands when search is empty", () => {
    const { groupedBrands, search } = useBrands();

    expect(search.value).toBe("");
    expect(Object.keys(groupedBrands.value).length).toBe(3);
  });

  it("should filter brands based on search term", () => {
    const { groupedBrands, search } = useBrands();

    search.value = "app";
    expect(Object.keys(groupedBrands.value).length).toBe(1);

    search.value = "z";
    expect(Object.keys(groupedBrands.value).length).toBe(0);
  });

  it("should return featured brands", () => {
    const { featuredBrands } = useBrands();

    expect(featuredBrands.value).toHaveLength(1);
    expect(featuredBrands.value[0].name).toBe("Apple");
  });

  it("should group brands by first letter", () => {
    const { groupedBrands } = useBrands();

    expect(groupedBrands.value).toHaveProperty("A");
    expect(groupedBrands.value["A"]).toHaveLength(1);
    expect(groupedBrands.value["A"][0].name).toBe("Apple");

    expect(groupedBrands.value).toHaveProperty("B");
    expect(groupedBrands.value["B"]).toHaveLength(1);
    expect(groupedBrands.value["B"][0].name).toBe("Banana");

    expect(groupedBrands.value).toHaveProperty("C");
    expect(groupedBrands.value["C"]).toHaveLength(1);
    expect(groupedBrands.value["C"][0].name).toBe("Cherry");
  });

  it("should calculate pages based on total count and items per page", () => {
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [],
          totalCount: 25,
        },
      }),
      loading: ref(false),
    });

    const { pages } = useBrands({ itemsPerPage: 10 });
    expect(pages.value).toBe(3);
  });

  it("should handle empty brand list", () => {
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [],
          totalCount: 0,
        },
      }),
      loading: ref(false),
    });

    const { groupedBrands, featuredBrands, pages } = useBrands();

    expect(Object.keys(groupedBrands.value).length).toBe(0);
    expect(featuredBrands.value).toHaveLength(0);
    expect(pages.value).toBe(0);
  });

  it("should handle loading state", () => {
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [],
          totalCount: 0,
        },
      }),
      loading: ref(true),
    });

    const { loading } = useBrands();
    expect(loading.value).toBe(true);
  });

  it("should handle brands with special characters or numbers in name", () => {
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [
            { id: "1", name: "123Brand", featured: false },
            { id: "2", name: "#Special", featured: false },
          ],
          totalCount: 2,
        },
      }),
      loading: ref(false),
    });

    const { groupedBrands } = useBrands();
    expect(groupedBrands.value).toHaveProperty("numbers");
    expect(groupedBrands.value["numbers"]).toHaveLength(1);
    expect(groupedBrands.value["numbers"][0].name).toBe("123Brand");

    expect(groupedBrands.value).toHaveProperty("others");
    expect(groupedBrands.value["others"]).toHaveLength(1);
    expect(groupedBrands.value["others"][0].name).toBe("#Special");
  });

  it("should handle case insensitive search", () => {
    const { groupedBrands, search } = useBrands();

    search.value = "APPLE";
    expect(Object.keys(groupedBrands.value).length).toBe(1);
    expect(groupedBrands.value["A"][0].name).toBe("Apple");

    search.value = "banana";
    expect(Object.keys(groupedBrands.value).length).toBe(1);
    expect(groupedBrands.value["B"][0].name).toBe("Banana");
  });

  it("should handle brands with null name property", () => {
    useGetBrandsMock.mockReturnValue({
      result: ref({
        brands: {
          items: [{ id: "1", name: null, featured: false }],
          totalCount: 1,
        },
      }),
      loading: ref(false),
    });

    const { groupedBrands } = useBrands();
    expect(Object.keys(groupedBrands.value)).toContain("others");
  });

  it("should provide brandNavIndex with the expected keys", () => {
    const { brandNavIndex } = useBrands();

    expect(brandNavIndex).toHaveProperty("all");
    expect(brandNavIndex).toHaveProperty("numbers");
    expect(brandNavIndex).toHaveProperty("others");

    expect(brandNavIndex).toHaveProperty("A");
    expect(brandNavIndex).toHaveProperty("Z");
  });

  it("should not change pages when search value changes", () => {
    const { pages, search } = useBrands();
    expect(pages.value).toBe(1);
    search.value = "z";
    expect(pages.value).toBe(1);
  });

  it("should override default sort via variables", () => {
    const customSort = "price:desc";
    useBrands(undefined, { sort: customSort });
    expect(useGetBrandsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: customSort,
      }),
    );
  });
});
