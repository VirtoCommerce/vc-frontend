<template>
  <AccountNavigationItem :item="item">
    <template v-if="isOrdersPage">
      <div
        v-for="facet in facets"
        :key="facet.term"
        class="flex items-center space-x-1 overflow-hidden text-ellipsis px-3 text-sm"
      >
        <VcIcon class="flex-none text-primary" name="minus" />

        <a
          :class="{ 'font-bold': isSelectedOrderStatus(facet.term) }"
          class="line-clamp-2 flex w-full cursor-pointer gap-1 py-0.5 hover:text-neutral-950"
          @click="applyOrderFilter(facet.term)"
        >
          <div class="grow overflow-hidden text-ellipsis text-nowrap">{{ facet.label }}</div>
          <VcBadge variant="outline" rounded>{{ facet.count }}</VcBadge>
        </a>
      </div>
    </template>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useRoute } from "vue-router";
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

function isSelectedOrderStatus(status: string): boolean {
  return filterData.value.statuses.indexOf(status) !== -1;
}

function applyOrderFilter(status: string): void {
  filterData.value.statuses = [status];
  applyFilters();
}
</script>
