<template>
  <Head>
    <link rel="icon" :href="$cfg.favicon_image" />
  </Head>

  <component :is="layout">
    <RouterView />
  </component>

  <ModalHost />
  <NotificationsHost />
</template>

<script setup lang="ts">
import { Head } from "@unhead/vue/components";
import { computedEager } from "@vueuse/core";
import { markRaw, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { setupBroadcastGlobalListeners } from "@/broadcast";
import { useNavigations } from "@/core/composables";
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

void fetchMenus();

onMounted(setupBroadcastGlobalListeners);
</script>
