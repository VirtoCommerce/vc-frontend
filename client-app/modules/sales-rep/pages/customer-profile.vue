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
      <VcTypography tag="h1" class="customer-profile__title">
        {{ title }}
      </VcTypography>

      <!-- Full-width KPI row (fixed header, not a draggable block) — see the design. -->
      <CustomerProfileWidgets :organization-id="organizationId" />

      <div class="customer-profile__layout">
        <div class="customer-profile__main">
          <div v-for="block in mainBlocks" :key="block.id" class="customer-profile__block" :data-block-id="block.id">
            <component :is="block.component" :organization-id="organizationId" />
          </div>
        </div>

        <aside v-if="asideBlocks.length" class="customer-profile__aside">
          <div v-for="block in asideBlocks" :key="block.id" class="customer-profile__block" :data-block-id="block.id">
            <component :is="block.component" :organization-id="organizationId" />
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import type { Component } from "vue";

const props = defineProps<{ organizationId: string }>();

const { t } = useI18n();
const { customer, loading, notFound } = useSalesRepCustomer(() => props.organizationId);

const myCustomersRouteName = MY_CUSTOMERS_ROUTE_NAME;

// H1: the org name once resolved; a neutral label while loading so the header doesn't jump.
const title = computed(
  () => customer.value?.organizationName || (loading.value ? t("sales_rep.customer_profile.loading") : ""),
);

usePageHead({
  title: computed(() => customer.value?.organizationName || t("sales_rep.hub.title")),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
  { title: customer.value?.organizationName ?? "" },
]);

// Profile blocks are rendered from a registry (not hardcoded markup) so the drag-and-drop /
// saved-layout story (VCST-5367) becomes "reorder + persist this list" — no template rework.
// Every block takes the same `organizationId` prop. `aside` stays empty until the Customer info /
// Quick actions widgets land in follow-up stories.
type ProfileBlockType = { id: string; component: Component; column: "main" | "aside" };

const CustomerProfileWidgets = defineAsyncComponent(() => import("../components/customer-profile-widgets.vue"));
const CustomerProfileOrders = defineAsyncComponent(() => import("../components/customer-profile-orders.vue"));

const blocks: ProfileBlockType[] = [{ id: "orders", component: CustomerProfileOrders, column: "main" }];

const mainBlocks = computed(() => blocks.filter((block) => block.column === "main"));
const asideBlocks = computed(() => blocks.filter((block) => block.column === "aside"));
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). Vertical
// rhythm between the breadcrumbs / title / layout is owned by the account/company shell that wraps
// the page (`flex flex-col gap-y-5`), so this root sets none.
.customer-profile {
  &__title {
    @apply [word-break:break-word];
  }

  &__layout {
    @apply flex flex-col gap-5 lg:flex-row lg:items-start;
  }

  &__main {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__aside {
    @apply flex flex-col gap-5 lg:w-80 lg:shrink-0;
  }

  &__block {
    @apply min-w-0;
  }
}
</style>
