<template>
  <PageHead>
    <link rel="icon" :href="$cfg.favicon_image" />
    <body class="font-lato" />
  </PageHead>

  <component :is="layout">
    <RouterView />
  </component>

  <PopupHost />
  <NotificationsHost />
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { Head as PageHead } from "@vueuse/head";
import { markRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNavigations } from "@/core/composables";
import { useCart } from "@/shared/cart";
import { NotificationsHost } from "@/shared/notification";
import { PopupHost } from "@/shared/popup";
import { MainLayout, SecureLayout, useSearchBar } from "./shared/layout";
import type { Component } from "vue";

/** NOTE: As an example, here is the code for getting the settings from Liquid work context. */
const props = withDefaults(defineProps<{ settings?: string }>(), { settings: "{}" });
const settings = JSON.parse(props.settings); // eslint-disable-line @typescript-eslint/no-unused-vars

const route = useRoute();
const router = useRouter();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { fetchMenus } = useNavigations();
const { fetchCart } = useCart();

const layouts: Record<NonNullable<typeof route.meta.layout>, Component> = {
  Main: markRaw(MainLayout),
  Secure: markRaw(SecureLayout),
};

const layout = computedEager(() => layouts[route.meta?.layout ?? "Main"]);

router.beforeEach((to) => {
  // Hiding the drop-down list of search results
  hideSearchDropdown();

  // Hiding the search bar on mobile devices
  if (to.name !== "Search") {
    hideSearchBar();
  }
});

fetchMenus();
fetchCart();
</script>

<style lang="scss">
@import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
@import "@fortawesome/fontawesome-free/css/solid.min.css";
@import "@/assets/styles/main.scss";
</style>
