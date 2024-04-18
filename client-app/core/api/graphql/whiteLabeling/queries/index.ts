import { useLazyQuery } from "@vue/apollo-composable";
import { GetWhiteLabelingSettingsDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";

export function useGetWhiteLabelingSettings(organizationId: string) {
  const { storeId, userId, cultureName } = globals;

  return useLazyQuery(
    GetWhiteLabelingSettingsDocument,
    { organizationId, storeId, userId, cultureName },
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );
}
