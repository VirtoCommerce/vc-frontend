<template>
  <component :is="layout">
    <RouterView />
  </component>

  <ModalHost />
  <NotificationsHost />
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { computedEager } from "@vueuse/core";
import { markRaw, onMounted, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { setupBroadcastGlobalListeners } from "@/broadcast";
import { useNavigations } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import { ModalHost } from "@/shared/modal";
import { NotificationsHost } from "@/shared/notification";
import { MainLayout, SecureLayout, useSearchBar } from "./shared/layout";
import type { Component } from "vue";

/** NOTE: As an example, here is the code for getting the settings from Liquid work context. */
const _props = withDefaults(defineProps<{ settings?: string }>(), { settings: "{}" });
const _settings = JSON.parse(_props.settings); // eslint-disable-line @typescript-eslint/no-unused-vars

const route = useRoute();
const router = useRouter();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();
const { whiteLabelingSettings, fetchWhiteLabelingSettings } = useWhiteLabeling();
const { fetchMenus } = useNavigations();

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

useHead({
  link: [
    {
      rel: "shortcut icon",
      href: "/static/icons/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/static/icons/favicon-16x16.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/static/icons/favicon-32x32.png",
    },
    {
      rel: "manifest",
      href: "/static/manifest.json",
    },
  ],
});

void fetchMenus();
void fetchWhiteLabelingSettings();

watchEffect(() => {
  if (whiteLabelingSettings.value?.favicons?.length) {
    useHead({
      link: whiteLabelingSettings.value.favicons,
    });
  }
});

onMounted(setupBroadcastGlobalListeners);
</script>

<style lang="scss">
@import "assets/styles/main.scss";
</style>
