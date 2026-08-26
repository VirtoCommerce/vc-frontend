<template>
  <LayoutWidget :title="t('sales_rep.activity.customer.title')" size="md" class="customer-activity">
    <template #append>
      <VcLink :to="{ name: activitiesRouteName, query: { organizationId } }" class="customer-activity__all-link">
        {{ t("sales_rep.activity.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <VcEmptyView v-if="failed && !loading" :text="t('sales_rep.activity.customer.load_failed')" variant="error" />

    <VcEmptyView v-else-if="!summary && !loading" :text="t('sales_rep.activity.customer.empty')" icon="activity" />

    <dl v-else-if="summary" class="customer-activity__list">
      <div v-if="summary.createdOn" class="customer-activity__row">
        <dt class="customer-activity__label">
          <VcIcon class="customer-activity__icon" name="calendar" :size="15" />
          {{ t("sales_rep.activity.customer.created_on") }}
        </dt>

        <dd class="customer-activity__value">{{ $d(new Date(summary.createdOn)) }}</dd>
      </div>

      <!-- Distinct not-configured state for the GA-sourced rows: absent tracking must not read as
           "this customer never logs in / searches". Created on still shows — it comes from the DB. -->
      <div v-if="!summary.isAnalyticsConfigured" class="customer-activity__note">
        <VcIcon class="customer-activity__icon" name="circle-alert" :size="15" />
        {{ t("sales_rep.activity.customer.not_configured") }}
      </div>

      <template v-else>
        <div class="customer-activity__row">
          <dt class="customer-activity__label">
            <VcIcon class="customer-activity__icon" name="log-in" :size="15" />
            {{ t("sales_rep.activity.customer.last_web_login") }}
          </dt>

          <dd class="customer-activity__value">
            {{ summary.lastWebLogin ? $d(new Date(summary.lastWebLogin)) : "—" }}
          </dd>
        </div>

        <div class="customer-activity__row">
          <dt class="customer-activity__label">
            <VcIcon class="customer-activity__icon" name="activity" :size="15" />
            {{ t("sales_rep.activity.customer.visits") }}
          </dt>

          <dd class="customer-activity__value">{{ formatStatCount(summary.visitsCount) }}</dd>
        </div>

        <div class="customer-activity__row">
          <dt class="customer-activity__label">
            <VcIcon class="customer-activity__icon" name="search" :size="15" />
            {{ t("sales_rep.activity.customer.last_search_term") }}
          </dt>

          <dd class="customer-activity__value">
            <VcLink v-if="summary.lastSearchTerm" class="customer-activity__link" :to="searchRoute">
              “{{ summary.lastSearchTerm }}”
            </VcLink>

            <template v-else>—</template>
          </dd>
        </div>

        <div class="customer-activity__row">
          <dt class="customer-activity__label">
            <VcIcon class="customer-activity__icon" name="eye" :size="15" />
            {{ t("sales_rep.activity.customer.last_viewed_product") }}
          </dt>

          <dd class="customer-activity__value">
            <template v-if="summary.lastViewedProduct">
              <VcLink v-if="productRoute" class="customer-activity__link" :to="productRoute" target="_blank">
                {{ productLabel }}
              </VcLink>

              <template v-else>{{ productLabel }}</template>
            </template>

            <template v-else>—</template>
          </dd>
        </div>
      </template>
    </dl>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { QueryParamName } from "@/core/enums";
import { getProductRoute } from "@/core/utilities/product";
import { ROUTES } from "@/router/routes/constants";
import { useSalesRepCustomerActivitySummary } from "../composables/useSalesRepCustomerActivitySummary";
import { ACTIVITIES_ROUTE_NAME } from "../constants";
import { formatStatCount } from "../utils";
import LayoutWidget from "./layout-widget.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const activitiesRouteName = ACTIVITIES_ROUTE_NAME;

// Lifetime figures — the Activities page is where a rep narrows the period.
const { summary, loading, error } = useSalesRepCustomerActivitySummary(() => props.organizationId);

const failed = computed(() => Boolean(error.value));

// The catalog search results page, exactly as the header search navigates (VCST-5731).
const searchRoute = computed(() => ({
  name: ROUTES.SEARCH.NAME,
  query: { [QueryParamName.SearchPhrase]: summary.value?.lastSearchTerm },
}));

// Deep-link via slug when the backend resolved the code; an unresolved product stays plain text.
const productRoute = computed(() => {
  const product = summary.value?.lastViewedProduct;
  return product?.productId ? getProductRoute(product.productId, product.slug || undefined) : undefined;
});

// Code + name per the design; unresolvable codes still show the code alone.
const productLabel = computed(() => {
  const product = summary.value?.lastViewedProduct;
  if (!product) {
    return "";
  }
  return product.name ? `${product.code} · ${product.name}` : product.code;
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.customer-activity {
  &__row {
    @apply flex items-baseline justify-between gap-4 border-b border-neutral-100 py-3 last:border-b-0;
  }

  &__label {
    @apply flex flex-none items-center gap-2 text-sm text-neutral-500;
  }

  &__icon {
    @apply text-neutral-400;
  }

  &__value {
    @apply min-w-0 text-end text-sm font-medium text-neutral-900 [word-break:break-word];
  }

  &__link {
    @apply text-[--link-color] hover:underline;
  }

  &__note {
    @apply flex items-start gap-2 py-3 text-sm text-neutral-500;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
