<template>
  <AccountNavigationItem :item="item">
    <div v-if="isOrdersPage && statusFacet?.items" class="account-navigation-orders">
      <button
        v-for="facet in statusFacet.items"
        :key="facet.term"
        type="button"
        class="account-navigation-orders__item"
        :class="{ 'account-navigation-orders__item--active': isSelectedOrderStatus(facet.term) }"
        @click="applyOrderFilter(facet.term)"
      >
        <VcIcon class="account-navigation-orders__icon fill-primary" size="xs" name="minus" />

        <span class="account-navigation-orders__label">{{ facet.label }}</span>

        <VcBadge variant="outline" size="xs" rounded>
          {{ facet.count }}
        </VcBadge>
      </button>
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
  @apply py-2 px-2.5 space-y-0.5;

  &__item {
    @apply flex w-full cursor-pointer items-center gap-2 py-0.5 text-sm px-1.5 rounded;

    &--active {
      @apply font-bold bg-secondary-100;
    }

    &:hover:not(&--active) {
      @apply bg-secondary-50;
    }
  }

  &__icon {
    @apply flex-none;
  }

  &__label {
    @apply line-clamp-2 grow overflow-hidden text-ellipsis text-nowrap text-start;
  }
}
</style>
