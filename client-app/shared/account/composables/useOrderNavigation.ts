import { useRouter } from "vue-router";
import { useBrowserTarget } from "@/core/composables";
import { BrowserTargetType } from "@/core/enums";
import type { CustomerOrderType } from "@/core/api/graphql/types";

export function useOrderNavigation() {
  const router = useRouter();
  const { browserTarget } = useBrowserTarget();

  function goToOrderDetails(order: CustomerOrderType): void {
    const orderRoute = router.resolve({ name: "OrderDetails", params: { orderId: order.id } });

    if (browserTarget.value === BrowserTargetType.BLANK) {
      globalThis.open(orderRoute.href, "_blank")!.focus();
    } else {
      globalThis.location.href = orderRoute.href;
    }
  }

  return {
    goToOrderDetails,
  };
}
