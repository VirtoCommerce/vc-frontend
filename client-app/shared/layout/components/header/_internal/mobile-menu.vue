<template>
  <nav
    class="fixed z-50 flex size-full flex-col bg-[color:var(--color-mobile-menu-bg)] text-[color:var(--color-mobile-menu-link)]"
  >
    <header class="flex h-16 shrink-0 items-center gap-x-3 px-6">
      <div class="grow pr-6">
        <span v-if="organization" class="line-clamp-2 text-xl font-medium italic leading-[22px] text-white">
          {{ organization?.name }}
        </span>

        <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="max-h-9" lazy />
      </div>

      <!-- Language block -->
      <LanguageSelector v-if="supportedLocales.length > 1" />

      <button type="button" class="-mr-4 appearance-none p-4" @click="$emit('close')">
        <svg class="text-[color:var(--color-primary)]" height="20" width="20">
          <use href="/static/images/close.svg#main" />
        </svg>
      </button>
    </header>

    <!-- region Children links section -->
    <section v-if="openedItem" class="grow divide-y divide-white divide-opacity-20 overflow-y-auto">
      <div class="flex flex-col px-10 py-6">
        <button type="button" class="appearance-none self-start text-[--color-accent-100]" @click="goBack">
          <VcIcon name="arrow-circle-left" size="lg" />
        </button>

        <h2 v-if="openedItem?.title" class="mt-5 text-2xl uppercase tracking-[0.01em] text-white">
          {{ openedItem?.title }}
        </h2>

        <ul class="mt-4 flex flex-col gap-y-2">
          <li v-for="childItem in openedItem?.children" :key="childItem.title">
            <!-- Currency setting -->
            <div v-if="childItem.id === 'currency-setting'" class="flex grow flex-col gap-y-1 font-normal">
              <header class="-mt-1 mb-1 text-2xl uppercase text-white">
                {{ $t("shared.layout.header.mobile.currency") }}
              </header>

              <VcRadioButton
                v-for="currencyItem in supportedCurrencies"
                :key="currencyItem.code"
                :model-value="currentCurrency?.code"
                :value="currencyItem.code"
                class="py-2.5"
                @click="
                  currentCurrency?.code === currencyItem.code ? null : saveCurrencyCodeAndReload(currencyItem.code)
                "
              >
                <span :class="{ 'text-white': currentCurrency?.code === currencyItem.code }" class="uppercase">
                  {{ currencyItem.code }}
                </span>
              </VcRadioButton>
            </div>

            <!-- TODO: Remove rendering by condition -->
            <MobileMenuLink
              v-else-if="
                (childItem.id !== 'quotes' || $cfg.quotes_enabled) &&
                (childItem.id !== 'addresses' || !isCorporateMember)
              "
              :link="childItem"
              class="py-1 text-lg"
              @close="$emit('close')"
              @select="selectMenuItem(childItem)"
            >
              {{ childItem.title }}
            </MobileMenuLink>
          </li>
        </ul>

        <template v-if="openedItem?.isCatalogItem && openedItem?.route">
          <div class="my-5 h-px bg-gradient-to-r from-[--color-accent-500] to-transparent"></div>

          <router-link
            class="text-lg tracking-[0.01em] text-[--color-additional-50]"
            :to="openedItem.route"
            @click="$emit('close')"
          >
            {{ $t("shared.layout.header.mobile.view_all_catalog") }}
          </router-link>
        </template>
      </div>
    </section>
    <!-- endregion Children links section -->

    <!-- region Main menu section -->
    <section v-else class="grow divide-y divide-white divide-opacity-20 overflow-y-auto">
      <ul class="flex flex-col gap-y-2 px-9 py-6">
        <!-- Home link -->
        <li>
          <MobileMenuLink :link="homeMenuItem" class="py-1 text-2xl font-bold" @close="$emit('close')">
            {{ homeMenuItem.title }}
          </MobileMenuLink>
        </li>
        <li v-for="item in mobileMainMenuItems" :key="item.title">
          <MobileMenuLink
            v-if="item.id === 'cart'"
            :link="item"
            :count="cart?.itemsQuantity"
            class="py-1 text-2xl font-bold"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>

          <MobileMenuLink
            v-else-if="item.id === 'compare'"
            :link="item"
            :count="productsIds.length"
            class="py-1 text-2xl font-bold"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>

          <MobileMenuLink
            v-else
            :link="item"
            class="py-1 text-2xl font-bold"
            @close="$emit('close')"
            @select="selectMenuItem(item)"
          >
            {{ item.title }}
          </MobileMenuLink>
        </li>
      </ul>

      <div class="flex flex-col gap-y-2 px-9 py-6">
        <template v-if="isAuthenticated">
          <!-- Account -->
          <div class="mb-4 mt-2 flex flex-row gap-4 text-xl">
            <div
              class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-[--color-accent-300]"
            >
              <VcImage v-if="user.photoUrl" :src="user.photoUrl" :alt="user.contact?.fullName" class="size-12" lazy />
              <VcIcon v-else name="user" />
            </div>

            <div class="flex flex-col leading-tight">
              <div class="flex flex-wrap items-center gap-x-1 text-[color:var(--color-mobile-menu-link)]">
                <template v-if="operator">
                  <span class="line-clamp-3 font-bold [word-break:break-word]">
                    {{ operator.contact?.fullName || operator.userName }}
                  </span>

                  <span
                    v-t="'shared.layout.header.top_header.logged_in_as'"
                    class="text-[color:var(--color-mobile-menu-icon)]"
                  />
                </template>

                <span class="line-clamp-3 font-bold [word-break:break-word]">
                  {{ user.contact?.fullName || user.userName }}
                </span>
              </div>

              <div>
                <button
                  v-t="'shared.layout.header.link_logout'"
                  type="button"
                  class="font-bold text-[color:var(--color-primary)]"
                  @click="() => signMeOut()"
                />
              </div>
            </div>
          </div>

          <!-- Account link -->
          <ul>
            <li>
              <MobileMenuLink
                v-if="mobileAccountMenuItem"
                :link="mobileAccountMenuItem"
                class="py-1 text-2xl font-bold"
                @select="selectMenuItem(mobileAccountMenuItem!)"
              >
                {{ mobileAccountMenuItem.title }}
              </MobileMenuLink>
            </li>

            <!-- Corporate link -->
            <li>
              <MobileMenuLink
                v-if="mobileCorporateMenuItem && isCorporateMember"
                :link="mobileCorporateMenuItem"
                class="py-1 text-2xl font-bold"
                @select="selectMenuItem(mobileCorporateMenuItem!)"
              >
                {{ mobileCorporateMenuItem.title }}
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
          @select="selectMenuItem(settingsMenuItem)"
        >
          {{ $t("shared.layout.header.mobile.settings") }}
        </MobileMenuLink>
      </div>
    </section>
    <!-- endregion Main menu section -->
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency, useLanguages, useNavigations } from "@/core/composables";
import { useSignMeOut } from "@/shared/account/composables/useSignMeOut";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart/composables/useShortCart";
import { useCompareProducts } from "@/shared/compare";
import MobileMenuLink from "./mobile-menu-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import LanguageSelector from "@/shared/layout/components/language-selector/language-selector.vue";

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();

const { t } = useI18n();
const { cart } = useShortCart();
const { productsIds } = useCompareProducts();
const { supportedLocales } = useLanguages();
const { currentCurrency, supportedCurrencies, saveCurrencyCodeAndReload } = useCurrency();
const { user, operator, isAuthenticated, organization, isCorporateMember } = useUser();
const { signMeOut } = useSignMeOut();
const {
  mobileMainMenuItems,
  mobileAccountMenuItem,
  mobileCorporateMenuItem,
  mobilePreSelectedMenuItem,
  openedItem,
  selectMenuItem,
  goBack,
  goMainMenu,
} = useNavigations();

const unauthorizedMenuItems: ExtendedMenuLinkType[] = [
  { route: { name: "SignIn" }, title: t("shared.layout.header.link_sign_in") },
  { route: { name: "SignUp" }, title: t("shared.layout.header.link_register_now") },
];

const settingsMenuItem: ExtendedMenuLinkType = {
  id: "settings",
  icon: "/static/images/common/settings.svg#main",
  children: [{ id: "currency-setting" }], // see implementation in template
};

const homeMenuItem = computed<ExtendedMenuLinkType>(() =>
  isAuthenticated.value
    ? {
        route: { name: "Dashboard" },
        title: t("shared.layout.header.mobile.account_menu.dashboard"),
        icon: "/static/images/dashboard/icons/dashboard-main.svg#main",
      }
    : {
        route: "/",
        title: t("shared.layout.header.menu.home"),
        icon: "/static/images/dashboard/icons/dashboard.svg#main",
      },
);

onMounted(() => {
  goMainMenu();

  if (mobilePreSelectedMenuItem.value) {
    selectMenuItem(mobilePreSelectedMenuItem.value);
  }
});
</script>
