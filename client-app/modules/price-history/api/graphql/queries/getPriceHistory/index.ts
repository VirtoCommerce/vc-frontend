import { computed, ref } from "vue";
import type { PriceHistoryItemType } from "@/modules/price-history/types";

/**
 * Adds the specified number of days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

/**
 * Generates mock price history data for the given product IDs
 * with dates -30 days from today and minor random price fluctuations
 */
function generateMockPriceHistory(productIds: string[]): Record<string, PriceHistoryItemType[]> {
  const result: Record<string, PriceHistoryItemType[]> = {};

  productIds.forEach((productId) => {
    // Generate a base price between $10 and $100
    const basePrice = 10 + Math.random() * 90;
    const priceHistory: PriceHistoryItemType[] = [];

    // Generate data for the last 30 days
    for (let dayOffset = -30; dayOffset <= 0; dayOffset++) {
      const currentDate = addDays(new Date(), dayOffset);

      const dateString = currentDate.toISOString();

      const fluctuation = basePrice * (Math.random() * 0.2);
      const price = Math.floor(basePrice + fluctuation);

      priceHistory.push({
        date: dateString,
        price,
      });
    }

    result[productId] = priceHistory;
  });

  return result;
}

export function useGetPriceHistory(productIds: string[]) {
  const result = ref<Record<string, PriceHistoryItemType[]>>({});
  const loading = ref(false);

  async function fetchPriceHistory(): Promise<void> {
    loading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockData = generateMockPriceHistory(productIds);
      result.value = mockData;
    } finally {
      loading.value = false;
    }
  }

  void fetchPriceHistory();

  return {
    loading,
    result: computed(() => ({ data: result.value })),
  };
}
