import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerOptionsDocument } from "../api/graphql/types";

// The picker filters client-side, so a rep serving more customers than this cannot reach the overflow (warned below).
const OPTIONS_LIMIT = 100;

export type SalesRepCustomerOptionType = { organizationId: string; organizationName: string };

// The rep's served customer organizations, resolved server-side from their claims. Uses its own narrow query rather
// than the My customers one, which also aggregates order statistics per customer — a lot of work for an id and a name.
export function useSalesRepCustomerOptions() {
  const variables = computed(() => ({
    storeId: globals.storeId,
    first: OPTIONS_LIMIT,
    after: "0",
    keyword: "",
    sort: "name:asc",
  }));

  const { result, loading, onError, onResult } = useQuery(SalesRepCustomerOptionsDocument, variables);

  // An empty dropdown on a failed fetch reads as "this rep serves nobody"; callers surface this on the field instead.
  const failed = ref(false);

  onError((error) => {
    failed.value = true;
    Logger.error("[sales-rep] salesRepCustomers (share options) failed:", error);
  });

  onResult(() => {
    failed.value = false;
  });

  const options = computed<SalesRepCustomerOptionType[]>(() =>
    (result.value?.salesRepCustomers?.items ?? []).map((customer) => ({
      organizationId: customer.organizationId,
      organizationName: customer.organizationName ?? customer.organizationId,
    })),
  );

  const totalCount = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  // Until the picker gains server-side search, overflow looks like a missing customer rather than a truncated list.
  // `immediate` matters: a cache hit fills `result` during setup, so the count never *changes*.
  watch(
    totalCount,
    (count) => {
      if (count > OPTIONS_LIMIT) {
        Logger.warn(
          `[sales-rep] share picker lists only ${OPTIONS_LIMIT} of ${count} served customers; the rest are unreachable.`,
        );
      }
    },
    { immediate: true },
  );

  return { options, loading, failed };
}
