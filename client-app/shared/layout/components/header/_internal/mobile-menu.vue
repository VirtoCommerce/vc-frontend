<template>
  <div
    class="fixed z-50 w-full h-screen flex flex-col bg-[color:var(--color-mobile-menu-bg)] text-[color:var(--color-mobile-menu-link)]"
  >
    <header class="px-6 flex justify-between items-center h-14 flex-shrink-0">
      <router-link to="/" @click="$emit('close')">
        <VcImage src="/static/images/common/logo-white.svg" class="h-9" is-lazy />
      </router-link>

      <!-- Language block -->
      <LanguageSelector v-if="$context.availLanguages && $context.availLanguages.length > 1" />

      <button class="appearance-none py-2 px-4 -mr-4" @click="$emit('close')">
        <i class="fas fa-times text-2xl text-[color:var(--color-primary)]" />
      </button>
    </header>

    <!-- region Children links section -->
    <section v-if="openedItem" class="grow overflow-y-auto pb-16 divide-y divide-white divide-opacity-20">
      <div class="flex flex-col py-6 px-10">
        <button class="appearance-none self-start" @click="goBack">
          <i class="fas fa-arrow-circle-left text-[2.5rem]" />
        </button>

        <h2 v-if="openedItem?.title" class="uppercase text-white text-2xl mt-7">
          {{ openedItem?.title }}
        </h2>

        <div class="space-y-8 mt-8">
          <MobileMenuLink
            v-for="childrenItem in openedItem?.children"
            :key="childrenItem.title"
            :to="childrenItem.route"
            :icon="childrenItem.icon"
            :title="childrenItem.title"
            :is-parent="!!childrenItem.children?.length"
            class="text-xl font-bold"
            @close="$emit('close')"
            @select="selectMenuItem(childrenItem)"
          >
            <!-- Icon for categories -->
            <template #icon="{ isActive }" v-if="openedItem?.id === 'all-products-menu'">
              <svg
                :class="['shrink-0 scale-150 ml-0.5 mr-3.5', { 'text-[color:var(--color-primary)]': isActive }]"
                height="20"
                width="20"
              >
                <use href="/static/images/common/cube.svg#main" />
              </svg>
            </template>

            <!-- Logout -->
            <div v-if="childrenItem.id === 'logout'" class="flex items-center">
              <template v-if="me.contact?.fullName">
                <span>{{ me.contact.fullName }}</span>
                <span class="font-normal text-base mx-2.5">•</span>
              </template>

              <a
                href="#"
                @click.prevent="signOut"
                class="text-[color:var(--color-primary)]"
                v-t="'shared.layout.header.link_logout'"
              />
            </div>

            <!-- Currency setting -->
            <div v-else-if="childrenItem.id === 'currency-setting'" class="flex flex-col grow font-normal space-y-1">
              <h2 class="uppercase text-white text-2xl mb-1">
                {{ $t("shared.layout.header.mobile.currency") }}
              </h2>

              <VcRadioButton
                v-for="currencyItem in $context.availCurrencies"
                :model-value="currentCurrency.code"
                :key="currencyItem.code"
                :value="currencyItem.code"
                class="py-2.5"
                @click="currentCurrency.code === currencyItem.code ? null : setCurrencyByCode(currencyItem.code)"
              >
                <span :class="{ 'text-white': currentCurrency.code === currencyItem.code }" class="uppercase">
                  {{ currencyItem.code }}
                </span>
              </VcRadioButton>
            </div>
          </MobileMenuLink>
        </div>
      </div>
    </section>
    <!-- endregion Children links section -->

    <!-- region Main menu section -->
    <section v-else class="flex-grow overflow-y-auto pb-16 divide-y divide-white divide-opacity-20">
      <div class="flex flex-col space-y-8 py-8 px-10">
        <MobileMenuLink
          v-for="item in mainMenuLinks"
          :key="item.title"
          :to="item.route"
          :icon="item.icon"
          :title="item.title"
          :is-parent="!!item.children?.length"
          class="uppercase text-xl font-bold"
          @close="$emit('close')"
          @select="selectMenuItem(item)"
        >
          <template v-if="item.id === 'checkout'">
            <div class="flex items-center">
              <span>{{ item.title }}</span>

              <div
                v-if="cart?.itemsQuantity"
                class="flex items-center rounded-2xl border border-[color:var(--color-primary)] px-2 font-bold text-sm h-6 ml-3"
              >
                {{ cart.itemsQuantity }}
              </div>
            </div>
          </template>

          <template v-else-if="item.id === 'compare'">
            <div class="flex items-center">
              <span>{{ item.title }}</span>

              <div
                v-if="productsIds.length"
                class="flex items-center rounded-2xl border border-[color:var(--color-primary)] px-2 font-bold text-sm h-6 ml-3"
              >
                {{ productsIds.length }}
              </div>
            </div>
          </template>
        </MobileMenuLink>
      </div>

      <div class="flex flex-col space-y-8 py-8 px-10">
        <template v-if="isAuthenticated">
          <!-- My account link -->
          <MobileMenuLink
            :title="accountMenuLink.title"
            class="uppercase text-xl font-bold"
            is-parent
            @select="selectMenuItem(accountMenuLink)"
          />

          <!-- Corporate link -- >
          TODO: Will be used in future. Commented due to acceptance criteria
          <MobileMenuLink
            :title="corporateMenuLink.title"
            class="uppercase text-xl font-bold"
            is-parent
            @select="selectMenuItem(corporateMenuLink)"
          />
          -->
        </template>

        <!-- Unauthorized links -->
        <MobileMenuLink
          v-else
          v-for="item in unauthorizedMenuLinks"
          :key="item.title"
          :to="item.route"
          :title="item.title"
          class="uppercase text-xl font-bold"
          @close="$emit('close')"
        />

        <!-- Settings link -->
        <MobileMenuLink
          v-if="$context.availCurrencies && $context.availCurrencies.length > 1"
          class="uppercase text-xl font-bold"
          is-parent
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
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { VcImage, VcRadioButton } from "@/components";
import { useCart } from "@/shared/cart";
import { useUser } from "@/shared/account";
import { LanguageSelector, MenuLink, useNavigations } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useCurrency } from "@core/composables";
import MobileMenuLink from "./mobile-menu-link.vue";

defineEmits(["close"]);

const route = useRoute();
const { t } = useI18n();
const { cart } = useCart();
const { productsIds } = useCompareProducts();
const { currentCurrency, setCurrencyByCode } = useCurrency();
const { me, isAuthenticated, signMeOut } = useUser();
const { mainMenuLinks, openedItem, selectMenuItem, goBack, goMainMenu } = useNavigations();

const unauthorizedMenuLinks: MenuLink[] = [
  { route: { name: "SignIn" }, title: t("shared.layout.header.link_sign_in") },
  { route: { name: "SignUp" }, title: t("shared.layout.header.link_register_now") },
];

const accountMenuLink: MenuLink = {
  id: "account",
  route: { name: "Account" },
  title: t("shared.layout.header.mobile.my_account"),
  children: [
    {
      route: { name: "Dashboard" },
      title: t("shared.layout.header.mobile.account_menu.dashboard"),
      icon: "/static/images/dashboard/icons/dashboard.svg#main",
    },
    {
      route: { name: "Profile" },
      title: t("shared.layout.header.mobile.account_menu.profile"),
      icon: "/static/images/dashboard/icons/profile.svg#main",
    },
    {
      route: { name: "Addresses" },
      title: t("shared.layout.header.mobile.account_menu.addresses"),
      icon: "/static/images/dashboard/icons/building.svg#main",
    },
    {
      route: { name: "Orders" },
      title: t("shared.layout.header.mobile.account_menu.orders"),
      icon: "/static/images/dashboard/icons/orders.svg#main",
    },
    {
      route: { name: "Lists" },
      title: t("shared.layout.header.mobile.account_menu.your_lists"),
      icon: "/static/images/dashboard/icons/list.svg#main",
    },
    {
      route: { name: "CheckoutDefaults" },
      title: t("shared.layout.header.mobile.account_menu.checkout_defaults"),
      icon: "/static/images/dashboard/icons/check-circle.svg#main",
    },
    {
      id: "logout",
      icon: "/static/images/common/user-circle.svg#main",
    },
  ],
};

/*
const corporateMenuLink: MenuLink = {
  id: "corporate",
  title: "Corporate",
  children: [
    {
      route: { name: "Company" },
      title: "Profile",
      icon: "/static/images/dashboard/icons/company.svg#main",
    },
    {
      route: { name: "CompanyMembers" },
      title: "Members",
      icon: "/static/images/dashboard/icons/members.svg#main",
    },
  ],
};
*/

const settingsMenuLink: MenuLink = {
  id: "settings",
  children: [{ id: "currency-setting" }], // see implementation in template
};

const allProductsMenuLink = computed<MenuLink | undefined>(() =>
  mainMenuLinks.value.find((item) => item.id === "all-products-menu")
);

async function signOut() {
  await signMeOut();
  location.href = "/";
}

onMounted(() => {
  const matchedRouteNames = route.matched.map((item) => item.name);
  let preSelectedLink: MenuLink | undefined;

  goMainMenu();

  if (["Catalog", "Product"].some((item) => matchedRouteNames.includes(item))) {
    preSelectedLink = allProductsMenuLink.value;
  } else if (matchedRouteNames.includes("Account")) {
    preSelectedLink = accountMenuLink;
  }

  if (preSelectedLink) {
    selectMenuItem(preSelectedLink);
  }
});
</script>
