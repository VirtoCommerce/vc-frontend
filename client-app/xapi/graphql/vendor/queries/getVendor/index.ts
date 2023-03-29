import globals from "@/core/globals";
import getVendorQueryDocument from "./getVendorQuery.graphql";
import type { Vendor, Query, GetVendorQueryVariables } from "@/xapi/types";

export async function getVendor(id: string): Promise<Vendor | null> {
  const { storeId, cultureName } = globals;
  const { $graphqlClient } = useNuxtApp();

  const { data } = await $graphqlClient.query<Required<Pick<Query, "vendor">>, GetVendorQueryVariables>({
    query: getVendorQueryDocument,
    variables: {
      storeId,
      cultureName,
      id,
    },
  });

  return data.vendor;
}
