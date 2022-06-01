<template>
  <Head>
    <link rel="icon" :href="$cfg.favicon_image" />
  </Head>
  <div v-if="loaded" class="min-h-screen-safe flex flex-col font-lato">
    <Header />
    <div class="flex-grow flex flex-col">
      <RouterView />
    </div>
    <VcFooter />
    <PopupHost />
    <NotificationsHost />
  </div>
  <div v-else></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Head } from "@vueuse/head";
import { VcHeader, VcFooter, useSearchBar } from "./shared/layout";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { setCatalogId, setUserId, setLocale, setCurrencyCode } from "@/core/constants";
import { PopupHost } from "@/shared/popup";
import { NotificationsHost } from "@/shared/notification";
import { RouteRecordName, useRouter } from "vue-router";
import { useCurrency, useLanguages, useThemeContext } from "@core/composables";

const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { currentLanguage } = useLanguages();
const { themeContext } = useThemeContext();
const { isAuthenticated } = useUser();
const { loadMyCart } = useCart();
const { currentCurrency } = useCurrency();
const { hideSearchBar, hideSearchDropdown } = useSearchBar();

const isMobile = breakpoints.smaller("lg");
const loaded = ref(false);

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

onMounted(async () => {
  // FIXME
  // temporary solution
  setUserId(themeContext.value!.userId);
  setCatalogId(themeContext.value!.catalogId);
  setLocale(currentLanguage.value!.cultureName);
  setCurrencyCode(currentCurrency.value!.code);

  await loadMyCart();
  loaded.value = true;
});
</script>
