import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useBrands } from "./useBrands";

// const mockData = vi.hoisted(() => ({
//   result: ref({
//     brands: {
//       items: [
//         { id: "1", name: "Apple", featured: true },
//         { id: "2", name: "Banana", featured: false },
//         { id: "3", name: "Cherry", featured: false },
//       ],
//       totalCount: 3,
//     },
//   }),
//   loading: ref(false),
// }));

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
    const { loading, page, itemsPerPage, search, pages } = useBrands({ itemsPerPage: 10 });

    expect(loading.value).toBe(false);
    expect(page.value).toBe(1);
    expect(itemsPerPage.value).toBe(10);
    expect(search.value).toBe("");
    expect(pages.value).toBe(1);
  });

  it("should return all brands when search is empty", () => {
    const { groupedBrands, search } = useBrands({ itemsPerPage: 10 });

    expect(search.value).toBe("");
    expect(Object.keys(groupedBrands.value).length).toBe(3);
  });

  it("should filter brands based on search term", () => {
    const { groupedBrands, search } = useBrands({ itemsPerPage: 10 });

    search.value = "app";
    expect(Object.keys(groupedBrands.value).length).toBe(1);

    search.value = "z";
    expect(Object.keys(groupedBrands.value).length).toBe(0);
  });

  it("should return featured brands", () => {
    const { featuredBrands } = useBrands({ itemsPerPage: 10 });

    expect(featuredBrands.value).toHaveLength(1);
    expect(featuredBrands.value[0].name).toBe("Apple");
  });

  it("should group brands by first letter", () => {
    const { groupedBrands } = useBrands({ itemsPerPage: 10 });

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
    // Mock a different total count
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
});
