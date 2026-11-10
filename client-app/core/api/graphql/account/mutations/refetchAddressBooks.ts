import { apolloClient } from "@/core/api/graphql/client";
import { OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";

/**
 * Address mutations run on the non-cached `graphqlClient`, while every address list (account page,
 * header ship-to, checkout, quote) watches its query on `apolloClient`, so they are refetched there.
 */
export function refetchAddressBooks(): void {
  void apolloClient.refetchQueries({
    include: filterActiveQueryNames(apolloClient, [
      OperationNames.Query.GetCurrentUserAddresses,
      OperationNames.Query.GetCurrentOrganizationAddresses,
    ]),
  });
}
