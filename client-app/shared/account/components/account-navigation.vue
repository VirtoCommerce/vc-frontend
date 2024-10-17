<template>
  <div class="space-y-6">
    <VcWidget :title="$t(`shared.account.navigation.main_title`)" size="sm">
      <component
        :is="(link.id && customLinkComponents[link.id]) || LinkDefault"
        v-for="link in filteredDesktopAccountMenuItems"
        :key="link.id"
        :item="link"
      />
    </VcWidget>

    <VcWidget v-if="isCorporateMember" :title="$t(`shared.account.navigation.corporate_title`)" size="sm">
      <component
        :is="(link.id && customLinkComponents[link.id]) || LinkDefault"
        v-for="link in desktopCorporateMenuItems?.children"
        :key="link.id"
        :item="link"
      />
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import { useCustomAccountLinkComponents } from "@/shared/layout/composables";
import LinkDefault from "./account-navigation-link-components/link-default.vue";
import LinkLists from "./account-navigation-link-components/link-lists.vue";
import LinkOrders from "./account-navigation-link-components/link-orders.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

const { isCorporateMember } = useUser();

const { desktopAccountMenuItems, desktopCorporateMenuItems } = useNavigations();
const { customLinkComponents, registerCustomLinkComponent } = useCustomAccountLinkComponents();

registerCustomLinkComponent({ id: "orders", component: LinkOrders });
registerCustomLinkComponent({ id: "lists", component: LinkLists });

function canShowItem(item: ExtendedMenuLinkType) {
  return !(item.id === "addresses" && isCorporateMember.value);
}

const filteredDesktopAccountMenuItems = computed(() => {
  return desktopAccountMenuItems.value?.children ? desktopAccountMenuItems.value?.children.filter(canShowItem) : [];
});
</script>
