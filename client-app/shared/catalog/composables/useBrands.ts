import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useGetBrands } from "@/core/api/graphql/catalog";
import { DEFAULT_BRANDS_PER_PAGE, LATIN_UPPERCASE_LETTERS_MAPPING, MAX_FEATURED_BRANDS } from "@/core/constants/brands";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { getGroupByLetter } from "@/core/utilities/brands";
import type { BrandFragment, GetBrandsQueryVariables } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export type GroupedBrandsType = Record<string, BrandFragment[]>;

export interface IUseBrandsOptions {
  itemsPerPage?: MaybeRef<number>;
}

export function useBrands(options: IUseBrandsOptions, variables?: Partial<GetBrandsQueryVariables>) {
  const itemsPerPage = ref(options.itemsPerPage ?? DEFAULT_BRANDS_PER_PAGE);

  const page = ref(1);
  const keyword = ref("");
  const sort = ref(new Sort("name", SortDirection.Ascending));
  const search = ref("");

  const { t } = useI18n();

  const { result, loading } = useGetBrands({
    first: itemsPerPage.value,
    after: String((page.value - 1) * itemsPerPage.value),
    sort: sort.value.toString(),
    ...variables,
  });

  const pages = computed(() => Math.ceil((result.value?.brands?.totalCount ?? 0) / itemsPerPage.value));

  const brands = computed(() => result.value?.brands?.items?.map((item) => ({ ...item })) ?? []);

  const filteredBrands = computed(() => {
    if (!search.value) {
      return brands.value;
    }

    return brands.value.filter((brand) => brand.name?.toLowerCase().includes(search.value.toLowerCase()));
  });

  const featuredBrands = computed(() => brands.value.filter((brand) => brand.featured).slice(0, MAX_FEATURED_BRANDS));

  const groupedBrands = computed(() => {
    return filteredBrands.value.reduce((acc, brand) => {
      const firstChar = brand.name?.charAt(0).toUpperCase() ?? "";
      const key = getGroupByLetter(firstChar);

      acc[key] = acc[key] || [];
      acc[key].push(brand);
      return acc;
    }, {} as GroupedBrandsType);
  });

  const brandNavIndex: Record<string, string> = {
    all: t("pages.brands.button_all"),
    ...LATIN_UPPERCASE_LETTERS_MAPPING,
    numbers: "0-9",
    others: "#",
  };

  return {
    loading,
    groupedBrands,
    featuredBrands,
    brandNavIndex,
    itemsPerPage,
    pages,
    page,
    keyword,
    search,
  };
}
