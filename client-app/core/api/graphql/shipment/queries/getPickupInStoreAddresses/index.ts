import { useLazyQuery } from "@vue/apollo-composable";
import { GetPickupInStoreAddressesDocument } from "@/core/api/graphql/types";

export function getPickupInStoreAddresses() {
  return useLazyQuery(GetPickupInStoreAddressesDocument);
}
