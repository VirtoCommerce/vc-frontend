<template>
  <div class="customer-profile">
    <VcBreadcrumbs :items="breadcrumbs" />

    <VcEmptyView v-if="notFound" :text="t('sales_rep.customer_profile.not_found')" icon="outline-404">
      <template #button>
        <VcButton :to="{ name: myCustomersRouteName }" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_profile.back_to_customers") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else>
      <div class="customer-profile__hero">
        <div class="customer-profile__name-row">
          <!-- Organization icon; a neutral mark stands in when the org has no icon set. -->
          <span class="customer-profile__logo">
            <VcImage v-if="customer?.iconUrl" :src="customer.iconUrl" :alt="title" class="customer-profile__logo-img" />

            <VcIcon v-else name="office-building" aria-hidden="true" />
          </span>

          <VcTypography tag="h1" class="customer-profile__title">
            {{ title }}
          </VcTypography>
        </div>

        <!-- Only fields the backend returns; the design's account # / "Assigned to" have no source yet. -->
        <p v-if="meta" class="customer-profile__meta">{{ meta }}</p>
      </div>

      <!-- Full-width KPI row (mock until VCST-5309). -->
      <CustomerProfileWidgets :organization-id="organizationId" />

      <div class="customer-profile__layout">
        <div class="customer-profile__main">
          <CustomerProfileOrders :organization-id="organizationId" />
        </div>

        <aside class="customer-profile__aside">
          <CustomerProfileInfo :organization-id="organizationId" />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import CustomerProfileInfo from "../components/customer-profile-info.vue";
import CustomerProfileOrders from "../components/customer-profile-orders.vue";
import CustomerProfileWidgets from "../components/customer-profile-widgets.vue";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { MY_CUSTOMERS_ROUTE_NAME } from "../constants";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { customer, loading, notFound } = useSalesRepCustomer(() => props.organizationId);

const myCustomersRouteName = MY_CUSTOMERS_ROUTE_NAME;

// Org name once resolved; neutral label while loading to avoid a header jump.
const title = computed(
  () => customer.value?.organizationName || (loading.value ? t("sales_rep.customer_profile.loading") : ""),
);

const meta = computed(() => [customer.value?.accountType, customer.value?.shipTo].filter(Boolean).join(" · "));

usePageHead({
  title: computed(() => customer.value?.organizationName || t("sales_rep.hub.title")),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
  { title: customer.value?.organizationName ?? "" },
]);
</script>

<style lang="scss">
.customer-profile {
  &__hero {
    @apply flex flex-col;
  }

  &__name-row {
    @apply flex items-center gap-4;
  }

  &__logo {
    --vc-icon-size: 1.5rem;

    @apply flex size-11 flex-none items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-additional-50 text-neutral-400;
  }

  &__logo-img {
    @apply size-full object-contain;
  }

  &__title {
    @apply [word-break:break-word];
  }

  &__meta {
    @apply mt-1.5 text-[13px] text-neutral-500;
  }

  // Single column through tablet; the aside splits off only on desktop (xl).
  &__layout {
    @apply flex flex-col gap-5 xl:flex-row xl:items-start;
  }

  &__main {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__aside {
    @apply flex min-w-0 flex-col gap-5 xl:w-80 xl:shrink-0;
  }

  // Cancel VcWidget's mobile full-bleed (-mx-4.5 in .vc-container) so blocks align with the KPI row
  // and title. The extra `&` lifts specificity above VcWidget's own rule (avoids !important).
  & &__main .vc-widget,
  & &__aside .vc-widget {
    @apply mx-0;
  }
}
</style>
