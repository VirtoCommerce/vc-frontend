<template>
  <AccountNavigationItem :item="item">
    <div v-if="isOrdersPage && statusFacet?.items" class="account-navigation-orders">
      <VcMenuItem
        v-for="facet in statusFacet.items"
        :key="facet.term"
        :active="isSelectedOrderStatus(facet.term)"
        class="account-navigation-orders__item"
        size="xs"
        color="secondary"
        @click="applyOrderFilter(facet.term)"
      >
        <template #prepend>
          <VcIcon class="account-navigation-orders__icon" size="xs" name="minus" />
        </template>

        {{ facet.label }}

        <template #append>
          <VcBadge variant="outline" size="xs" color="secondary" rounded>
            {{ facet.count }}
          </VcBadge>
        </template>
      </VcMenuItem>
    </div>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useRoute } from "vue-router";
import { STATUS_ORDERS_FACET_NAME } from "@/core/constants";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import { useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const item = toRef(props, "item");

const route = useRoute();
const { facets } = useUserOrders({});

const isOrdersPage = computed(() => route.name === "Orders");
const { filterData, applyFilters } = useUserOrdersFilter();

const statusFacet = computed(() => facets.value?.find((facet) => facet.name === STATUS_ORDERS_FACET_NAME));

function isSelectedOrderStatus(status: string): boolean {
  return filterData.value.statuses.indexOf(status) !== -1;
}

function applyOrderFilter(status: string): void {
  filterData.value.statuses = [status];
  applyFilters();
}
</script>

<style lang="scss">
.account-navigation-orders {
  @apply py-2 pr-2 pl-2.5 space-y-0.5;

  &__item {
    @apply rounded;
  }
}
</style>
