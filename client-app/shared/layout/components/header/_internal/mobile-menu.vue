<template>
  <nav class="mobile-menu fixed z-50 flex size-full flex-col bg-[--mobile-menu-bg-color] text-accent-200">
    <header class="flex h-16 shrink-0 items-center gap-x-3 px-6">
      <div class="grow pr-6">
        <span
          v-if="organization"
          class="line-clamp-2 text-xl font-medium italic leading-[22px] text-[--mobile-menu-text-color]"
        >
          {{ organization?.name }}
        </span>

        <VcImage v-else :src="$cfg.logo_inverted_image" :alt="$context.storeName" class="max-h-9" lazy />
      </div>

      <!-- Language block -->
      <LanguageSelector v-if="supportedLocales.length > 1" />

      <button type="button" class="-mr-4 appearance-none p-4" @click="$emit('close')">
        <svg class="text-primary" height="20" width="20">
          <use href="/static/images/close.svg#main" />
        </svg>
      </button>
    </header>

    <!-- region Children links section -->
    <section v-if="openedItem" class="grow divide-y divide-additional-50 divide-opacity-20 overflow-y-auto">
      <div class="flex flex-col px-10 py-6">
        <button type="button" class="appearance-none self-start text-[--color-accent-100]" @click="goBack">
          <VcIcon name="arrow-circle-left" size="lg" />
        </button>

        <h2 v-if="openedItem?.title" class="mt-5 text-2xl uppercase tracking-[0.01em] text-additional-50">
          {{ openedItem?.title }}
        </h2>

        <ul class="mt-4 flex flex-col gap-y-2">
          <li v-for="childItem in openedItem?.children" :key="childItem.title">
            <!-- Currency setting -->
            <div v-if="childItem.id === 'currency-setting'" class="flex grow flex-col gap-y-1 font-normal">
              <header class="-mt-1 mb-1 text-2xl uppercase text-additional-50">
                {{ $t("shared.layout.header.mobile.currency") }}
              </header>

              <VcRadioButton
                v-for="currencyItem in supportedCurrencies"
                :key="currencyItem.code"
                :model-value="currentCurrency?.code"
                :value="currencyItem.code"
                class="py-2.5"
                @click="currentCurrency?.code === currencyItem.code ? null : saveCurrencyCode(currencyItem.code)"
              >
                <span :class="{ 'text-additional-50': currentCurrency?.code === currencyItem.code }" class="uppercase">
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

          <a
            v-if="isExternalLink(openedItem.route)"
            class="view-all-link"
            :href="openedItem.route as string"
            target="_blank"
            @click="$emit('close')"
          >
            {{ $t("shared.layout.header.mobile.view_all_catalog") }}
          </a>
          <router-link v-else class="view-all-link" :to="openedItem.route" @click="$emit('close')">
            {{ $t("shared.layout.header.mobile.view_all_catalog") }}
          </router-link>
        </template>
      </div>
    </section>
    <!-- endregion Children links section -->

    <!-- region Main menu section -->
    <section v-else class="grow divide-y divide-additional-50 divide-opacity-20 overflow-y-auto">
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
              <div class="flex flex-wrap items-center gap-x-1 text-accent-100">
                <template v-if="operator">
                  <span class="line-clamp-3 font-bold [word-break:break-word]">
                    {{ operator.contact?.fullName || operator.userName }}
                  </span>

                  <span class="text-accent-200">
                    {{ $t("shared.layout.header.top_header.logged_in_as") }}
                  </span>
                </template>

                <span class="line-clamp-3 font-bold [word-break:break-word]">
                  {{ user.contact?.fullName || user.userName }}
                </span>
              </div>

              <div>
                <button type="button" class="font-bold text-primary" @click="() => signMeOut()">
                  {{ $t("shared.layout.header.link_logout") }}
                </button>
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
    <div
      class="mobile-menu__overlay fixed inset-y-0 right-0 hidden bg-black/5 backdrop-blur-lg md:block"
      @click="$emit('close')"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCurrency, useLanguages, useNavigations } from "@/core/composables";
import { getLinkAttr } from "@/core/utilities";
import { useSignMeOut, useUser } from "@/shared/account";
import { useShortCart } from "@/shared/cart";
import { useCompareProducts } from "@/shared/compare";
import MobileMenuLink from "./mobile-menu-link.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { RouteLocationRaw } from "vue-router";
import LanguageSelector from "@/shared/layout/components/language-selector/language-selector.vue";

interface IEmits {
  (event: "close"): void;
}

defineEmits<IEmits>();

const { t } = useI18n();
const { cart } = useShortCart();
const { productsIds } = useCompareProducts();
const { supportedLocales } = useLanguages();
const { currentCurrency, supportedCurrencies, saveCurrencyCode } = useCurrency();
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

function isExternalLink(link?: RouteLocationRaw) {
  return "externalLink" in getLinkAttr(link);
}

onMounted(() => {
  goMainMenu();

  if (mobilePreSelectedMenuItem.value) {
    selectMenuItem(mobilePreSelectedMenuItem.value);
  }
});
</script>

<style lang="scss" scoped>
.mobile-menu {
  --sidebar-max-width: 430px;
  box-shadow: 5px 0 15px 0 rgba(0, 0, 0, 0.5);

  @apply md:max-w-[var(--sidebar-max-width)];
}

.view-all-link {
  @apply text-lg tracking-[0.01em] text-[--color-additional-50];
}

.mobile-menu__overlay {
  @apply left-[var(--sidebar-max-width)];
}

.is-visible .mobile-menu__overlay {
  animation: fadeIn 0.4s forwards;
}

@keyframes fadeIn {
  from {
    @apply opacity-0;
  }
  to {
    @apply opacity-100;
  }
}
</style>
