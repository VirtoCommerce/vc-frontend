import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerOptionsDocument } from "../api/graphql/types";
import { formatCustomerLocation } from "../utils";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";

const PAGE_SIZE = 100;

// The picker filters client-side, which is only correct over the whole set — so every page is fetched, and the cap is
// a safety net against an ACL serving thousands of customers rather than an expected case.
const MAX_PAGES = 20;

export type SalesRepCustomerOptionType = {
  organizationId: string;
  organizationName: string;
  /** "City, Region" — the second line of a picker option and of a recipient row. */
  location: string;
};

// The rep's served customer organizations, resolved server-side from their claims. Uses its own narrow query rather
// than the My customers one, which also aggregates order statistics per customer — a lot of work for a name and a city.
export function useSalesRepCustomerOptions() {
  const page = ref(1);

  const variables = computed(() => ({
    storeId: globals.storeId,
    first: PAGE_SIZE,
    after: String((page.value - 1) * PAGE_SIZE),
    // Nothing to send: `VcSelect` filters over the items it was given and emits no search text.
    keyword: "",
    sort: "name:asc",
  }));

  const {
    result,
    loading: pageLoading,
    onError,
    onResult,
  } = useSalesRepHubQuery(SalesRepCustomerOptionsDocument, variables);

  // An empty dropdown on a failed fetch reads as "this rep serves nobody"; callers surface this on the field instead.
  const failed = ref(false);

  onError((error) => {
    failed.value = true;
    Logger.error("[sales-rep] salesRepCustomers (share options) failed:", error);
  });

  onResult(() => {
    failed.value = false;
  });

  // Pages accumulate rather than replace: the filter needs all of them, and a name already fetched has to stay
  // resolvable for a recipient row.
  const loaded = ref(new Map<string, SalesRepCustomerOptionType>());

  const totalCount = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);
  const truncated = computed(() => page.value >= MAX_PAGES && loaded.value.size < totalCount.value);

  // `immediate` matters: a cache hit fills `result` while `useQuery` is still running, so the first page would never
  // arrive as a *change*.
  watch(
    result,
    (current) => {
      const items = current?.salesRepCustomers?.items ?? [];

      for (const customer of items) {
        loaded.value.set(customer.organizationId, {
          organizationId: customer.organizationId,
          organizationName: customer.organizationName ?? customer.organizationId,
          location: formatCustomerLocation(customer.address),
        });
      }

      // An empty page means the backend has nothing more to give, whatever its count says.
      if (items.length && loaded.value.size < totalCount.value && page.value < MAX_PAGES) {
        page.value += 1;
      }
    },
    { immediate: true },
  );

  watch(truncated, (isTruncated) => {
    if (isTruncated) {
      Logger.warn(
        `[sales-rep] share picker lists ${loaded.value.size} of ${totalCount.value} served customers; the rest are unreachable.`,
      );
    }
  });

  // Insertion order is the backend's name sort, page after page.
  const options = computed<SalesRepCustomerOptionType[]>(() => [...loaded.value.values()]);

  // Stays up until the whole set is in, so the field does not look settled while pages are still arriving.
  const loading = computed(() => pageLoading.value || (loaded.value.size < totalCount.value && !truncated.value));

  /** Resolves a name from anywhere in the loaded set; the caller falls back to the raw id when it is not there. */
  function findOption(organizationId: string): SalesRepCustomerOptionType | undefined {
    return loaded.value.get(organizationId);
  }

  return { options, totalCount, findOption, loading, failed };
}
