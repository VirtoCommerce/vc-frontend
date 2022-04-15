<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>
        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="grid grid-cols-3 lg:grid-cols-4 px-6 py-3">
            <div class="flex justify-between items-center mx-5 lg:mx-0 col-span-2 lg:col-span-3">
              <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.loyalty.title'"></h2>
            </div>
            <div class="flex-grow text-right text-sm">
              <VcButton class="uppercase w-11/12" :isOutline="true" @click="addPointsOperation()">
                <span v-t="'pages.account.loyalty.buttons.add_points_operation'"></span>
              </VcButton>
            </div>
          </div>
          <div class="bg-white rounded border shadow-sm">
            <div class="px-6 py-4">
              <div class="overflow-hidden">
                <div class="text-6xl uppercase font-black">
                  {{ balance?.balance }}
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-3 border-b font-extrabold text-sm">
            <div class="grid items-center grid-cols-3 lg:grid-cols-4">
              <div class="flex-grow text-xl font-extrabold uppercase col-span-1 lg:col-span-2">
                <span v-t="'pages.account.loyalty.points_operations'"></span>
              </div>
              <div class="flex-grow text-sm uppercase">
                <div class="flex" v-if="!isInfiniteScroll">
                  <VcSelect
                    class="w-4/12"
                    :items="oppSelectorItems"
                    text-field="text"
                    value-field="value"
                    size="sm"
                    :modelValue="selectedOpp"
                    @change="selectOppValue"
                    @update:modelValue="changeSelected"
                  >
                  </VcSelect>
                  <div class="w-8/12 my-auto ml-3">
                    <span v-t="'pages.account.loyalty.operations_per_page'"></span>
                  </div>
                </div>
              </div>
              <div class="flex-grow text-right text-sm">
                <VcButton class="uppercase w-11/12" :isOutline="true" @click="switchPaginationMode()">
                  <span
                    v-if="isInfiniteScroll && !isMobile"
                    v-t="'pages.account.loyalty.buttons.switch_to_pagination_mode'"
                  ></span>
                  <span
                    v-if="isInfiniteScroll && isMobile"
                    v-t="'pages.account.loyalty.buttons.switch_to_pagination_mode_mobile'"
                  ></span>
                  <span
                    v-if="!isInfiniteScroll && !isMobile"
                    v-t="'pages.account.loyalty.buttons.switch_to_infinite_scroll'"
                  ></span>
                  <span
                    v-if="!isInfiniteScroll && isMobile"
                    v-t="'pages.account.loyalty.buttons.switch_to_infinite_scroll_mobile'"
                  ></span>
                </VcButton>
              </div>
            </div>
          </div>
          <div class="flex flex-col bg-white shadow-sm" :class="{ 'rounded border': !isMobile }">
            <VcTable
              :loading="operationsLoading"
              :items="pointsOperations"
              :columns="columns"
              :pages="isInfiniteScroll ? 0 : pagesCount"
              :page="page"
              @pageChanged="onPageChange"
            >
              <template #mobile-item="itemData">
                <div
                  class="grid grid-cols-3 p-6 gap-y-4 border-b border-gray-200 cursor-pointer text-2xl font-bold text-center"
                >
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400 text-left" v-t="'pages.account.loyalty.operation_date'"></span>
                    <span class="overflow-hidden overflow-ellipsis">
                      {{ moment(itemData.item?.date).format("YYYY-MM-DD") }}
                    </span>
                  </div>

                  <div class="flex flex-col justify-center items-end">
                    <TableDepositOperation
                      :isDeposit="itemData.item?.isDeposit"
                      :amout="itemData.item?.amount"
                      class="mx-auto text-xl font-bold"
                    ></TableDepositOperation>
                    <span class="overflow-hidden overflow-ellipsis mx-auto">{{ itemData.item?.reason }}</span>
                  </div>

                  <div class="flex flex-col">
                    <span
                      class="text-sm text-gray-400 text-left"
                      v-t="'pages.account.loyalty.operation_balance'"
                    ></span>
                    <span class="overflow-hidden overflow-ellipsis mx-auto">{{ itemData.item?.balance }}</span>
                  </div>
                </div>
              </template>
              <template #mobile-empty>
                <div class="flex items-center justify-center space-x-10 p-5">
                  <img
                    src="/static/images/account/icons/no-addresses.svg"
                    :alt="$t('pages.account.loyalty.no_operations_img_alt')"
                  />
                  <div class="flex flex-col space-y-2">
                    <span class="text-base" v-t="'pages.account.loyalty.no_operations_message'"></span>
                  </div>
                </div>
              </template>
              <template #mobile-skeleton>
                <div v-for="i of itemsPerPage" :key="i" class="grid grid-cols-3 p-6 gap-y-4 border-b border-gray-200">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.loyalty.operation_date'"></span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.loyalty.operation_amout'"></span>
                    <div class="h-6 bg-gray-200 animate-pulse"></div>
                  </div>

                  <div class="flex flex-col">
                    <span class="text-sm text-gray-400" v-t="'pages.account.loyalty.operation_balance'"></span>
                    <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                  </div>
                </div>
              </template>
              <template #desktop-body>
                <tr
                  v-for="operation in pointsOperations"
                  :key="moment(operation?.date).format('YYYY-MM-DD HH:mm:ss')"
                  class="even:bg-gray-50 hover:bg-gray-200"
                >
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ moment(operation?.date).format("YYYY-MM-DD HH:mm:ss") }}
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    <TableDepositOperation
                      :isDeposit="operation?.isDeposit"
                      :amout="operation?.amount"
                      class="mx-right text-xs"
                    ></TableDepositOperation>
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ operation?.reason }}
                  </td>
                  <td class="p-5 overflow-hidden overflow-ellipsis">
                    {{ operation?.balance }}
                  </td>
                </tr>
              </template>
              <template #desktop-empty>
                <!-- Workaround for using colspan -->
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="6" class="polygons-bg">
                    <div class="flex items-center pl-56 space-x-10 h-80">
                      <img
                        src="/static/images/account/icons/no-addresses.svg"
                        :alt="$t('pages.account.loyalty.no_operations_img_alt')"
                      />
                      <div class="flex flex-col space-y-2">
                        <span class="text-base" v-t="'pages.account.loyalty.no_operations_message'"></span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
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
                </tr>
              </template>
            </VcTable>
            <VcInfinityScrollLoader
              v-if="isInfiniteScroll"
              :loading="operationsLoading"
              distance="200"
              class="m-9"
              @visible="loadMore"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { useUserBalance, AccountNavigation, AddPointsOperationDialog } from "@/shared/account";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { VcTable, ITableColumn, TableDepositOperation, VcButton, VcInfinityScrollLoader, VcSelect } from "@/components";
import { PointsOperation } from "@/core/api/graphql/types";
import { useI18n } from "vue-i18n";
import moment from "moment";
import { SelectorLineItem } from "@/core/types";
import { usePopup } from "@/shared/popup";

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
const isInfiniteScroll = ref(false);
let pointsOperations: Ref<PointsOperation[] | []> = ref([]);
let itemsPerPage = 10;
const oppSelectorItems: SelectorLineItem[] = [
  { text: "10", value: "10" },
  { text: "15", value: "15" },
  { text: "20", value: "20" },
];
let selectedOpp: Ref<string> = ref("10");
const { openPopup } = usePopup();

const {
  loading: operationsLoading,
  balance,
  //itemsPerPage,
  //pointsOperations,
  pagesCount,
  page,
  loadBalance,
  searchBalancePointsOperations,
} = useUserBalance();

const columns = ref<ITableColumn[]>([
  {
    id: "date",
    title: t("pages.account.loyalty.operation_date"),
  },
  {
    id: "amount",
    title: t("pages.account.loyalty.operation_amount"),
  },
  {
    id: "reason",
    title: t("pages.account.loyalty.operation_reason"),
  },
  {
    id: "balance",
    title: t("pages.account.loyalty.operation_balance"),
  },
]);

const onPageChange = async (newPage: number) => {
  page.value = newPage;
  pointsOperations.value = await searchBalancePointsOperations(itemsPerPage);
};

const switchPaginationMode = async () => {
  isInfiniteScroll.value = !isInfiniteScroll.value;
  page.value = 1;
  pointsOperations.value = await searchBalancePointsOperations(itemsPerPage);
};

const loadMore = async () => {
  page.value++;
  let oldOperations = pointsOperations.value;
  let moreOperations = await searchBalancePointsOperations(itemsPerPage);
  pointsOperations.value = new Array<PointsOperation>(...oldOperations, ...moreOperations);
  pointsOperations.value = pointsOperations.value.filter((elem, index, array) => array.indexOf(elem) === index);
};

onMounted(async () => {
  await loadBalance();
  pointsOperations.value = await searchBalancePointsOperations(itemsPerPage);
});

const changeSelected = async (item: string) => {
  selectedOpp.value = (oppSelectorItems.find((x) => x.value === item) ?? oppSelectorItems[0]).value;
};

const selectOppValue = async (item: string) => {
  page.value = 1;
  itemsPerPage = Number.parseInt(item) ?? 10;
  pointsOperations.value = await searchBalancePointsOperations(itemsPerPage);
};

const addPointsOperation = () => {
  openPopup({
    component: AddPointsOperationDialog,
    props: {
      async onResult() {
        refreshPage();
      },
    },
  });
};

const refreshPage = async () => {
  await loadBalance();
  page.value = 1;
  pointsOperations.value = await searchBalancePointsOperations(itemsPerPage);
};
</script>
