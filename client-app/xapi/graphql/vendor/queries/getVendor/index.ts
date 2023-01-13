import { Vendor, Query, GetVendorQueryVariables } from "@/xapi/types";
import getVendorQueryDocument from "./getVendorQuery.graphql";
import globals from "@/core/globals";

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
