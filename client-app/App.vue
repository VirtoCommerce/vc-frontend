<template>
  <component :is="layout">
    <RouterView />
  </component>

  <ModalHost />
  <NotificationsHost />
  <EnvironmentBadge />

  <teleport to="body">
    <div id="popover-host"></div>
  </teleport>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { markRaw, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import favicon16 from "@/assets/icons/favicon-16x16.png";
import favicon32 from "@/assets/icons/favicon-32x32.png";
import faviconSVG from "@/assets/icons/favicon.svg";
import { setupBroadcastGlobalListeners } from "@/broadcast";
import { useSearchBar } from "@/shared/layout/composables/useSearchBar";
import { ModalHost } from "@/shared/modal";
import { NotificationsHost } from "@/shared/notification";
import { useWhiteLabeling } from "./core/composables";
import { SecureLayout } from "./shared/layout";
import type { Component } from "vue";
import EnvironmentBadge from "@/shared/layout/components/environmentBadge/environment-badge.vue";
import MainLayout from "@/shared/layout/components/main-layout/main-layout.vue";

const route = useRoute();
const router = useRouter();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { favIcons } = useWhiteLabeling();

// If favIcons.value is an empty array, the default favicon from index.html will be used.
// The favicon will also NOT be updated in PWA mode (in manifest.json).
useHead({
  link: favIcons.value?.length
    ? favIcons.value
    : [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: faviconSVG,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: favicon16,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: favicon32,
        },
      ],
});

const layouts: Record<NonNullable<typeof route.meta.layout>, Component> = {
  Main: markRaw(MainLayout),
  Secure: markRaw(SecureLayout),
};

const layout = computed(() => layouts[route.meta?.layout ?? "Main"]);

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

#popover-host {
  @apply absolute bottom-0 right-0 z-[9999] size-0;
}
</style>
