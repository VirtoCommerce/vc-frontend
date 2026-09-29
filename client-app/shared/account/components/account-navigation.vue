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
    const translated = getTranslatedMenuLink({
      title: section.title,
      icon: section.icon,
      children: section.children,
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
  // A nav hover is a neutral tint, so the secondary fill is left to say "you are here" and
  // nothing else. Dark brightens instead: see dark/shared/account/account-navigation.
  --vc-menu-item-hover-bg: theme("colors.neutral.100");

  // One construction for every side rail in the theme: this is the catalog's facet card, built from
  // the widget's own knobs rather than from a second pile of `.vc-widget` overrides. The numbers are
  // the design's (Ilya, 23.09.2026): a 16 card on the plate's surface, 20 of inset, a heading led
  // tight over a hairline with 6 above the rule and 10 below it, and rows that spend the last 10 of
  // that inset themselves, so the current item's plate reaches within 10 of the card's edge instead
  // of stopping 20 short.
  --vc-widget-radius: 1rem;
  --vc-widget-bg-color: var(--footer-top-bg-color, #fffdf9);
  --vc-widget-shadow: var(--plate-shadow, theme("boxShadow.md"));
  --vc-widget-header-padding-x: 1.25rem;
  --vc-widget-header-padding-y: 1.25rem 0.375rem;
  --vc-widget-header-min-height: 0px;
  --vc-widget-title-font-size: theme("fontSize.lg");
  --vc-menu-item-padding-x: 0.625rem;

  @apply flex flex-col;

  // 20, the step the facet rail keeps between its cards — not the page's step between plates: these
  // are cards on one rail, and the wider gap read as an empty line between them.
  gap: theme("spacing.5");

  &__container {
    // The rows carry the rest of the card's inset themselves, so the current item's plate reaches
    // within 10 of the edge while its label still sits on the heading's vertical. The widget's own
    // `--vc-widget-padding-*` cannot do it: this block is handed in through `default-container`,
    // which replaces the slot those knobs pad.
    @apply flex flex-col p-2.5;
  }
}
</style>
