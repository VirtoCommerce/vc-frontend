import { useLazyQuery } from "@vue/apollo-composable";
import { GetPickupLocationsDocument } from "@/core/api/graphql/types";

export function getPickupLocations() {
  return useLazyQuery(GetPickupLocationsDocument);
}
