<template>
  <div>
    <VcTypography tag="h1" class="lg:hidden">
      {{ $t("pages.account.dashboard.title") }}
    </VcTypography>

    <VcWidget :title="$t('pages.account.dashboard.last_orders_card.title')">
      <template #append>
        <VcButton class="lg:!hidden" :to="{ name: 'Orders' }" variant="outline" size="xs">
          {{ $t("pages.account.dashboard.last_orders_card.all_orders_link") }}
        </VcButton>

        <router-link
          :to="{ name: 'Orders' }"
          class="hidden items-center gap-1 text-xs font-bold text-[--link-color] hover:text-[--link-hover-color] lg:flex"
        >
          {{ $t("pages.account.dashboard.last_orders_card.all_orders_link") }}

          <VcIcon class="fill-primary" name="arrow-right" size="xs" />
        </router-link>
      </template>

      <template #default-container>
        <div class="pb-1.5">
          <OrdersTable
            :loading="loading"
            :orders="orders"
            :pages="pages"
            :page="page"
            hide-default-footer
            :bordered="false"
            order-scope="private"
            @row-click="goToOrderDetails"
          >
            <template #empty>
              <VcEmptyView :text="$t('pages.account.orders.no_orders_message')" icon="outline-order" variant="empty">
                <template #button>
                  <VcButton v-if="!!continue_shopping_link" :external-link="continue_shopping_link">
                    {{ $t("pages.account.orders.buttons.no_orders") }}
                  </VcButton>

                  <VcButton v-else to="/">
                    {{ $t("pages.account.orders.buttons.no_orders") }}
                  </VcButton>
                </template>
              </VcEmptyView>
            </template>
          </OrdersTable>
        </div>
      </template>
    </VcWidget>

    <div class="flex flex-col gap-y-5 lg:flex-row lg:gap-x-5 lg:gap-y-0">
      <VcWidget :title="$t('pages.account.dashboard.monthly_report_card.title')" class="lg:w-0 lg:grow">
        <div class="flex content-center space-x-9 lg:space-x-4">
          <VcImage
            src="spend-chart.svg"
            class="size-24"
            :alt="$t('pages.account.dashboard.monthly_report_card.spend_chart_alt')"
            lazy
          />

          <div
            class="flex flex-col justify-center space-y-1 sm:flex-row sm:flex-wrap sm:items-center sm:space-x-5 sm:space-y-0 xl:space-x-7"
          >
            <div class="flex flex-col lg:items-center lg:space-y-3">
              <span class="text-xs text-neutral-400 lg:font-bold lg:text-neutral-600">
                {{ $t("pages.account.dashboard.monthly_report_card.budget_title") }}
              </span>

              <span class="text-xl font-black">$58,152</span>
            </div>

            <div class="flex flex-col lg:items-center lg:space-y-3">
              <span class="text-xs text-neutral-400 lg:font-bold lg:text-neutral-600">
                {{ $t("pages.account.dashboard.monthly_report_card.total_spend_label") }}
              </span>

              <span class="text-xl font-black">$530,152</span>
            </div>
          </div>
        </div>
      </VcWidget>

      <VcWidget :title="$t('pages.account.dashboard.orders_status_card.title')" class="h-48 lg:w-0 lg:grow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { OrdersTable, useOrderNavigation, useUserOrders, useUserOrdersFilter } from "@/shared/account";

const { t } = useI18n();

usePageHead({
  title: t("pages.account.dashboard.meta.title"),
});

const { loading, orders, fetchOrders, pages, page } = useUserOrders({ itemsPerPage: 4 });
const { resetFilters } = useUserOrdersFilter();
const { goToOrderDetails } = useOrderNavigation();
const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

onMounted(async () => {
  resetFilters();
  await fetchOrders("private");
});
</script>
