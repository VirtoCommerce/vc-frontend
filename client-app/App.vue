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
import { breakpointsTailwind, eagerComputed, useBreakpoints } from "@vueuse/core";
import { Head as PageHead } from "@vueuse/head";
import { MainLayout, PaymentLayout, useNavigations, useSearchBar } from "./shared/layout";
import { PopupHost } from "@/shared/popup";
import { NotificationsHost } from "@/shared/notification";
import { useRoute, useRouter } from "vue-router";
import { useDomUtils, useLanguages } from "@/core/composables";
import { useCart } from "@/shared/cart";
import { useCategories } from "@/shared/catalog";

const route = useRoute();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { fetchCategoriesTree } = useCategories();
const { isBodyScrollable } = useDomUtils();
const { currentLanguage } = useLanguages();
const { fetchMenus } = useNavigations();
const { fetchCart } = useCart();

const isMobile = breakpoints.smaller("lg");

const layouts: Record<NonNullable<typeof route.meta.layout>, Component> = {
  Main: markRaw(MainLayout),
  Payment: markRaw(PaymentLayout),
};

const layout = eagerComputed(() => layouts[route.meta?.layout ?? "Main"]);

router.beforeEach(async (to) => {
  // Animated hiding of the search bar or dropdown list of search results
  if (to.name !== "Search") {
    await hideSearchBar();
  } else if (!isMobile.value) {
    await hideSearchDropdown();
  }
});

fetchMenus(currentLanguage.value.cultureName);
fetchCategoriesTree();
fetchCart();
</script>

<style lang="scss">
@import "@fortawesome/fontawesome-free/css/all.css";
@import "@/assets/styles/main.scss";
</style>
