<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>

        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 lg:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">Loyalty</h2>
            <VcButton class="float-right uppercase w-1/4" :isOutline="true" @click="addPointsOperation()">
              Add New Points Operation
            </VcButton>
          </div>

          <div class="bg-white rounded border shadow-sm">
            <div class="px-6 py-3 border-b font-extrabold text-sm">
              <div class="flex items-center">
                <div class="flex-grow text-xl font-extrabold uppercase">
                  <span>Points Balance</span>
                </div>
              </div>
            </div>
            <div class="px-6 py-4">
              <div class="overflow-hidden">
                <div class="text-6xl uppercase font-black">
                  {{ balance?.amount }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded border shadow-sm">
            <div class="px-6 py-3 border-b font-extrabold text-sm">
              <div class="flex items-center">
                <div class="flex-grow text-xl font-extrabold uppercase">
                  <span>Points Operations</span>
                </div>
                <div class="flex-grow text-right text-sm uppercase">
                  <VcButton class="uppercase w-1/2" :isOutline="true" @click="togglePaginationMode()">
                    <span v-if="isInfiniteScroll">Toggle Pagination</span>
                    <span v-else>Toggle Infinite Scroll</span>
                  </VcButton>
                </div>
              </div>
            </div>
            <div class="px-6 py-4">
              <VcTable
                :loading="loading"
                :columns="columns"
                :items="pointsOperationsResponse?.results"
                :pages="isInfiniteScroll ? 0 : pagesCount"
                :page="page"
                @pageChanged="onPageChange"
                v-if="pointsOperationsResponse?.results?.length"
              >
                <template #desktop-skeleton>
                  <tr v-for="i of itemsPerPage" :key="i" class="even:bg-gray-50">
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="w-4/12 p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                  </tr>
                </template>
                <template #desktop-body>
                  <tr v-for="operation in pointsOperationsResponse?.results" :key="operation.id">
                    <td class="p-5 overflow-hidden overflow-ellipsis">
                      <div class="font-bold">
                        {{ moment(operation.createdDate).local().format("MMM DD, YYYY") }}
                      </div>
                      {{ moment(operation.createdDate).local().format("h:mm A") }}
                    </td>
                    <td class="p-5 overflow-hidden overflow-ellipsis">{{ operation.reason }}</td>
                    <td
                      class="p-5 overflow-hidden overflow-ellipsis"
                      :class="operation.amount > 0 ? 'text-green-600' : 'text-rose-600'"
                    >
                      {{ operation.amount }}
                    </td>
                    <td class="p-5 overflow-hidden overflow-ellipsis">{{ operation.balance }}</td>
                  </tr>
                </template>
                <template #desktop-empty>
                  <tr>
                    <td :colspan="columns.length" class="polygons-bg">
                      <div class="flex items-center pl-56 space-x-10 h-80">
                        <div class="flex flex-col space-y-2">
                          <span class="text-base">There are no points operations yet</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </VcTable>

              <VcInfinityScrollLoader
                v-if="isInfiniteScroll"
                :loading="loading"
                distance="200"
                class="mt-9"
                @visible="loadMore"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import moment from "moment";
import { onMounted, ref } from "vue";
import { VcTable, VcButton, VcInfinityScrollLoader, ITableColumn } from "@/components";
import { useUserBalance, AccountNavigation, AddPointsOperationDialog } from "@/shared/account";
import { usePopup } from "@/shared/popup";

const {
  balance,
  loading,
  loadBalance,
  searchBalancePointsOperations,
  pointsOperationsResponse,
  pagesCount,
  itemsPerPage,
} = useUserBalance();
const { openPopup } = usePopup();

const page = ref(1);
const isInfiniteScroll = ref(false);
const columns = ref<ITableColumn[]>([
  {
    id: "createdDate",
    title: "Date",
  },
  {
    id: "reason",
    title: "Reason",
  },
  {
    id: "amount",
    title: "Amount",
  },
  {
    id: "balance",
    title: "Balance",
  },
]);

const onPageChange = async (newPage: number) => {
  page.value = newPage;
  await searchBalancePointsOperations(page.value);
};

const togglePaginationMode = async () => {
  isInfiniteScroll.value = !isInfiniteScroll.value;
  page.value = 1;
  await searchBalancePointsOperations(page.value);
};

const loadMore = async () => {
  const operations = pointsOperationsResponse.value.results;
  page.value++;
  await searchBalancePointsOperations(page.value);
  pointsOperationsResponse.value.results = operations.concat(pointsOperationsResponse.value.results);
};

const addPointsOperation = () => {
  openPopup({
    component: AddPointsOperationDialog,
  });
};

onMounted(async () => {
  await loadBalance();
  await searchBalancePointsOperations(page.value);
});
</script>
