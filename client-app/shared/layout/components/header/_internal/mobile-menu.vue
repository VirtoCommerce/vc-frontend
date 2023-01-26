<template>
  <div
    class="fixed z-50 w-full h-screen flex flex-col bg-[color:var(--color-mobile-menu-bg)] text-[color:var(--color-mobile-menu-link)]"
  >
    <header class="px-6 flex items-center shrink-0 h-16 gap-x-3">
      <div class="grow pr-6">
        <span v-if="organization" class="line-clamp-2 text-white text-xl leading-[22px] font-medium italic">
          {{ organization?.name }}
        </span>

        <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="max-h-9" lazy />
      </div>

      <!-- Language block -->
      <LanguageSelector v-if="supportedLocales.length > 1" />

      <button class="appearance-none p-4 -mr-4" @click="$emit('close')">
        <svg class="text-[color:var(--color-primary)]" height="20" width="20">
          <use href="/static/images/close.svg#main" />
        </svg>
      </button>
    </header>

    <!-- region Children links section -->
    <section v-if="openedItem" class="grow overflow-y-auto divide-y divide-white divide-opacity-20">
      <div class="flex flex-col py-6 px-10">
        <button class="appearance-none self-start text-[color:var(--color-mobile-menu-icon)]" @click="goBack">
          <i class="fas fa-arrow-circle-left text-[2.5rem]" />
        </button>

        <h2 v-if="openedItem?.title" class="uppercase text-white text-2xl mt-3">
          {{ openedItem?.title }}
        </h2>

        <div class="flex flex-col gap-y-2 mt-4">
          <template v-for="childrenItem in openedItem?.children" :key="childrenItem.title">
            <!-- Currency setting -->
            <div v-if="childrenItem.id === 'currency-setting'" class="flex flex-col grow font-normal gap-y-1">
              <header class="uppercase text-white text-2xl -mt-1 mb-1">
                {{ $t("shared.layout.header.mobile.currency") }}
              </header>

              <VcRadioButton
                v-for="currencyItem in supportedCurrencies"
                :model-value="currentCurrency?.code"
                :key="currencyItem.code"
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
              v-else-if="childrenItem.id !== 'quotes' || $cfg.quotes_enabled"
              :link="childrenItem"
              class="text-xl py-1"
              @close="$emit('close')"
              @select="selectMenuItem(childrenItem)"
            >
              {{ childrenItem.title }}
            </MobileMenuLink>
          </template>
        </div>
      </div>
    </section>
    <!-- endregion Children links section -->

    <!-- region Main menu section -->
    <section v-else class="flex-grow overflow-y-auto divide-y divide-white divide-opacity-20">
      <div class="flex flex-col gap-y-2 py-6 px-9">
        <!-- Home link -->
        <MobileMenuLink :link="homeLink" class="text-2xl py-1" @close="$emit('close')">
          {{ homeLink.title }}
        </MobileMenuLink>

        <template v-for="item in mobileMainMenuLinks" :key="item.title">
          <MobileMenuLink
            v-if="item.id === 'cart'"
            :link="item"
            :count="cart?.itemsQuantity"
            class="text-2xl py-1"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>

          <MobileMenuLink
            v-else-if="item.id === 'compare'"
            :link="item"
            :count="productsIds.length"
            class="text-2xl py-1"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>

          <MobileMenuLink
            v-else
            :link="item"
            class="text-2xl py-1"
            @close="$emit('close')"
            @select="selectMenuItem(item)"
          >
            {{ item.title }}
          </MobileMenuLink>
        </template>
      </div>

      <div class="flex flex-col gap-y-2 py-6 px-9">
        <template v-if="isAuthenticated">
          <!-- Account -->
          <div class="flex flex-row gap-4 text-xl mt-2 mb-4">
            <div
              class="flex shrink-0 items-center justify-center h-12 w-12 overflow-hidden rounded-full ring-2 ring-[color:var(--color-mobile-menu-link)]"
            >
              <VcImage v-if="user.photoUrl" :src="user.photoUrl" :alt="user.contact?.fullName" class="h-12 w-12" lazy />
              <i v-else class="fa fa-user-alt text-2xl" />
            </div>

            <div class="flex flex-col leading-tight">
              <div class="flex flex-wrap items-center gap-x-1 text-[color:var(--color-mobile-menu-link)]">
                <template v-if="operator">
                  <span class="inline-block font-bold">
                    {{ operator.contact?.fullName || operator.userName }}
                  </span>

                  <span
                    class="inline-block text-[color:var(--color-mobile-menu-icon)]"
                    v-t="'shared.layout.header.top_header.logged_in_as'"
                  />
                </template>

                <span class="inline-block font-bold">
                  {{ user.contact?.fullName || user.userName }}
                </span>
              </div>

              <div>
                <button
                  @click="signOut"
                  class="font-bold text-[color:var(--color-primary)]"
                  v-t="'shared.layout.header.link_logout'"
                />
              </div>
            </div>
          </div>

          <!-- Account link -->
          <MobileMenuLink
            v-if="mobileAccountMenuLink"
            :link="mobileAccountMenuLink"
            class="text-2xl py-1"
            @select="selectMenuItem(mobileAccountMenuLink!)"
          >
            {{ mobileAccountMenuLink.title }}
          </MobileMenuLink>

          <!-- Corporate link -->
          <MobileMenuLink
            v-if="mobileCorporateMenuLink && organization"
            :link="mobileCorporateMenuLink"
            class="text-2xl py-1"
            @select="selectMenuItem(mobileCorporateMenuLink!)"
          >
            {{ mobileCorporateMenuLink.title }}
          </MobileMenuLink>
        </template>

        <!-- Unauthorized links -->
        <div v-else class="mb-1">
          <MobileMenuLink
            v-for="item in unauthorizedMenuLinks"
            :key="item.title"
            :link="item"
            class="text-2xl py-1.5"
            @close="$emit('close')"
          >
            {{ item.title }}
          </MobileMenuLink>
        </div>

        <!-- Settings link -->
        <MobileMenuLink
          v-if="supportedCurrencies.length > 1"
          :link="settingsMenuLink"
          class="text-2xl py-1"
          @select="selectMenuItem(settingsMenuLink)"
        >
          {{ $t("shared.layout.header.mobile.settings") }}
        </MobileMenuLink>
      </div>
    </section>
    <!-- endregion Main menu section -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCart } from "@/shared/cart";
import { useUser } from "@/shared/account";
import { LanguageSelector } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { MenuLink, useCurrency, useLanguages, useNavigations } from "@/core";
import MobileMenuLink from "./mobile-menu-link.vue";

defineEmits(["close"]);

const { t } = useI18n();
const { cart } = useCart();
const { productsIds } = useCompareProducts();
const { supportedLocales } = useLanguages();
const { currentCurrency, supportedCurrencies, saveCurrencyCodeAndReload } = useCurrency();
const { user, operator, isAuthenticated, organization, signMeOut } = useUser();
const {
  mobileMainMenuLinks,
  mobileAccountMenuLink,
  mobileCorporateMenuLink,
  mobilePreSelectedMenuLink,
  openedItem,
  selectMenuItem,
  goBack,
  goMainMenu,
} = useNavigations();

const unauthorizedMenuLinks: MenuLink[] = [
  { route: { name: "SignIn" }, title: t("shared.layout.header.link_sign_in") },
  { route: { name: "SignUp" }, title: t("shared.layout.header.link_register_now") },
];

const settingsMenuLink: MenuLink = {
  id: "settings",
  icon: "/static/images/common/settings.svg#main",
  children: [{ id: "currency-setting" }], // see implementation in template
};

const homeLink = computed<MenuLink>(() =>
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
      }
);

async function signOut() {
  await signMeOut();
  location.href = "/";
}

onMounted(() => {
  goMainMenu();

  if (mobilePreSelectedMenuLink.value) {
    selectMenuItem(mobilePreSelectedMenuLink.value);
  }
});
</script>
