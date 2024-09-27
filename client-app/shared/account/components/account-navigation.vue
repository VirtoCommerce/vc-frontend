<template>
  <div class="space-y-6">
    <VcWidget :title="$t(`shared.account.navigation.main_title`)" size="sm">
      <AccountNavigationLink
        v-for="link in filteredDesktopAccountMenuItems"
        :key="link.title"
        :to="link.route!"
        :text="link.title!"
        :icon="link.icon"
      >
        <template v-if="isOrdersPage && link.id === 'orders'">
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

        <template v-if="isListDetails && link.id === 'lists'">
          <div
            v-for="list in lists"
            :key="list.id"
            class="ml-4 flex items-center space-x-2 overflow-hidden text-ellipsis px-3 text-sm"
          >
            <VcIcon class="flex-none text-primary" name="minus" />

            <router-link
              :to="{ name: 'ListDetails', params: { listId: list.id } }"
              class="line-clamp-2 cursor-pointer py-0.5 font-bold text-neutral hover:text-additional-950"
              active-class="!text-neutral-950"
            >
              {{ list.name }}
            </router-link>
          </div>
        </template>
      </AccountNavigationLink>
    </VcWidget>

    <VcWidget v-if="isCorporateMember" :title="$t(`shared.account.navigation.corporate_title`)" size="sm">
      <AccountNavigationLink
        v-for="link in desktopCorporateMenuItems?.children"
        :key="link.id"
        :to="link.route"
        :text="link.title"
        :icon="link.icon"
      />
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { useUserOrders } from "@/shared/account/composables/useUserOrders";
import { useUserOrdersFilter } from "@/shared/account/composables/useUserOrdersFilter";
import { isActive as isPushMessagesActive } from "@/shared/push-messages/composables/usePushMessages";
import { useWishlists } from "@/shared/wishlists";
import AccountNavigationLink from "./account-navigation-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

const route = useRoute();
const { isCorporateMember } = useUser();
const { lists, fetchWishlists } = useWishlists();
const { facets } = useUserOrders({});
const { filterData, applyFilters } = useUserOrdersFilter();
const { desktopAccountMenuItems, desktopCorporateMenuItems } = useNavigations();

const isListDetails = eagerComputed(() => route.name === "ListDetails");
const isOrdersPage = eagerComputed(() => route.name === "Orders");

function canShowItem(item: ExtendedMenuLinkType) {
  if (isCorporateMember.value && item.id === "addresses") {
    return false;
  }

  return item.id !== "notifications" || isPushMessagesActive.value;
}

const filteredDesktopAccountMenuItems = computed(() => {
  return desktopAccountMenuItems.value?.children ? desktopAccountMenuItems.value?.children.filter(canShowItem) : [];
});

function isSelectedOrderStatus(status: string): boolean {
  return filterData.value.statuses.indexOf(status) !== -1;
}

function applyOrderFilter(status: string): void {
  filterData.value.statuses = [status];
  applyFilters();
}

watchEffect(async () => {
  if (isListDetails.value) {
    await fetchWishlists();
  }
});
</script>
