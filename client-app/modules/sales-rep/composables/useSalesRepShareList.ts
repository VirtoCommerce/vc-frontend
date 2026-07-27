import { useMutation } from "@vue/apollo-composable";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { ShareListWithCustomersDocument } from "../api/graphql/types";
import type { SalesRepShareListInputType, SalesRepShareListResultType } from "../types";

const FAILED_RESULT: SalesRepShareListResultType = {
  succeeded: false,
  sharedWithOrganizationIds: [],
  warnings: [],
};

export function useSalesRepShareList() {
  const { mutate, loading } = useMutation(ShareListWithCustomersDocument);

  async function shareList(input: SalesRepShareListInputType): Promise<SalesRepShareListResultType> {
    const { storeId, cultureName } = globals;
    try {
      // Apollo rejects on a rejected request (GraphQL/network error); swallow so callers get a failed
      // result and can surface it. A honored request applies the Customer scope and returns the link + warnings.
      const result = await mutate({ command: { ...input, storeId, cultureName } });
      const data = result?.data?.shareListWithCustomers;
      if (!data) {
        return FAILED_RESULT;
      }

      return {
        succeeded: data.succeeded,
        listId: data.listId ?? undefined,
        sharingKey: data.sharingKey ?? undefined,
        sharingUrl: data.sharingUrl ?? undefined,
        sharedWithOrganizationIds: data.sharedWithOrganizationIds ?? [],
        warnings: data.warnings ?? [],
      };
    } catch (error) {
      Logger.error("[sales-rep] shareListWithCustomers failed:", error);
      return FAILED_RESULT;
    }
  }

  return { shareList, loading };
}
