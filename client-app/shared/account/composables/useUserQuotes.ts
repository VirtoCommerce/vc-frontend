import { Ref, ref, shallowRef } from "vue";
import { getQuotes } from "@/xapi/graphql/quotes";
import { QuoteType } from "@/xapi/types";
import { ISortInfo, QueryParamName, useRouteQueryParam } from "@/core";
import { Logger, getSortingExpression, setSortInfo } from "@/core/utilities";

const DEFAULT_ITEMS_PER_PAGE = 10;

export default () => {
  const sortQueryParam = useRouteQueryParam<string>(QueryParamName.Sort, {
    defaultValue: "createdDate:desc",
  });
  const quotes: Ref<QuoteType[]> = shallowRef<QuoteType[]>([]);
  const fetching: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const sort: Ref<ISortInfo> = ref(setSortInfo(sortQueryParam.value));

  async function fetchQuotes(): Promise<void> {
    fetching.value = true;

    const sortingExpression = getSortingExpression(sort.value);
    sortQueryParam.value = sortingExpression;

    try {
      const response = await getQuotes({
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        keyword: keyword.value,
        sort: sortingExpression,
      });

      quotes.value = response.items ?? [];
      pages.value = Math.ceil((response.totalCount ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error("useUserQuotes.fetchQuotes", e);
      throw e;
    } finally {
      fetching.value = false;
    }
  }

  return {
    quotes,
    fetching,
    itemsPerPage,
    pages,
    page,
    keyword,
    sort,
    fetchQuotes,
  };
};
