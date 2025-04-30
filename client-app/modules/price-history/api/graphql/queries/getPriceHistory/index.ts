import { ref } from "vue";
import type { PriceHistoryItemType } from "@/modules/price-history/types";

/**
 * Formats date as YYYY-MM-DD using Intl
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Adds the specified number of days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

type PriceHistoryResponseType =
  | {
      data?: Record<string, PriceHistoryItemType[]>;
    }
  | undefined;

/**
 * Generates mock price history data for the given product IDs
 * with dates ±3 days from today and minor random price fluctuations
 */
function generateMockPriceHistory(productIds: string[]): Record<string, PriceHistoryItemType[]> {
  const result: Record<string, PriceHistoryItemType[]> = {};

  productIds.forEach((productId) => {
    // Generate a base price between $10 and $100
    const basePrice = 10 + Math.random() * 90;
    const priceHistory: PriceHistoryItemType[] = [];

    // Generate data for the last 3 days and next 3 days (7 days total including today)
    for (let dayOffset = -3; dayOffset <= 3; dayOffset++) {
      const currentDate = addDays(new Date(), dayOffset);
      // Format date as YYYY-MM-DD
      const dateString = formatDate(currentDate);

      const fluctuation = basePrice * (Math.random() * 0.1 - 0.05);
      const priceAmount = Number((basePrice + fluctuation).toFixed(2));

      priceHistory.push({
        date: dateString,
        priceAmount,
      });
    }

    result[productId] = priceHistory;
  });

  return result;
}

export function useGetPriceHistory(productIds: string[]) {
  const result = ref<PriceHistoryResponseType>();
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
    result,
  };
}
