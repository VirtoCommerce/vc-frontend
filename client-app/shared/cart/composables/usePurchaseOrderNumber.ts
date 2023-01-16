import { computed, ref, watchEffect } from "vue";
import { useCart } from "@/shared/cart";

const purchaseOrderNumber = ref("");

export default function usePurchaseOrderNumber() {
  const { cart, updatePurchaseOrderNumber } = useCart();

  const isApplied = computed<boolean>(() => !!cart.value.purchaseOrderNumber);

  async function setPurchaseOrderNumber() {
    await updatePurchaseOrderNumber(purchaseOrderNumber.value);
  }

  async function removePurchaseOrderNumber() {
    await updatePurchaseOrderNumber("");
  }

  watchEffect(() => {
    purchaseOrderNumber.value = cart.value.purchaseOrderNumber ?? "";
  });

  return {
    purchaseOrderNumber,
    setPurchaseOrderNumber,
    removePurchaseOrderNumber,
    purchaseOrderNumberIsApplied: isApplied,
  };
}
