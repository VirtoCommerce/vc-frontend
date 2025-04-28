import { computed, readonly, ref, shallowRef } from "vue";
import { getBrands } from "@/core/api/graphql/catalog";
import { DEFAULT_BRANDS_PER_PAGE } from "@/core/constants";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { Logger } from "@/core/utilities";
import type { BrandType } from "@/core/api/graphql/types";
import type { MaybeRef, Ref } from "vue";

export interface IUseBrandsOptions {
  itemsPerPage?: MaybeRef<number>;
}

export function useBrands(options: IUseBrandsOptions) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_BRANDS_PER_PAGE);

  const brands: Ref<BrandType[]> = shallowRef<BrandType[]>([]);
  const letters: Ref<string[]> = shallowRef<string[]>([]);
  const loading: Ref<boolean> = ref(false);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const sort: Ref<Sort> = ref(new Sort("name", SortDirection.Ascending));

  async function fetchBrands() {
    loading.value = true;

    try {
      const payload = {
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        sort: sort.value.toString(),
      };

      const response = await getBrands(payload);

      brands.value = response?.items?.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")) ?? [];

      pages.value = Math.ceil((response?.totalCount ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useBrands.name}.${fetchBrands.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  type GroupedBrandsType = Record<string, BrandType[]>;

  function groupBrandsByFirstLetter(items: BrandType[]): GroupedBrandsType {
    return items.reduce<GroupedBrandsType>((acc, brand) => {
      const letter = brand.name?.charAt(0).toUpperCase() ?? "";

      if (!letter || !acc[letter]) {
        acc[letter] = [];
      }

      acc[letter].push(brand);

      if (!letters.value.includes(letter)) {
        letters.value.push(letter);
      }

      return acc;
    }, {});
  }

  return {
    fetchBrands,
    loading: readonly(loading),
    brands: computed(() => brands.value),
    groupedBrands: computed(() => groupBrandsByFirstLetter(brands.value)),
    featuredBrands: computed(() => brands.value.filter((brand) => brand.featured)),
    letters: readonly(letters),
    itemsPerPage,
    pages,
    page,
    keyword,
  };
}
