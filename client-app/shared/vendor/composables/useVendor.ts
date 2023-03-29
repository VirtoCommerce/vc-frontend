import { unref } from "vue";
import { useItem } from "@/core/composables";
import { getVendor } from "@/xapi/graphql/vendor";
import type { IUseItem } from "@/core/composables";
import type { Vendor } from "@/xapi/types";
import type { MaybeRef } from "@vueuse/core";

export type IUseVendorType = IUseItem<Vendor>;

export function useVendor(id: MaybeRef<string>): IUseVendorType {
  const { loading, item, load } = useItem(async () => {
    return await getVendor(unref(id));
  });

  return {
    loading,
    item,
    load,
  };
}
