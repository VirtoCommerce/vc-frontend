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
        <!-- Statuses come from the list's facets, so every chip has orders. -->
        <div v-if="statuses.length" class="recent-orders-widget__filter">
          <fieldset
            v-if="editingTabs"
            :aria-label="$t('shared.account.dashboard.recent_orders.statuses_label')"
            class="recent-orders-widget__toggles"
          >
            <VcCheckbox
              v-for="rule in statusRules"
              :key="rule.name"
              size="sm"
              :model-value="!hiddenTabs.includes(rule.name)"
              @update:model-value="toggleTab(rule.name)"
            >
              {{ rule.label }}
            </VcCheckbox>
          </fieldset>

          <template v-else>
            <!-- "All": a boolean value never collides with a status.
                 `Boolean(true)` because `:value="true"` trips vue/prefer-true-attribute-shorthand. -->
            <VcTabSwitch size="sm" :value="Boolean(true)" :model-value="!status" @change="status = undefined">
              <span class="recent-orders-widget__label">
                {{ $t("shared.account.dashboard.recent_orders.filter_all") }}
              </span>
            </VcTabSwitch>

            <VcTabSwitch
              v-for="rule in visibleStatuses"
              :key="rule.name"
              size="sm"
              :value="rule.name"
              :model-value="status"
              @change="status = $event"
            >
              <span class="recent-orders-widget__label">{{ rule.label }}</span>
            </VcTabSwitch>
          </template>
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
            :skeleton-rows="rowLimit"
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
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { getOrders } from "@/core/api/graphql/orders";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { RECENT_ORDERS_DEFAULT_ROWS, STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { SortDirection } from "@/core/enums";
import { globals } from "@/core/globals";
import { Sort } from "@/core/types";
import { escapeFilterSyntaxValue, Logger } from "@/core/utilities";
import { toggleTabRule, useBlockChrome, visibleTabRules } from "@/shared/dashboard";
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

defineProps<IProps>();

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

const statusRules = computed(() => statuses.value.map((item) => ({ name: item.term, label: item.label })));

const editingTabs = computed(() => Boolean(chrome?.editing.value));
// Not pruned: the facet omits statuses that have no orders right now.
const hiddenTabs = computed(() => chrome?.settings.value.hiddenTabs ?? []);
// Chips change only on Save.
const savedHiddenTabs = computed(() => chrome?.savedSettings.value.hiddenTabs ?? []);

const visibleStatuses = computed(() => visibleTabRules(statusRules.value, savedHiddenTabs.value));
function toggleTab(name: string): void {
  chrome?.updateSettings({ hiddenTabs: toggleTabRule(hiddenTabs.value, name) });
}

// A save may hide the active status: fall back to "All".
watch(visibleStatuses, (rules) => {
  if (status.value && !rules.some((rule) => rule.name === status.value)) {
    status.value = undefined;
  }
});

let latest = 0;

// Index-backed like the Orders page: a new order shows once indexed, and cancelled ones are listed (cards skip them).
// The current store's orders only, as the cards count them and as the Sales Rep Hub lists them; the Orders page
// behind "All orders" keeps every store.
async function load(): Promise<void> {
  const request = ++latest;
  loading.value = true;

  try {
    const storeTerm = `storeid:"${escapeFilterSyntaxValue(globals.storeId)}"`;
    const statusTerms = getFilterExpression("", { statuses: status.value ? [status.value] : [], customerNames: [] });

    // The widget names its own failure, as the cards do, so the app-wide error notification stays quiet.
    const response = await getOrders(
      {
        first: rowLimit.value,
        sort: SORT,
        filter: [storeTerm, statusTerms].filter(Boolean).join(" "),
        facet: STATUS_ORDERS_FACET_NAME,
      },
      SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT,
    );

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

  // A fieldset is min-content wide by default; `min-w-0` lets the checkboxes wrap.
  &__toggles {
    @apply m-0 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-0 p-0;
  }

  &__content {
    @apply px-1.5 pb-3 pt-1;
  }

  &__all-link {
    @apply inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
