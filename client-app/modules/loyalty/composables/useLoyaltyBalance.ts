import { ref } from "vue";
import { Logger } from "@/core/utilities";
import { useGetLoyaltyBalance } from "../api/graphql/queries";
import type { Ref } from "vue";

export function useLoyaltyBalance() {
  const loading: Ref<boolean> = ref(false);
  const resultBalance = ref<number>();
  const currentBalance = ref<number>();

  async function fetchLoyaltyBalance(orderId?: string) {
    loading.value = true;

    try {
      const result = await useGetLoyaltyBalance(orderId);
      currentBalance.value = result?.currentBalance;
      resultBalance.value = result?.resultBalance;
    } catch (e) {
      Logger.error(`${useLoyaltyBalance.name}.${fetchLoyaltyBalance.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchLoyaltyBalance,
    loading,
    currentBalance,
    resultBalance,
  };
}

