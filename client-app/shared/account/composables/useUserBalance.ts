import { Ref, computed, ref } from "vue";
import { UserBalance, PointsOperation } from "@/core/api/graphql/types";

import { Logger } from "@core/utilities";
import getUserBalance from "@/core/api/graphql/account/queries/getUserBalance";
import searchPointsOperations from "@/core/api/graphql/account/queries/searchPointsOperations";
import addPointsOperationMutation from "@/core/api/graphql/account/mutations/addPointsOperation";

const loading: Ref<boolean> = ref(false);
const balance: Ref<UserBalance | null> = ref(null);
const pointsOperationsPagesCount: Ref<number> = ref(0);
const page: Ref<number> = ref(1);

export default () => {
  async function loadBalance() {
    loading.value = true;

    try {
      balance.value = await getUserBalance();
    } catch (e) {
      Logger.error("useUserBalance.loadBalance", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function searchBalancePointsOperations(itemsPerPage: number): Promise<PointsOperation[]> {
    loading.value = true;

    try {
      const skip = (page.value - 1) * itemsPerPage;
      const responce = await searchPointsOperations(skip.toString(), itemsPerPage);
      pointsOperationsPagesCount.value = responce.totalCount ? Math.ceil(responce.totalCount / itemsPerPage) : 1;
      return responce.items ?? [];
    } catch (e) {
      Logger.error("useUserBalance.searchBalancePointsOperations", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addPointsOperation(reason: string, amount: number) {
    loading.value = true;

    try {
      await addPointsOperationMutation(reason, amount);
    } catch (e) {
      Logger.error("useUserBalance.addPointsOperation", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: computed(() => loading.value),
    balance: computed(() => balance.value),
    pagesCount: computed(() => pointsOperationsPagesCount.value),
    page,
    loadBalance,
    searchBalancePointsOperations,
    addPointsOperation,
  };
};
