import { getVendor } from "@/xapi/graphql/vendor";
import { Vendor } from "@/xapi/types";
import { UseItem, useItem } from "@/core";
import { MaybeRef } from "@vueuse/core";
import { unref } from "vue";

export type UseVendor = UseItem<Vendor>;

export function useVendor(id: MaybeRef<string>): UseVendor {
  const { loading, item, load } = useItem(id, async () => {
    const vendor = await getVendor(unref(id));
    return vendor;
  });

  return {
    loading,
    item,
    load,
  };
}
