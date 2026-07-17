import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SalesRepOrderStatusesDocument } from "../api/graphql/types";
import type { SalesRepOrderStatusType } from "../types";

// Order-status tabs for the Recent Orders block — sourced entirely from the sales-rep backend
// (salesRepOrderStatuses), never hardcoded, so tabs always match the platform's real statuses.
export function useSalesRepOrderStatuses() {
  const variables = computed(() => ({
    storeId: globals.storeId,
    cultureName: globals.cultureName,
  }));

  const { result, loading, onError } = useQuery(SalesRepOrderStatusesDocument, variables);

  onError((error) => {
    Logger.error("[sales-rep] salesRepOrderStatuses failed:", error);
  });

  const statuses = computed<SalesRepOrderStatusType[]>(() =>
    (result.value?.salesRepOrderStatuses ?? [])
      .filter((status): status is NonNullable<typeof status> => status != null)
      .map((status) => ({ name: status.name, localizedName: status.localizedName ?? status.name })),
  );

  return { statuses, loading };
}
