import { ref, shallowRef } from "vue";
import { defaultSortInfo, getSortingExpression, Logger } from "@/core/utilities";
import { getQuotes } from "@/xapi/graphql/quotes";
import type { ISortInfo } from "@/core/types";
import type { QuoteType } from "@/xapi/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 10;

export default () => {
  const quotes: Ref<QuoteType[]> = shallowRef<QuoteType[]>([]);
  const fetching: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const sort: Ref<ISortInfo> = ref(defaultSortInfo);

  async function fetchQuotes(): Promise<void> {
    fetching.value = true;

    const sortingExpression = getSortingExpression(sort.value);

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
