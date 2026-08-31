<template>
  <div class="activity-row">
    <span class="activity-row__icon">
      <VcIcon :name="icon" :size="16" aria-hidden="true" />
    </span>

    <div class="activity-row__content">
      <div class="activity-row__primary">
        <template v-if="item.type === 'orderPlaced'">
          <span>{{ t("sales_rep.activity.rows.order_placed") }}</span>

          <VcLink
            v-if="item.orderId"
            class="activity-row__link"
            :to="{ name: 'OrderDetails', params: { orderId: item.orderId } }"
            target="_blank"
            rel="noopener noreferrer"
          >
            #{{ item.orderNumber }}
          </VcLink>

          <span v-if="!compact && item.orderTotal" class="activity-row__total">{{ item.orderTotal }}</span>

          <OrderStatus
            v-if="!compact && item.statusDisplayValue"
            :status="item.status"
            :display-value="item.statusDisplayValue"
          />
        </template>

        <template v-else-if="item.type === 'customerAssigned'">
          <span>{{ t("sales_rep.activity.rows.customer_assigned") }}</span>

          <span v-if="item.organizationName" class="activity-row__emphasis">{{ item.organizationName }}</span>
        </template>

        <template v-else-if="item.type === 'search'">
          <span>{{ t("sales_rep.activity.rows.searched_for") }}</span>

          <VcLink v-if="item.searchTerm" class="activity-row__link" :to="searchRoute"> “{{ item.searchTerm }}” </VcLink>

          <span v-if="item.count > 1" class="activity-row__count">
            {{ t("sales_rep.activity.rows.count_suffix", { count: item.count }) }}
          </span>
        </template>

        <template v-else-if="item.type === 'productView'">
          <span>{{ t("sales_rep.activity.rows.viewed_product") }}</span>

          <VcLink
            v-if="productRoute"
            class="activity-row__link"
            :to="productRoute"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ productLabel }}
          </VcLink>

          <span v-else class="activity-row__emphasis">{{ productLabel }}</span>

          <span v-if="item.count > 1" class="activity-row__count">
            {{ t("sales_rep.activity.rows.count_suffix", { count: item.count }) }}
          </span>
        </template>

        <template v-else-if="item.type === 'login'">
          <span>{{ t("sales_rep.activity.rows.logins", { count: formatStatCount(item.count) }, item.count) }}</span>
        </template>

        <!-- A type shipped by a later backend still renders as a dated row instead of a blank. -->
        <template v-else>
          <span>{{ t("sales_rep.activity.rows.unknown") }}</span>
        </template>
      </div>

      <div class="activity-row__meta">
        <span v-if="showOrganization && item.organizationName" class="activity-row__org">
          {{ item.organizationName }}
        </span>

        <!-- Hour-bucket rows never render as an exact moment: compact rows carry a "~", full rows the
             "during the hour of …" phrasing. -->
        <span class="activity-row__time">{{ timeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { QueryParamName } from "@/core/enums";
import { getProductRoute } from "@/core/utilities/product";
import { ROUTES } from "@/router/routes/constants";
import { activityCategoryIcon, formatHourLabel, formatStatCount, formatTimeAgo } from "../utils";
import type { SalesRepActivityItemType } from "../types";
import OrderStatus from "@/shared/account/components/order-status.vue";

interface IProps {
  item: SalesRepActivityItemType;
  // Compact rows (dashboard widget): relative time, no status/total.
  showOrganization?: boolean;
  compact?: boolean;
}

const props = defineProps<IProps>();

const { t, d } = useI18n();

const icon = computed(() => activityCategoryIcon(props.item.category));

// The catalog search results page, exactly as the header search navigates (VCST-5731).
const searchRoute = computed(() => ({
  name: ROUTES.SEARCH.NAME,
  query: { [QueryParamName.SearchPhrase]: props.item.searchTerm },
}));

// Link by id (the /product/{id} route always resolves); an unresolved code leaves productId empty,
// so such a row stays plain text.
const productRoute = computed(() => (props.item.productId ? getProductRoute(props.item.productId) : undefined));

// GA-tracked name first, the code as the stable fallback (unresolvable codes still carry it).
const productLabel = computed(() => props.item.productName || props.item.productCode);

const timeLabel = computed(() => {
  const occurredAt = new Date(props.item.occurredAt);

  if (props.compact) {
    const ago = formatTimeAgo(props.item.occurredAt);
    return props.item.precision === "hour" ? `~${ago}` : ago;
  }

  return props.item.precision === "hour"
    ? t("sales_rep.activity.time.during_hour", { date: d(occurredAt), time: formatHourLabel(props.item.occurredAt) })
    : d(occurredAt, "long");
});
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.activity-row {
  @apply flex items-start gap-3 py-3;

  &__icon {
    @apply flex size-8 flex-none items-center justify-center rounded-full bg-neutral-100 text-neutral-500;
  }

  &__content {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  &__primary {
    @apply flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm [word-break:break-word];
  }

  &__link {
    @apply font-medium text-[--link-color] hover:underline;
  }

  &__emphasis {
    @apply font-medium;
  }

  &__total {
    @apply font-medium;
  }

  &__count {
    @apply text-neutral-500;
  }

  &__meta {
    @apply flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500;
  }

  &__org {
    @apply after:ms-1.5 after:content-['·'] last:after:content-none;
  }
}
</style>
