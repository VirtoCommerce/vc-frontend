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
import { MainLayout, PaymentLayout, useSearchBar } from "./shared/layout";
import { PopupHost } from "@/shared/popup";
import { NotificationsHost } from "@/shared/notification";
import { useRoute, useRouter } from "vue-router";
import { useCategories, useDomUtils, useNavigations } from "@/core";
import { useCart } from "@/shared/cart";

const props = defineProps({
  settings: {
    type: String,
    default: null,
  },
});

/**
 * NOTE: As an example, here is the code for getting the settings from Liquid work context.
 */
const settings = JSON.parse(props.settings); // eslint-disable-line @typescript-eslint/no-unused-vars

const route = useRoute();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { fetchCategories } = useCategories();
const { isBodyScrollable } = useDomUtils();
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

fetchMenus();
fetchCategories();
fetchCart();
</script>

<style lang="scss">
@import "@fortawesome/fontawesome-free/css/all.css";
@import "@/assets/styles/main.scss";
</style>
