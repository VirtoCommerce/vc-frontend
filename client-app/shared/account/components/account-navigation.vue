<template>
  <div class="account-navigation">
    <VcWidget :title="$t(`shared.account.navigation.purchasing_title`)" size="sm">
      <template #default-container>
        <div class="account-navigation__container">
          <ExtensionPoint
            v-for="link in desktopPurchasingMenuItems?.children"
            :key="link.id"
            :item="link"
            category="accountMenu"
            :name="link.id"
          >
            <LinkDefault :item="link" />
          </ExtensionPoint>
        </div>
      </template>
    </VcWidget>

    <VcWidget
      v-if="desktopMarketingMenuItems?.children?.length"
      :title="$t(`shared.account.navigation.marketing_title`)"
      size="sm"
    >
      <template #default-container>
        <div class="account-navigation__container">
          <ExtensionPoint
            v-for="link in desktopMarketingMenuItems?.children"
            :key="link.id"
            :item="link"
            category="accountMenu"
            :name="link.id"
          >
            <LinkDefault :item="link" />
          </ExtensionPoint>
        </div>
      </template>
    </VcWidget>

    <VcWidget v-if="isCorporateMember" :title="$t(`shared.account.navigation.corporate_title`)" size="sm">
      <template #default-container>
        <div class="account-navigation__container">
          <ExtensionPoint
            v-for="link in desktopCorporateMenuItems?.children"
            :key="link.id"
            :item="link"
            category="accountMenu"
            :name="link.id"
          >
            <LinkDefault :item="link" />
          </ExtensionPoint>
        </div>
      </template>
    </VcWidget>

    <VcWidget :title="$t(`shared.account.navigation.user_title`)" size="sm">
      <template #default-container>
        <div class="account-navigation__container">
          <ExtensionPoint
            v-for="link in filteredDesktopUserMenuItems"
            :key="link.id"
            :item="link"
            category="accountMenu"
            :name="link.id"
          >
            <LinkDefault :item="link" />
          </ExtensionPoint>
        </div>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables/useUser";
import LinkDefault from "./account-navigation-link-components/link-default.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

const { isCorporateMember } = useUser();

const { desktopPurchasingMenuItems, desktopMarketingMenuItems, desktopUserMenuItems, desktopCorporateMenuItems } =
  useNavigations();

function canShowItem(item: ExtendedMenuLinkType) {
  return !(item.id === "addresses" && isCorporateMember.value);
}

const filteredDesktopUserMenuItems = computed(() => {
  return desktopUserMenuItems.value?.children ? desktopUserMenuItems.value.children.filter(canShowItem) : [];
});
</script>

<style lang="scss">
.account-navigation {
  @apply space-y-4;

  &__container {
    @apply pt-3 px-4 pb-4;
  }
}
</style>
