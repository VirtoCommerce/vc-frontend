<template>
  <component :is="layout">
    <RouterView />
  </component>

  <ModalHost />
  <NotificationsHost />
  <EnvironmentBadge />
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { computedEager } from "@vueuse/core";
import { markRaw, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { setupBroadcastGlobalListeners } from "@/broadcast";
import { ModalHost } from "@/shared/modal";
import { NotificationsHost } from "@/shared/notification";
import { useWhiteLabeling } from "./core/composables";
import { SecureLayout, useSearchBar } from "./shared/layout";
import type { Component } from "vue";
import EnvironmentBadge from "@/shared/layout/components/environmentBadge/environment-badge.vue";
import MainLayout from "@/shared/layout/components/main-layout/main-layout.vue";

const route = useRoute();
const router = useRouter();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { favIcons } = useWhiteLabeling();

// if favIcons.value empty array - default favicon from index.html will be shown
useHead({ link: favIcons.value });

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

onMounted(setupBroadcastGlobalListeners);
</script>

<style lang="scss">
@use "assets/styles/main.scss";
</style>
