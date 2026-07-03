import { describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { PRODUCT_SORTING_LIST } from "@/core/constants/products";
import { useProductSortings } from "./useProductSortings";
import type { ProductSortingType } from "@/core/api/graphql/types";
import type { Ref, WritableComputedRef } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}));

function def(overrides: Partial<ProductSortingType> & { id: string }): ProductSortingType {
  return { name: overrides.id, isDefault: false, selected: false, ...overrides };
}

function writableParam(initial: string): WritableComputedRef<string> {
  const raw = ref(initial);
  return computed({
    get: () => raw.value,
    set: (value) => {
      raw.value = value;
    },
  });
}

function sortingsRef(definitions: ProductSortingType[] = []): Ref<ProductSortingType[]> {
  return ref(definitions);
}

describe("useProductSortings", () => {
  describe("sortList", () => {
    it("falls back to the hardcoded list when there are no backend definitions", () => {
      const { sortList } = useProductSortings(sortingsRef(), writableParam(""));

      expect(sortList.value).toEqual(PRODUCT_SORTING_LIST.map((item) => ({ id: item.id, name: item.name })));
    });

    it("maps backend definitions and routes the default option to an empty id", () => {
      const { sortList } = useProductSortings(
        sortingsRef([
          def({ id: "featured", name: "Featured", isDefault: true }),
          def({ id: "price-ascending", name: "Price", selected: true }),
        ]),
        writableParam(""),
      );

      expect(sortList.value).toEqual([
        { id: "", name: "Featured" },
        { id: "price-ascending", name: "Price" },
      ]);
    });

    it("falls back to the id when a definition has no name", () => {
      const { sortList } = useProductSortings(sortingsRef([def({ id: "custom", name: undefined })]), writableParam(""));

      expect(sortList.value).toEqual([{ id: "custom", name: "custom" }]);
    });

    it("reacts to the sortings source changing", () => {
      const sortings = sortingsRef();
      const { sortList } = useProductSortings(sortings, writableParam(""));

      expect(sortList.value).toHaveLength(PRODUCT_SORTING_LIST.length);

      sortings.value = [def({ id: "price-ascending", name: "Price", selected: true })];

      expect(sortList.value).toEqual([{ id: "price-ascending", name: "Price" }]);
    });
  });

  describe("selectedSort", () => {
    it("returns undefined before the first backend response (initial load)", () => {
      const { selectedSort } = useProductSortings(sortingsRef(), writableParam(""));

      expect(selectedSort.value).toBeUndefined();
    });

    it("mirrors the backend-selected option", () => {
      const { selectedSort } = useProductSortings(
        sortingsRef([
          def({ id: "featured", name: "Featured", isDefault: true }),
          def({ id: "price-ascending", name: "Price", selected: true }),
        ]),
        writableParam("price-ascending"),
      );

      expect(selectedSort.value).toBe("price-ascending");
    });

    it("maps the selected default option to the empty id", () => {
      const { selectedSort } = useProductSortings(
        sortingsRef([
          def({ id: "featured", name: "Featured", isDefault: true, selected: true }),
          def({ id: "price-ascending", name: "Price" }),
        ]),
        writableParam(""),
      );

      expect(selectedSort.value).toBe("");
    });

    it("returns undefined when nothing is selected (hidden, unknown, or raw sort)", () => {
      const { selectedSort } = useProductSortings(
        sortingsRef([
          def({ id: "featured", name: "Featured", isDefault: true }),
          def({ id: "price-ascending", name: "Price" }),
        ]),
        writableParam("name-ascending"),
      );

      expect(selectedSort.value).toBeUndefined();
    });

    it("writes straight through to the underlying query param", () => {
      const param = writableParam("");
      const { selectedSort } = useProductSortings(sortingsRef(), param);

      selectedSort.value = "price-ascending";
      expect(param.value).toBe("price-ascending");

      selectedSort.value = undefined;
      expect(param.value).toBe("");
    });
  });
});
