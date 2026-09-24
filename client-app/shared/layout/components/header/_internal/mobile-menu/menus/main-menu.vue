<template>
  <Teleport to="body">
    <VcLoaderOverlay v-if="reverting" fixed-spinner data-test-id="mobile-back-to-operator-loader">
      {{ $t("shared.layout.header.top_header.switching_back") }}
    </VcLoaderOverlay>
  </Teleport>

  <section class="main-menu">
    <ul class="main-menu__list">
      <li>
        <MobileMenuLink :link="menuItem" big @close="$emit('close')">
          {{ menuItem.title }}
        </MobileMenuLink>
      </li>

      <li v-for="item in mobileMainMenuItems" :key="item.title">
        <ExtensionPoint
          category="mobileMenu"
          :name="item.id"
          :item="item"
          @close="$emit('close')"
          @select-item="$emit('selectItem', item)"
        >
          <template #default="{ extensionProps }">
            <LinkDefault
              :item="item"
              :count="toValue(extensionProps?.count)"
              @close="$emit('close')"
              @select-item="$emit('selectItem', item)"
            />
          </template>
        </ExtensionPoint>
      </li>
    </ul>

    <div class="main-menu__list main-menu__list--account">
      <template v-if="isAuthenticated">
        <!-- Account -->
        <div class="main-menu__user">
          <div
            class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-accent-300"
          >
            <VcImage v-if="user.photoUrl" :src="user.photoUrl" :alt="user.contact?.fullName" class="size-10" lazy />

            <VcIcon v-else name="user" />
          </div>

          <div
            class="line-clamp-3 flex flex-wrap items-center gap-x-1 text-[--mobile-menu-text-color] [word-break:break-word]"
          >
            <template v-if="operator">
              <span class="font-bold">
                {{ operator.contact?.fullName || operator.userName }}
              </span>

              {{ $t("shared.layout.header.top_header.logged_in_as") }}
            </template>

            <span class="font-bold">
              {{ user.contact?.fullName || user.userName }}
            </span>
          </div>
        </div>

        <div class="main-menu__actions">
          <button
            v-if="operator"
            type="button"
            class="main-menu__action main-menu__action--operator"
            data-test-id="mobile-back-to-operator-button"
            @click="onBackToOperator"
          >
            <VcIcon name="arrow-left" />

            <span>{{ backToOperatorLabel }}</span>
          </button>

          <button
            type="button"
            class="main-menu__action"
            data-test-id="mobile-account-menu-logout-row"
            @click="signMeOut"
          >
            <VcIcon name="logout" />

            <span>{{ $t("shared.layout.header.link_logout") }}</span>
          </button>
        </div>

        <!-- Account sections -->
        <ul class="flex flex-col gap-y-1">
          <!-- Registered sections (e.g. Sales Rep hub) always lead, in registration order. Mobile does
               NOT honor `priority` (desktop does): the built-ins below are hardcoded blocks, so there's
               no list to interleave into. Priority-aware mobile is deferred to the mobile-menu redesign.
               See AccountNavigationSectionType.priority. -->
          <li v-for="section in mobileRegisteredAccountSections" :key="section.id">
            <MobileMenuLink :link="section" big @select="$emit('selectItem', section)">
              {{ section.title }}
            </MobileMenuLink>
          </li>

          <!-- Purchasing -->
          <li>
            <MobileMenuLink
              v-if="mobilePurchasingMenuItem"
              :link="mobilePurchasingMenuItem"
              big
              @select="$emit('selectItem', mobilePurchasingMenuItem!)"
            >
              {{ mobilePurchasingMenuItem.title }}
            </MobileMenuLink>
          </li>

          <!-- Marketing -->
          <li>
            <MobileMenuLink
              v-if="mobileMarketingMenuItem && mobileMarketingMenuItem.children?.length"
              :link="mobileMarketingMenuItem"
              big
              @select="$emit('selectItem', mobileMarketingMenuItem!)"
            >
              {{ mobileMarketingMenuItem.title }}
            </MobileMenuLink>
          </li>

          <!-- Corporate -->
          <li>
            <MobileMenuLink
              v-if="mobileCorporateMenuItem && isCorporateMember"
              :link="mobileCorporateMenuItem"
              big
              @select="$emit('selectItem', mobileCorporateMenuItem!)"
            >
              {{ mobileCorporateMenuItem.title }}
            </MobileMenuLink>
          </li>

          <!-- User -->
          <li>
            <MobileMenuLink
              v-if="mobileUserMenuItem"
              :link="mobileUserMenuItem"
              big
              @select="$emit('selectItem', mobileUserMenuItem!)"
            >
              {{ mobileUserMenuItem.title }}
            </MobileMenuLink>
          </li>
        </ul>
      </template>

      <!-- Unauthorized links -->
      <ul v-else class="mb-1">
        <li>
          <MobileMenuLink
            v-for="item in unauthorizedMenuItems"
            :key="item.title"
            :link="item"
            big
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>
        </li>
      </ul>

      <!-- Settings link -->
      <MobileMenuLink
        v-if="supportedCurrencies.length > 1"
        :link="settingsMenuItem"
        big
        @select="$emit('selectItem', settingsMenuItem)"
      >
        {{ $t("shared.layout.header.mobile.settings") }}
      </MobileMenuLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { toValue } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency, useNavigations } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useImpersonate, useSignMeOut, useUser } from "@/shared/account";
import type { ExtendedMenuLinkType } from "@/core/types";
import LinkDefault from "@/shared/layout/components/header/_internal/mobile-menu/link-components/link-default.vue";
import MobileMenuLink from "@/shared/layout/components/header/_internal/mobile-menu/mobile-menu-link.vue";

interface IProps {
  menuItem: ExtendedMenuLinkType;
}

interface IEmits {
  (event: "close"): void;
  (event: "selectItem", item: ExtendedMenuLinkType): void;
}

defineEmits<IEmits>();
defineProps<IProps>();

const { signMeOut } = useSignMeOut();
const { user, operator, isAuthenticated, isCorporateMember } = useUser();
const { reverting, backToOperatorLabel, backToOperator: onBackToOperator } = useImpersonate();
const {
  mobileMainMenuItems,
  mobilePurchasingMenuItem,
  mobileMarketingMenuItem,
  mobileUserMenuItem,
  mobileCorporateMenuItem,
  mobileRegisteredAccountSections,
} = useNavigations();
const { t } = useI18n();
const { supportedCurrencies } = useCurrency();

const unauthorizedMenuItems: ExtendedMenuLinkType[] = [
  { route: { name: ROUTES.SIGN_IN.NAME }, title: t("shared.layout.header.link_sign_in") },
  { route: { name: "SignUp" }, title: t("shared.layout.header.link_register_now") },
];

const settingsMenuItem: ExtendedMenuLinkType = {
  id: "settings",
  icon: "cog",
  children: [{}],
};
</script>

<style lang="scss">
.main-menu {
  // The menu's outline: the store's own links, then — behind a hairline — who is signed in and
  // what their account holds. Both halves share the plate's inside (24), and the rows carry
  // their own height, so the list only spends what it needs.
  @apply grow overflow-y-auto;

  // The hairline between the store's links and the account block, drawn off the menu's own ink
  // rather than off additional-50: that step is white in light presets and near-black in dark
  // ones, so the rule vanished exactly where a dark plate needs it most.
  > * + * {
    border-top: 1px solid rgb(from var(--mobile-menu-text-color) r g b / 0.2);
  }

  &__list {
    @apply flex flex-col gap-y-1 px-6 pb-5 pt-3;

    &--account {
      @apply py-5;
    }
  }

  &__user {
    @apply mb-2 mt-1 flex flex-row items-center gap-3 font-geologica;

    color: var(--mobile-menu-text-color);
  }

  &__actions {
    @apply mb-4 flex justify-between gap-2;
  }

  &__action {
    @apply flex items-center gap-1.5 text-sm font-semibold;

    color: var(--mobile-menu-link-color);

    // Leaving impersonation is not the same act as signing out, and the design keeps it in the
    // menu's navigation ink so the two never read as one pair of buttons.
    &--operator {
      color: var(--mobile-menu-navigation-color);
    }
  }
}
</style>
