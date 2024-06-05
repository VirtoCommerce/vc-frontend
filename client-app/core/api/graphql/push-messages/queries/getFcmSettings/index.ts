import { useLazyQuery } from "@vue/apollo-composable";
import { GetFcmSettingsDocument } from "@/core/api/graphql/types";

export function useGetFcmSettings() {
  return useLazyQuery(GetFcmSettingsDocument);
}
