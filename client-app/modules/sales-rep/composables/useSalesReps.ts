import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { CustomerSalesRepsDocument } from "../api/graphql/types";
import { HUB_FETCH_POLICY } from "../constants";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";
import type { SalesRepType, SalesRepSortType } from "../types";

export const PAGE_SIZE = 10;

export function useSalesReps() {
  // `keyword` is the APPLIED search term (set on enter/click by the page, like Company
  // members) — not the live input. The reactive query refetches when it changes.
  const keyword = ref("");
  const sort = ref<SalesRepSortType>({ column: "name", direction: "asc" });
  const page = ref(1);

  const variables = computed(() => ({
    // A Sales Rep's account is store-bound; scope to the current store so reps from another
    // store don't leak in (server defaults to all stores when omitted).
    storeId: globals.storeId,
    first: PAGE_SIZE,
    // xAPI connections accept the offset as the cursor (host-wide convention).
    after: String((page.value - 1) * PAGE_SIZE),
    keyword: keyword.value,
    sort: `${sort.value.column}:${sort.value.direction}`,
  }));

  // The organization is resolved server-side from the caller's claims — no org variable.
  // Active-only filtering is a server responsibility too (AC#5).
  // Assignments and contact details change in Admin, so the list revalidates rather than serving the
  // one it first loaded; keepPreviousResult holds the current page while it does.
  const { result, loading, error, onError } = useSalesRepHubQuery(CustomerSalesRepsDocument, variables, {
    keepPreviousResult: true,
    fetchPolicy: HUB_FETCH_POLICY,
  });

  onError((err) => {
    // No toast; the page's failure view names it instead (VCST-5586) — an empty view here would read as
    // "this customer has no sales reps".
    Logger.error("[sales-rep] customerSalesReps failed:", err);
  });

  const items = computed<SalesRepType[]>(() =>
    (result.value?.customerSalesReps?.items ?? []).map((rep) => ({
      id: rep.id,
      name: rep.fullName || rep.name || "",
      email: rep.emails?.[0] ?? "",
      phone: rep.phones?.[0] ?? "",
    })),
  );

  const pages = computed(() => Math.max(1, Math.ceil((result.value?.customerSalesReps?.totalCount ?? 0) / PAGE_SIZE)));

  // If the result set shrinks under the user (e.g. reps removed server-side, or the total
  // drops after a refetch) so the current page no longer exists, clamp back to the last
  // valid page — otherwise the page is stranded on an empty view with no way back.
  watch(pages, (total) => {
    if (page.value > total) {
      page.value = total;
    }
  });

  return { loading, error, keyword, sort, page, pages, items };
}
