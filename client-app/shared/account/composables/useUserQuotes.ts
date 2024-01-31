import { ref, shallowRef } from "vue";
import { getQuotes, createQuote } from "@/core/api/graphql/quotes";
import { DEFAULT_SORT_INFO } from "@/core/constants";
import { getSortingExpression, Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import type { QuoteType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";
import type { Ref } from "vue";

const DEFAULT_ITEMS_PER_PAGE = 10;

export function useUserQuotes() {
  const quotes: Ref<QuoteType[]> = shallowRef<QuoteType[]>([]);
  const fetching: Ref<boolean> = ref(false);
  const itemsPerPage: Ref<number> = ref(DEFAULT_ITEMS_PER_PAGE);
  const pages: Ref<number> = ref(0);
  const page: Ref<number> = ref(1);
  const keyword: Ref<string> = ref("");
  const sort: Ref<ISortInfo> = ref(DEFAULT_SORT_INFO);

  const notifications = useNotifications();

  async function fetchQuotes(): Promise<void> {
    fetching.value = true;

    const sortingExpression = getSortingExpression(sort.value);

    try {
      const response = await getQuotes({
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
        keyword: keyword.value.trim(),
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

  async function createEmptyQuote(): Promise<string | undefined> {
    try {
      const res = await createQuote();

      if (!res?.id) {
        notifications.error({ text: "Can't create new quote" });
        return;
      }
      return res.id;
    } catch (e) {
      notifications.error({ text: "Can't create new quote" });

      // eslint-disable-next-line no-console
      console.error(e);
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
    createEmptyQuote,
  };
}
