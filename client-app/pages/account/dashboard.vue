<template>
  <div class="mx-5 lg:mx-0">
    <!-- Title block -->
    <div class="flex items-center justify-between lg:hidden">
      <h2 v-t="'pages.account.dashboard.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

    <VcCard :title="$t('pages.account.dashboard.last_orders_card.title')" full-width-content shadow>
      <template #header-button>
        <VcButton :to="{ name: 'Orders' }" variant="outline" size="xs" class="flex-none lg:!hidden">
          {{ $t("pages.account.dashboard.last_orders_card.all_orders_link") }}
        </VcButton>

        <router-link
          :to="{ name: 'Orders' }"
          class="hidden items-center gap-1 text-xs font-bold text-[--color-accent-600] hover:text-[--color-accent-700] lg:flex"
        >
          {{ $t("pages.account.dashboard.last_orders_card.all_orders_link") }}

          <VcIcon class="text-[--color-primary-500]" name="arrow-right" size="xs" />
        </router-link>
      </template>

      <VcTable
        :loading="ordersLoading"
        :columns="columns"
        :items="orders"
        :sort="sort"
        hide-default-footer
        @item-click="openOrderDetails"
      >
        <template #mobile-item="itemData">
          <div class="grid cursor-pointer grid-cols-3 gap-x-8 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col text-sm">
              <span v-t="'pages.account.dashboard.last_orders_card.order_number_label'" class="text-gray-400" />

              <span class="overflow-hidden text-ellipsis font-extrabold">
                {{ itemData.item.number }}
              </span>
            </div>

            <div class="flex flex-col text-sm">
              <span v-t="'pages.account.dashboard.last_orders_card.purchase_number_label'" class="text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.purchaseOrderNumber }}
              </span>
            </div>

            <div class="flex flex-col justify-start">
              <OrderStatus :status="itemData.item.status" />
            </div>

            <div class="flex flex-col text-sm">
              <span v-t="'pages.account.dashboard.last_orders_card.invoice_label'" class="text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.inPayments?.[0]?.number }}
              </span>
            </div>

            <div class="flex flex-col text-sm">
              <span v-t="'pages.account.dashboard.last_orders_card.date_label'" class="text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ $d(itemData.item?.createdDate) }}
              </span>
            </div>

            <div class="flex flex-col text-sm">
              <span v-t="'pages.account.dashboard.last_orders_card.total_label'" class="text-gray-400" />

              <span class="overflow-hidden text-ellipsis font-extrabold">
                {{ itemData.item.total?.formattedAmount }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-empty>
          <div class="flex items-center justify-center space-x-10 p-5">
            <img
              src="/static/images/account/icons/no-addresses.svg"
              :alt="$t('pages.account.dashboard.last_orders_card.no_orders_img_alt')"
            />

            <div class="flex flex-col space-y-2">
              <span v-t="'pages.account.dashboard.last_orders_card.no_orders_message'" class="text-base" />
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-3 gap-x-8 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span
                v-t="'pages.account.dashboard.last_orders_card.order_number_label'"
                class="text-sm text-gray-400"
              ></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span
                v-t="'pages.account.dashboard.last_orders_card.purchase_number_label'"
                class="text-sm text-gray-400"
              ></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.dashboard.last_orders_card.status_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.dashboard.last_orders_card.invoice_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.dashboard.last_orders_card.date_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.dashboard.last_orders_card.total_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="cursor-pointer even:bg-gray-50 hover:bg-gray-200"
            @click="openOrderDetails(order)"
          >
            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.number }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.purchaseOrderNumber }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ order.inPayments?.[0]?.number }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ $d(order?.createdDate) }}
            </td>

            <td class="p-5">
              <VcTooltip class="!block">
                <template #trigger>
                  <OrderStatus class="!block" :status="order.status" />
                </template>

                <template #content>
                  <div class="rounded-sm bg-[--color-additional-50] px-3.5 py-1.5 text-xs shadow-sm-x-y">
                    {{ order.status }}
                  </div>
                </template>
              </VcTooltip>
            </td>

            <td class="overflow-hidden text-ellipsis p-5 text-right">
              {{ order.total?.formattedAmount }}
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
            <td></td>
            <td></td>
          </tr>

          <tr>
            <td colspan="6" class="polygons-bg">
              <div class="flex h-80 items-center space-x-10 pl-56">
                <img
                  src="/static/images/account/icons/no-addresses.svg"
                  :alt="$t('pages.account.dashboard.last_orders_card.no_orders_img_alt')"
                />

                <div class="flex flex-col space-y-2">
                  <span v-t="'pages.account.dashboard.last_orders_card.no_orders_message'" class="text-base" />
                </div>
              </div>
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="w-4/12 p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </VcCard>

    <div class="mx-5 flex flex-col gap-y-5 md:mx-0 lg:flex-row lg:gap-x-5 lg:gap-y-0">
      <VcCard :title="$t('pages.account.dashboard.monthly_report_card.title')" class="lg:w-1/2" shadow>
        <div class="flex content-center space-x-9 lg:space-x-4">
          <VcImage
            src="/static/images/dashboard/spend-chart.svg"
            class="h-24 w-24"
            :alt="$t('pages.account.dashboard.monthly_report_card.spend_chart_alt')"
            lazy
          />

          <div
            class="flex flex-col justify-center space-y-1 sm:flex-row sm:flex-wrap sm:items-center sm:space-x-5 sm:space-y-0 xl:space-x-7"
          >
            <div class="flex flex-col lg:items-center lg:space-y-3">
              <span
                v-t="'pages.account.dashboard.monthly_report_card.budget_title'"
                class="text-xs text-gray-400 lg:font-bold lg:text-gray-600"
              />

              <span class="text-xl font-extrabold">$58,152</span>
            </div>

            <div class="flex flex-col lg:items-center lg:space-y-3">
              <span
                v-t="'pages.account.dashboard.monthly_report_card.total_spend_label'"
                class="text-xs text-gray-400 lg:font-bold lg:text-gray-600"
              />

              <span class="text-xl font-extrabold">$530,152</span>
            </div>
          </div>
        </div>
      </VcCard>

      <VcCard
        :title="$t('pages.account.dashboard.orders_status_card.title')"
        class="h-52 lg:h-auto lg:w-1/2"
        shadow
      ></VcCard>
    </div>

    <!-- Commented due to acceptance criteria, will be used in future
    <VcCard title="Users" class="h-52 mx-5 md:mx-0" shadow></VcCard> -->
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { SORT_DESCENDING } from "@/core/constants";
import { OrderStatus } from "@/shared/account";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import type { CustomerOrderType } from "@/core/api/graphql/types";

const { t } = useI18n();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const { loading: ordersLoading, orders, loadOrders, sort, itemsPerPage } = useUserOrders();

usePageHead({
  title: t("pages.account.dashboard.meta.title"),
});

const columns = ref<ITableColumn[]>([
  {
    id: "number",
    title: t("pages.account.dashboard.last_orders_card.order_number_label"),
  },
  {
    id: "purchaseOrder",
    title: t("pages.account.dashboard.last_orders_card.purchase_number_label"),
  },
  {
    id: "invoice",
    title: t("pages.account.dashboard.last_orders_card.invoice_label"),
  },
  {
    id: "createdDate",
    title: t("pages.account.dashboard.last_orders_card.date_label"),
  },
  {
    id: "status",
    title: t("pages.account.dashboard.last_orders_card.status_label"),
    align: "center",
  },
  {
    id: "total",
    title: t("pages.account.dashboard.last_orders_card.total_label"),
    align: "right",
  },
]);

const openOrderDetails = (item: CustomerOrderType) => {
  router.push({ name: "OrderDetails", params: { orderId: item.id } });
};

onMounted(async () => {
  sort.value.column = "createdDate";
  sort.value.direction = SORT_DESCENDING;
  itemsPerPage.value = 4;
  await loadOrders();
});
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>
