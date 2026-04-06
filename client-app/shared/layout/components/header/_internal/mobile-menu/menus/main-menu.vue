<template>
  <section class="grow divide-y divide-additional-50 divide-opacity-20 overflow-y-auto">
    <ul class="flex flex-col gap-y-2 px-9 py-6">
      <li>
        <MobileMenuLink :link="menuItem" class="py-1 text-2xl font-bold" @close="$emit('close')">
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
          <LinkDefault :item="item" @close="$emit('close')" @select-item="$emit('selectItem', item)" />
        </ExtensionPoint>
      </li>
    </ul>

    <div class="flex flex-col gap-y-2 px-9 py-6">
      <template v-if="isAuthenticated">
        <!-- Account -->
        <div class="mb-4 mt-2 flex flex-row gap-4 text-xl">
          <div
            class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-accent-300"
          >
            <VcImage v-if="user.photoUrl" :src="user.photoUrl" :alt="user.contact?.fullName" class="size-12" lazy />

            <VcIcon v-else name="user" />
          </div>

          <div class="flex flex-col leading-tight">
            <div class="flex flex-wrap items-center gap-x-1 text-accent-100">
              <template v-if="operator">
                <span class="line-clamp-3 font-bold text-[--mobile-menu-text-color] [word-break:break-word]">
                  {{ operator.contact?.fullName || operator.userName }}
                </span>

                <span class="text-[--mobile-menu-text-color]">
                  {{ $t("shared.layout.header.top_header.logged_in_as") }}
                </span>
              </template>

              <span class="line-clamp-3 font-bold text-[--mobile-menu-text-color] [word-break:break-word]">
                {{ user.contact?.fullName || user.userName }}
              </span>
            </div>

            <div>
              <button type="button" class="font-bold text-[--mobile-menu-navigation-color]" @click="signMeOut">
                {{ $t("shared.layout.header.link_logout") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Account sections -->
        <ul class="flex flex-col gap-y-2">
          <!-- Purchasing -->
          <li>
            <MobileMenuLink
              v-if="mobilePurchasingMenuItem"
              :link="mobilePurchasingMenuItem"
              class="py-1 text-2xl font-bold"
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
              class="py-1 text-2xl font-bold"
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
              class="py-1 text-2xl font-bold"
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
              class="py-1 text-2xl font-bold"
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
            class="py-1.5 text-2xl font-bold"
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
        class="py-1 text-2xl font-bold"
        @select="$emit('selectItem', settingsMenuItem)"
      >
        {{ $t("shared.layout.header.mobile.settings") }}
      </MobileMenuLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useCurrency, useNavigations } from "@/core/composables";
import { ROUTES } from "@/router/routes/constants";
import { useSignMeOut, useUser } from "@/shared/account";
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
const {
  mobileMainMenuItems,
  mobilePurchasingMenuItem,
  mobileMarketingMenuItem,
  mobileUserMenuItem,
  mobileCorporateMenuItem,
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
