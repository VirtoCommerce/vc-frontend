<template>
  <div class="account-navigation">
    <VcWidget v-for="section in sections" :key="section.id" :title="section.title" size="sm">
      <template #default-container>
        <div class="account-navigation__container">
          <ExtensionPoint
            v-for="link in section.children"
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
import { cloneDeep } from "lodash-es";
import { computed } from "vue";
import { useNavigations } from "@/core/composables";
import { getTranslatedMenuLink } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import LinkDefault from "./account-navigation-link-components/link-default.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

type RenderSectionType = { id: string; title?: string; priority: number; children: ExtendedMenuLinkType[] };

const { isCorporateMember } = useUser();
const {
  desktopPurchasingMenuItems,
  desktopMarketingMenuItems,
  desktopUserMenuItems,
  desktopCorporateMenuItems,
  registeredAccountSections,
} = useNavigations();

// Addresses live under the User widget only for personal accounts; corporate members manage them
// under Company info instead.
function canShowUserItem(item: ExtendedMenuLinkType) {
  return !(item.id === "addresses" && isCorporateMember.value);
}

// The built-in sections plus any module-registered ones (e.g. the Sales Rep hub), each keeping its
// own visibility rule, rendered as one priority-ordered list of widgets.
const sections = computed<RenderSectionType[]>(() => {
  const result: RenderSectionType[] = [];

  const purchasing = desktopPurchasingMenuItems.value;
  if (purchasing) {
    result.push({
      id: "purchasing",
      title: purchasing.title,
      priority: purchasing.priority ?? 10,
      children: purchasing.children ?? [],
    });
  }

  const marketing = desktopMarketingMenuItems.value;
  if (marketing?.children?.length) {
    result.push({
      id: "marketing",
      title: marketing.title,
      priority: marketing.priority ?? 20,
      children: marketing.children,
    });
  }

  if (isCorporateMember.value) {
    const corporate = desktopCorporateMenuItems.value;
    if (corporate) {
      result.push({
        id: "corporate",
        title: corporate.title,
        priority: corporate.priority ?? 30,
        children: corporate.children ?? [],
      });
    }
  }

  const user = desktopUserMenuItems.value;
  if (user) {
    result.push({
      id: "user",
      title: user.title,
      priority: user.priority ?? 40,
      children: (user.children ?? []).filter(canShowUserItem),
    });
  }

  for (const section of registeredAccountSections.value) {
    if (section.isVisible && !section.isVisible.value) {
      continue;
    }
    // Registered sections carry raw i18n keys; translate to match the built-in getters. Clone first —
    // getTranslatedMenuLink mutates in place, and these objects are shared registry state.
    const translated = getTranslatedMenuLink({
      title: section.title,
      icon: section.icon,
      children: cloneDeep(section.children),
    });
    result.push({
      id: section.id,
      title: translated.title,
      priority: section.priority ?? 100,
      children: translated.children ?? [],
    });
  }

  return result.sort((a, b) => a.priority - b.priority);
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
