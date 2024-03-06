import { computed, ref } from "vue";
import type { BankCardType } from "..";

export function useSkyflow() {
  const creditCards = ref<BankCardType[] | undefined>();

  function fetchCreditCards(userId: string): void {
    if (userId === "07e6a601-b90e-4dbd-a7d0-0f1f89db4f2e") {
      creditCards.value = [
        {
          number: "4556230562588825",
          month: "10",
          year: "25",
          cardholderName: "Gracie Green I",
          securityCode: "123",
        },
        {
          number: "4485284659128678",
          month: "01",
          year: "25",
          cardholderName: "Gracie Green I",
          securityCode: "111",
        },
      ];
    }
  }

  return {
    creditCards: computed(() => creditCards.value),
    fetchCreditCards,
  };
}
