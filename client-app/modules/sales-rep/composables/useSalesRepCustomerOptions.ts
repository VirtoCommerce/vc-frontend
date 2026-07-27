import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepCustomersDocument } from "../api/graphql/types";
import type { Ref } from "vue";

// Upper bound of customer organizations offered in the share picker. The picker filters client-side (VcSelect
// autocomplete), so a rep with more served customers than this would not see the overflow — logged below.
const OPTIONS_LIMIT = 100;

export type SalesRepCustomerOptionType = { organizationId: string; organizationName: string };

// Flat list of the caller rep's served customer organizations for the "share with customer" picker
// (resolved server-side from the caller's claims). Distinct from useSalesRepCustomers, which is the paged table.
export function useSalesRepCustomerOptions(enabled?: Ref<boolean> | boolean) {
  const variables = computed(() => ({
    storeId: globals.storeId,
    first: OPTIONS_LIMIT,
    after: "0",
    keyword: "",
    sort: "name:asc",
  }));

  // `enabled` keeps the query from firing for users who can't share (non-reps / create mode), avoiding a
  // needless authorized request. Defaults to enabled for standalone callers.
  const { result, loading, onError } = useQuery(SalesRepCustomersDocument, variables, { enabled });

  onError((error) => {
    Logger.error("[sales-rep] salesRepCustomers (share options) failed:", error);
  });

  const options = computed<SalesRepCustomerOptionType[]>(() =>
    (result.value?.salesRepCustomers?.items ?? []).map((customer) => ({
      organizationId: customer.organizationId,
      organizationName: customer.organizationName ?? customer.organizationId,
    })),
  );

  const totalCount = computed(() => result.value?.salesRepCustomers?.totalCount ?? 0);

  return { options, totalCount, loading };
}
