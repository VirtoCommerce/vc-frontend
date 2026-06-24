import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { PRODUCT_SORTING_LIST } from "@/core/constants/products";
import {
  setProductSortDefinitions,
  useProductSortDefinitions,
  useSelectedSortOption,
} from "./useProductSortDefinitions";
import type { SortDefinitionType } from "@/core/api/graphql/types";
import type { WritableComputedRef } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: vi.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}));

function def(overrides: Partial<SortDefinitionType> & { id: string }): SortDefinitionType {
  return { id: overrides.id, name: overrides.id, isDefault: false, selected: false, ...overrides };
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

describe("useProductSortDefinitions", () => {
  beforeEach(() => {
    setProductSortDefinitions([]); // reset the module-level singleton between tests
  });

  describe("sortList", () => {
    it("falls back to the hardcoded list when there are no backend definitions", () => {
      const { sortList } = useProductSortDefinitions();

      expect(sortList.value).toEqual(PRODUCT_SORTING_LIST.map((item) => ({ id: item.id, name: item.name })));
    });

    it("maps backend definitions and routes the default option to an empty id", () => {
      setProductSortDefinitions([
        def({ id: "featured", name: "Featured", isDefault: true }),
        def({ id: "price-ascending", name: "Price", selected: true }),
      ]);

      const { sortList } = useProductSortDefinitions();

      expect(sortList.value).toEqual([
        { id: "", name: "Featured" },
        { id: "price-ascending", name: "Price" },
      ]);
    });

    it("falls back to the id when a definition has no name", () => {
      setProductSortDefinitions([def({ id: "custom", name: null })]);

      const { sortList } = useProductSortDefinitions();

      expect(sortList.value).toEqual([{ id: "custom", name: "custom" }]);
    });
  });

  describe("useSelectedSortOption", () => {
    beforeEach(() => {
      setProductSortDefinitions([
        def({ id: "featured", name: "Featured", isDefault: true }),
        def({ id: "price-ascending", name: "Price" }),
      ]);
    });

    it("passes through a value that matches a visible option", () => {
      const selected = useSelectedSortOption(writableParam("price-ascending"));

      expect(selected.value).toBe("price-ascending");
    });

    it("snaps an unknown or now-hidden value to the default empty option", () => {
      const selected = useSelectedSortOption(writableParam("does-not-exist"));

      expect(selected.value).toBe("");
    });

    it("treats the empty default as a valid option", () => {
      const selected = useSelectedSortOption(writableParam(""));

      expect(selected.value).toBe("");
    });

    it("writes straight through to the underlying query param", () => {
      const param = writableParam("");
      const selected = useSelectedSortOption(param);

      selected.value = "price-ascending";

      expect(param.value).toBe("price-ascending");
    });
  });
});
