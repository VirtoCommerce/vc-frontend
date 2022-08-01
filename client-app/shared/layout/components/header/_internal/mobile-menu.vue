<template>
  <div
    class="fixed z-50 w-full h-screen flex flex-col bg-[color:var(--color-mobile-menu-bg)] text-[color:var(--color-mobile-menu-link)]"
  >
    <header class="px-6 flex justify-between items-center h-14 flex-shrink-0">
      <VcImage :src="$cfg.logo_inverted_image" class="h-9" lazy />

      <!-- Language block -->
      <LanguageSelector v-if="supportedLocales.length > 1" class="sm:ml-auto sm:mr-6" />

      <button class="appearance-none py-2 px-4 -mr-4" @click="$emit('close')">
        <svg class="text-[color:var(--color-primary)]" height="20" width="20">
          <use href="/static/images/close.svg#main" />
        </svg>
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
                height="36"
                width="36"
              >
                <use href="/static/images/common/cube.svg#main" />
              </svg>
            </template>

            <!-- Logout -->
            <div v-if="childrenItem.id === 'logout'" class="flex items-center">
              <template v-if="user.contact?.fullName">
                <span>{{ user.contact.fullName }}</span>
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
          </MobileMenuLink>
        </div>
      </div>
    </section>
    <!-- endregion Children links section -->

    <!-- region Main menu section -->
    <section v-else class="flex-grow overflow-y-auto pb-16 divide-y divide-white divide-opacity-20">
      <div class="flex flex-col space-y-5 mt-2 py-8 px-9">
        <MobileMenuLink
          v-for="item in mobileHeaderMenuLinks"
          :key="item.title"
          :to="item.route"
          :icon="item.icon"
          :title="item.title"
          :is-parent="!!item.children?.length"
          class="text-2xl"
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

      <div class="flex flex-col space-y-5 py-8 px-9">
        <template v-if="isAuthenticated">
          <!-- Account link -->
          <MobileMenuLink
            v-if="mobileAccountMenuLink"
            :title="mobileAccountMenuLink.title"
            :icon="mobileAccountMenuLink.icon"
            class="text-2xl"
            is-parent
            @select="selectMenuItem(mobileAccountMenuLink!)"
          />

          <!-- Corporate link -->
          <MobileMenuLink
            v-if="mobileCorporateMenuLink && organization"
            :title="mobileCorporateMenuLink.title"
            :icon="mobileCorporateMenuLink.icon"
            class="text-2xl"
            is-parent
            @select="selectMenuItem(mobileCorporateMenuLink!)"
          />
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
          v-if="supportedCurrencies.length > 1"
          :icon="settingsMenuLink.icon"
          class="text-2xl"
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
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCart } from "@/shared/cart";
import { useUser } from "@/shared/account";
import { LanguageSelector, MenuLink, useNavigations } from "@/shared/layout";
import { useCompareProducts } from "@/shared/compare";
import { useCurrency, useLanguages } from "@/core/composables";
import MobileMenuLink from "./mobile-menu-link.vue";

defineEmits(["close"]);

const { t } = useI18n();
const { cart } = useCart();
const { productsIds } = useCompareProducts();
const { supportedLocales } = useLanguages();
const { currentCurrency, supportedCurrencies, saveCurrencyCodeAndReload } = useCurrency();
const { user, isAuthenticated, organization, signMeOut } = useUser();
const {
  mobileHeaderMenuLinks,
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
