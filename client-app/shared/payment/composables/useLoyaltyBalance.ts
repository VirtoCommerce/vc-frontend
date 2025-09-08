import { useGetLoyaltyBalance } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";

export function useLoyaltyBalance() {
  async function getLoyaltyBalance(orderId: string) {
    try {
      return await useGetLoyaltyBalance(orderId);
    } catch (e) {
      Logger.error(`${useLoyaltyBalance.name}.${getLoyaltyBalance.name}`, e);
      throw e;
    }
  }

  return {
    getLoyaltyBalance,
  };
}

