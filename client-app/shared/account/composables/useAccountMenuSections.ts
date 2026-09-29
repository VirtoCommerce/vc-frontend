import { cloneDeep } from "lodash-es";
import { computed } from "vue";
import { useNavigations } from "@/core/composables";
import { getTranslatedMenuLink } from "@/core/utilities";
import { useUser } from "@/shared/account/composables/useUser";
import type { ExtendedMenuLinkType } from "@/core/types";

export type AccountMenuSectionType = {
  id: string;
  title?: string;
  priority: number;
  children: ExtendedMenuLinkType[];
};

// The account menu has two presentations — the left rail inside the account
// (account-navigation.vue) and the header's avatar dropdown — and they must not drift apart: a
// section a module adds has to show up in both. This is that source, lifted verbatim from the
// rail. Only the dropdown reads it today; pointing the rail at it is a separate change, because
// that one has to re-test the rail's navigation and this one does not.
export function useAccountMenuSections() {
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
  // own visibility rule, as one priority-ordered list.
  const sections = computed<AccountMenuSectionType[]>(() => {
    const result: AccountMenuSectionType[] = [];

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

  return { sections };
}
