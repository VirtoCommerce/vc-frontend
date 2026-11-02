<template>
  <div class="company-reporting">
    <VcTypography class="company-reporting__title" tag="h1">
      {{ $t("pages.company.reporting.title") }}
    </VcTypography>

    <p class="company-reporting__subtitle">{{ $t("pages.company.reporting.subtitle") }}</p>

    <VcWidget class="company-reporting__card">
      <template #header>
        <div class="company-reporting__card-header">
          <VcTypography tag="h2" variant="h6" class="company-reporting__card-title">
            {{ $t("shared.account.dashboard.sales_report.title") }}
          </VcTypography>

          <VcLink class="company-reporting__all-orders" :to="{ name: 'Orders' }">
            {{ $t("shared.account.dashboard.recent_orders.view_all") }}

            <VcIcon name="arrow-right" size="xs" />
          </VcLink>
        </div>
      </template>

      <!-- The organization never ordered: tiles and charts of zeros would read as a quiet period. -->
      <VcEmptyView
        v-if="hasOrders === false && !failed"
        :text="$t('shared.account.dashboard.recent_orders.empty')"
        icon="outline-order"
        data-test-id="company-reporting-empty-section"
      />

      <template v-else>
        <ReportingPanel v-model:period="period" :data="data" :loading="loading" :error="failed">
          <template #actions>
            <VcSelect
              class="company-reporting__member"
              :model-value="memberId"
              :items="memberItems"
              :aria-label="$t('pages.company.reporting.member_label')"
              :disabled="membersLoading"
              :error="membersFailed"
              :message="membersFailed ? $t('pages.company.reporting.members_failed') : undefined"
              text-field="name"
              value-field="id"
              size="sm"
              test-id-dropdown="company-reporting-member-select"
              autocomplete
              @change="memberId = $event ?? COMPANY_REPORTING_ALL_MEMBERS"
            />
          </template>
        </ReportingPanel>

        <p
          v-if="excludedCount && !failed"
          class="company-reporting__excluded"
          data-test-id="company-reporting-excluded-label"
        >
          <VcIcon name="info" size="xs" />

          {{ $t("shared.account.dashboard.excluded_orders", { count: formatStatCount(excludedCount) }, excludedCount) }}
        </p>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useUser } from "@/shared/account";
import { useAccountSalesReport } from "@/shared/account/composables/useAccountSalesReport";
import {
  COMPANY_REPORTING_ALL_MEMBERS,
  useCompanyReportingParams,
  useOrganizationBuyerOptions,
} from "@/shared/company";
import { formatStatCount } from "@/shared/dashboard";
import { ReportingPanel } from "@/shared/reporting";
import type { SalesReportScopeType } from "@/shared/account/composables/useAccountSalesReport";

const { t, n } = useI18n();

// The route lets only members allowed to see all of the organization's orders in (router/routes/company.ts).
const { organization } = useUser();

// Only members who have ordered: a member without orders would only ever show zeros.
const memberOptions = useOrganizationBuyerOptions(() => organization.value?.id);
const { options: members, totalCount: membersCount, loading: membersLoading, failed: membersFailed } = memberOptions;

const { period, memberId } = useCompanyReportingParams(memberOptions);

const scope = computed<SalesReportScopeType>(() => ({ organization: true, memberId: memberId.value || undefined }));

const { data, excludedCount, hasOrders, loading, failed } = useAccountSalesReport(period, scope);

// No count until the list has loaded: "(0)" over a report with figures would read as "no members".
const allMembersLabel = computed(() =>
  membersLoading.value || membersFailed.value
    ? t("pages.company.reporting.all_members_plain")
    : t("pages.company.reporting.all_members", { count: n(membersCount.value) }),
);

const memberItems = computed(() => [
  { id: COMPANY_REPORTING_ALL_MEMBERS, name: allMembersLabel.value },
  ...members.value,
]);

usePageHead({
  title: computed(() => t("pages.company.reporting.meta.title")),
});
</script>

<style lang="scss">
.company-reporting {
  @apply flex flex-col gap-5;

  &__title {
    @apply [word-break:break-word];
  }

  &__subtitle {
    @apply -mt-4 text-sm text-neutral-600;
  }

  &__card-header {
    @apply flex w-full items-center justify-between gap-3;
  }

  &__all-orders {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-bold text-[--link-color] hover:text-[--link-hover-color];
  }

  &__member {
    @apply min-w-0 flex-1;

    @media (width >= theme("screens.md")) {
      @apply w-64 flex-none;
    }
  }

  &__excluded {
    @apply mt-3 flex items-center gap-1.5 text-xs text-neutral-600;
  }
}
</style>
