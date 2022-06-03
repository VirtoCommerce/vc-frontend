<template>
  <PageHead>
    <link rel="icon" :href="$cfg.favicon_image" />
    <body class="font-lato" :class="{ 'touch-none': !isBodyScrollable, 'overflow-hidden': !isBodyScrollable }" />
  </PageHead>

  <component :is="layout">
    <RouterView />
  </component>

  <PopupHost />
  <NotificationsHost />
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { markRaw } from "vue";
import { breakpointsTailwind, eagerComputed, invoke, useBreakpoints } from "@vueuse/core";
import { Head as PageHead } from "@vueuse/head";
import { MainLayout, PaymentLayout, useSearchBar } from "./shared/layout";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { setCatalogId, setUserId, setLocale, setCurrencyCode } from "@/core/constants";
import { PopupHost } from "@/shared/popup";
import { NotificationsHost } from "@/shared/notification";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { useCurrency, useLanguages, useThemeContext, useDomUtils } from "@core/composables";

const route = useRoute();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { currentLanguage } = useLanguages();
const { themeContext } = useThemeContext();
const { isAuthenticated } = useUser();
const { loadMyCart } = useCart();
const { currentCurrency } = useCurrency();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { isBodyScrollable } = useDomUtils();

const isMobile = breakpoints.smaller("lg");

const layouts: Record<NonNullable<typeof route.meta.layout>, Component> = {
  Main: markRaw(MainLayout),
  Payment: markRaw(PaymentLayout),
};

const layout = eagerComputed(() => {
  const layoutName = route.meta?.layout;
  return layoutName ? layouts[layoutName] : layouts.Main;
});

router.beforeEach(async (to) => {
  // Hiding the search bar or search results dropdown
  if (to.name !== "Search") {
    await hideSearchBar();
  } else if (!isMobile.value) {
    await hideSearchDropdown();
  }

  // Make Dashboard the default Home page for authorized users
  if (Array<RouteRecordName>("Home", "SignIn", "SignUp").includes(to.name!) && isAuthenticated.value) {
    return {
      name: "Dashboard",
    };
  }

  // Protect account routes
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return {
      name: "SignIn",
      // save the location we were at to come back later
      query: { redirect: to.fullPath },
    };
  }
});

invoke(async () => {
  // FIXME: temporary solution (ST-2072)
  setUserId(themeContext.value!.userId);
  setCatalogId(themeContext.value!.catalogId);
  setLocale(currentLanguage.value!.cultureName);
  setCurrencyCode(currentCurrency.value!.code);

  await loadMyCart();
});
</script>
