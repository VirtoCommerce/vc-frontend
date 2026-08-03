import { useQuery } from "@vue/apollo-composable";
import { computed, ref, watch } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomerOptionsDocument } from "../api/graphql/types";
import type { Ref } from "vue";

// Upper bound of customer organizations offered in the share picker. The picker filters client-side (VcSelect
// autocomplete), so a rep serving more customers than this cannot reach the overflow — see the warning below.
const OPTIONS_LIMIT = 100;

export type SalesRepCustomerOptionType = { organizationId: string; organizationName: string };

// Flat list of the caller rep's served customer organizations for the "share with customer" picker (resolved
// server-side from the caller's claims). Backed by its own narrow query rather than the one behind the My customers
// table: that one also aggregates order statistics per customer, which is a lot of work for an id and a name.
export function useSalesRepCustomerOptions(enabled?: Ref<boolean> | boolean) {
  const variables = computed(() => ({
    storeId: globals.storeId,
    first: OPTIONS_LIMIT,
    after: "0",
    keyword: "",
    sort: "name:asc",
  }));

  // `enabled` keeps the query from firing for callers that cannot share at all, avoiding a needless authorized
  // request. Defaults to enabled; the scope works in create mode too, so being new is not a reason to skip it.
  const { result, loading, onError, onResult } = useQuery(SalesRepCustomerOptionsDocument, variables, { enabled });

  // Without this the picker would just render an empty dropdown on a failed fetch, which reads as "this rep serves
  // nobody" rather than "the list could not be loaded". Callers surface it on the field.
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

  // Client-side filtering silently hides everything past OPTIONS_LIMIT, which would look like a missing customer
  // rather than a truncated list. Surface it until the picker moves to server-side keyword search. `immediate`
  // matters: a cache hit fills `result` during setup, so the count is already over the cap and never *changes*.
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

  return { options, totalCount, loading, failed };
}
