<template>
  <Head>
    <link rel="icon" :href="$cfg.favicon_image" />
  </Head>
  <div v-if="loaded" class="min-h-screen flex flex-col font-lato">
    <Header />
    <div class="flex-grow flex flex-col">
      <RouterView />
    </div>
    <Footer />
    <PopupHost />
    <NotificationsHost />
  </div>
  <div v-else></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Head } from "@vueuse/head";
import { Header, Footer, useSearchBar } from "./shared/layout";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { themeContext } from "@/core/utilities";
import { setCatalogId, setUserId, setLocale, setCurrencyCode } from "@/core/constants";
import { PopupHost } from "@/shared/popup";
import { NotificationsHost } from "@/shared/notification";
import { RouteRecordName, useRouter } from "vue-router";
import { useCurrency } from "@core/composables";
import { i18n } from "./i18n";

const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { me, isAuthenticated } = useUser();
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

  // // Load user if needed (used during SSR)
  // if (!me.value.id) {
  //   await loadMe();
  // }

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
  // await loadMe();

  // FIXME
  // temporary solution
  setUserId(themeContext.userId || me.value?.id);
  setCatalogId(themeContext.catalogId!);
  setLocale(
    themeContext.availLanguages?.find((x) => x.twoLetterLanguageName === i18n?.global.locale.value)?.cultureName ||
      "en-US"
  );
  setCurrencyCode(currentCurrency.value.code);

  await loadMyCart();
  loaded.value = true;
});
</script>
