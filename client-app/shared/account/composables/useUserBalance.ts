import { Ref, computed, ref } from "vue";
import { SearchPointsOperationsResultType, UserBalanceType } from "@/core/api/graphql/types";

import { Logger } from "@core/utilities";
import getMyBalance from "@/core/api/graphql/account/queries/getMyBalance";
import registerLoyaltyPointsOperation from "@/core/api/graphql/account/mutations/registerLoyaltyPointsOperation";
import searchPointsOperations from "@/core/api/graphql/account/queries/searchPointsOperations";

const loading: Ref<boolean> = ref(false);
const balance: Ref<UserBalanceType | null> = ref(null);
const itemsPerPage: Ref<number> = ref(10);
const pointsOperationsPagesCount: Ref<number> = ref(0);
const pointsOperationsResponse: Ref<SearchPointsOperationsResultType | null> = ref(null);

export default () => {
  async function loadBalance() {
    loading.value = true;

    try {
      balance.value = await getMyBalance();
    } catch (e) {
      Logger.error("useUserBalance", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function searchBalancePointsOperations(page: number) {
    loading.value = true;

    try {
      const skip = (page - 1) * itemsPerPage.value;
      pointsOperationsResponse.value = await searchPointsOperations(skip, itemsPerPage.value);
      pointsOperationsPagesCount.value = Math.ceil(pointsOperationsResponse.value.totalCount / itemsPerPage.value);
    } catch (e) {
      Logger.error("useUserBalance", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerPointsOperation(reason: string, amount: number) {
    loading.value = true;

    try {
      await registerLoyaltyPointsOperation(reason, amount);
    } catch (e) {
      Logger.error("useUserBalance", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: computed(() => loading.value),
    itemsPerPage: computed(() => itemsPerPage.value),
    pagesCount: computed(() => pointsOperationsPagesCount.value),
    pointsOperationsResponse: computed(() => pointsOperationsResponse.value),
    balance: computed(() => balance.value),
    loadBalance,
    searchBalancePointsOperations,
    registerPointsOperation,
  };
};
