<template>
  <div class="space-y-6">
    <VcWidget :title="$t(`shared.account.navigation.main_title`)" size="sm">
      <component
        :is="(link.id && accountLinkComponents[link.id]?.component) || LinkDefault"
        v-for="link in filteredDesktopAccountMenuItems"
        :key="link.id"
        :item="link"
      />
    </VcWidget>

    <VcWidget v-if="isCorporateMember" :title="$t(`shared.account.navigation.corporate_title`)" size="sm">
      <component
        :is="(link.id && accountLinkComponents[link.id]?.component) || LinkDefault"
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
import { useComponentsRegistry } from "@/shared/common/composables";
import LinkDefault from "./account-navigation-link-components/link-default.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

const { isCorporateMember } = useUser();

const { desktopAccountMenuItems, desktopCorporateMenuItems } = useNavigations();
const { accountLinkComponents } = useComponentsRegistry();

function canShowItem(item: ExtendedMenuLinkType) {
  return !(item.id === "addresses" && isCorporateMember.value);
}

const filteredDesktopAccountMenuItems = computed(() => {
  return desktopAccountMenuItems.value?.children ? desktopAccountMenuItems.value?.children.filter(canShowItem) : [];
});
</script>
