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

      <Orders :items-per-page="4" />
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
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { Orders } from "@/shared/account";

const { t } = useI18n();

usePageHead({
  title: t("pages.account.dashboard.meta.title"),
});
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>
