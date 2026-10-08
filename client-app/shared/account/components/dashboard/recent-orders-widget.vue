<template>
  <LayoutWidget :title="title" size="md" class="recent-orders-widget">
    <template #append>
      <VcLink :to="{ name: 'Orders' }" class="recent-orders-widget__all-link">
        {{ $t("shared.account.dashboard.recent_orders.view_all") }}

        <VcIcon name="arrow-right" size="xs" />
      </VcLink>
    </template>

    <!-- VcWidget has no padding prop; #default-container is the seam for the inset. -->
    <template #default-container>
      <div class="recent-orders-widget__body">
        <!-- One chip per status the user's orders carry, from the list's own facets, so every chip has orders behind
             it. The facets are multi-select, so their counts stay put while a chip is selected. -->
        <div v-if="statuses.length" class="recent-orders-widget__filter">
          <!-- Baseline chip, active when no status is chosen. A boolean value, so no status can collide with it;
               `Boolean(true)` because `:value="true"` trips vue/prefer-true-attribute-shorthand. -->
          <VcTabSwitch size="sm" :value="Boolean(true)" :model-value="!status" @change="status = undefined">
            <span class="recent-orders-widget__label">
              {{ $t("shared.account.dashboard.recent_orders.filter_all") }}
            </span>
          </VcTabSwitch>

          <VcTabSwitch
            v-for="item in statuses"
            :key="item.term"
            size="sm"
            :value="item.term"
            :model-value="status"
            @change="status = $event"
          >
            <span class="recent-orders-widget__label">{{ item.label }}</span>

            <span
              :class="['recent-orders-widget__count', { 'recent-orders-widget__count--checked': status === item.term }]"
            >
              {{ formatStatCount(item.count) }}
            </span>
          </VcTabSwitch>
        </div>

        <div class="recent-orders-widget__content">
          <!-- A failure replaces the table: the previous rows would otherwise read as this filter's result. -->
          <VcEmptyView
            v-if="failed && !loading"
            :text="$t('shared.account.dashboard.recent_orders.load_failed')"
            variant="error"
          />

          <!-- With a status chosen, an empty list means "none in this status", not "never ordered". -->
          <VcEmptyView
            v-else-if="!orders.length && !loading && status"
            :text="$t('shared.account.dashboard.recent_orders.no_results')"
            icon="outline-order"
          />

          <VcEmptyView
            v-else-if="!orders.length && !loading"
            :text="$t('shared.account.dashboard.recent_orders.empty')"
            icon="outline-order"
          >
            <template #button>
              <VcButton v-if="continue_shopping_link" :external-link="continue_shopping_link">
                {{ $t("pages.account.orders.buttons.no_orders") }}
              </VcButton>

              <VcButton v-else to="/">
                {{ $t("pages.account.orders.buttons.no_orders") }}
              </VcButton>
            </template>
          </VcEmptyView>

          <OrdersTable
            v-else
            :loading="loading"
            :orders="orders"
            :pages="1"
            :page="1"
            hide-default-footer
            :bordered="false"
            order-scope="private"
            @row-click="goToOrderDetails"
          />
        </div>
      </div>
    </template>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { getOrders } from "@/core/api/graphql/orders";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { RECENT_ORDERS_DEFAULT_ROWS, STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { SortDirection } from "@/core/enums";
import { Sort } from "@/core/types";
import { Logger } from "@/core/utilities";
import { formatStatCount, useBlockChrome } from "@/shared/dashboard";
import { useOrderNavigation } from "../../composables/useOrderNavigation";
// The pure filter builder only: the composable in the same file keeps the Orders page's filter state.
import { getFilterExpression } from "../../composables/useUserOrdersFilter";
import OrdersTable from "../orders/orders-table.vue";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import LayoutWidget from "@/shared/dashboard/components/layout-widget.vue";

interface IProps {
  // Inside a layout the surface passes the block's title; LayoutWidget falls back to it otherwise.
  title?: string;
}

withDefaults(defineProps<IProps>(), {
  title: undefined,
});

type StatusTermType = { term: string; label: string; count: number };

// Newest first, as the Orders page lists them.
const SORT = new Sort("createdDate", SortDirection.Descending).toString();

const { goToOrderDetails } = useOrderNavigation();
const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

// Absent when the widget renders outside a layout. The saved cap, not the draft: it is a query variable, so it
// applies on save.
const chrome = useBlockChrome();
const rowLimit = computed(() => chrome?.savedSettings.value.maxRows ?? RECENT_ORDERS_DEFAULT_ROWS);

// `undefined` = every status: the baseline chip.
const status = ref<string>();

// Local state on purpose: `useUserOrders` keeps its facets module-global, shared with the Orders page, which this
// widget must not change.
const orders = shallowRef<CustomerOrderType[]>([]);
const statuses = shallowRef<StatusTermType[]>([]);
const loading = ref(false);
const failed = ref(false);

let latest = 0;

// Index-backed like the Orders page: a new order shows once indexed, and cancelled ones are listed (cards skip them).
async function load(): Promise<void> {
  const request = ++latest;
  loading.value = true;

  try {
    const response = await getOrders({
      first: rowLimit.value,
      sort: SORT,
      filter: getFilterExpression("", { statuses: status.value ? [status.value] : [], customerNames: [] }),
      facet: STATUS_ORDERS_FACET_NAME,
    });

    // A later chip or a saved row cap owns the widget now.
    if (request !== latest) {
      return;
    }

    // The query selects the fields the table renders; the cast is the one useUserOrders makes.
    orders.value = (response?.items ?? []) as CustomerOrderType[];
    statuses.value = response?.term_facets?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME)?.terms ?? [];
    failed.value = false;
  } catch (error) {
    if (request === latest) {
      Logger.error("[account dashboard] recent orders failed:", error);
      failed.value = true;
    }
  } finally {
    if (request === latest) {
      loading.value = false;
    }
  }
}

watch([rowLimit, status], load, { immediate: true });
</script>

<style lang="scss">
.recent-orders-widget {
  &__body {
    @apply flex flex-col;
  }

  // px-6 aligns the chips with the widget header title.
  &__filter {
    @apply flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-6 py-3;

    // The tab's accent-500 hover drops below WCAG AA in every preset (VCST-5890).
    --vc-tab-switch-hover-color: var(--color-neutral-900);
  }

  // Bold like the label beside it; only the selected chip's count is accented, so the others do not compete with it.
  // The widget's own selection drives the accent, not the kit's `--checked` class: the kit's classes are not ours.
  &__count {
    @apply font-bold text-neutral-600;

    &--checked {
      @apply text-primary-500;
    }
  }

  &__content {
    @apply px-1.5 pb-3 pt-1;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
