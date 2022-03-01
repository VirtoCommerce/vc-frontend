<template>
  <div v-if="loaded" class="min-h-screen flex flex-col font-lato overflow-x-hidden">
    <Header />
    <div class="flex-grow flex flex-col">
      <RouterView />
    </div>
    <Footer />
    <PopupHost />
  </div>
  <div v-else></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { Header, Footer, useSearchBar } from "./shared/layout";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { useContext } from "@/shared/context";
import { setCatalogId, setUserId } from "@/core/constants";
import { PopupHost } from "@/shared/popup";
import { useRouter } from "vue-router";

const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { loadMe, me, isAuthenticated } = useUser();
const { loadMyCart } = useCart();
const { loadContext, themeContext } = useContext();
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

  // Load user if needed (used during SSR)
  if (!me.value.id) {
    await loadMe();
  }

  // Make Dashboard the default Home page for authorized users
  if (to.name === "Home" && isAuthenticated.value) {
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
  await loadMe();
  await loadContext();

  // FIXME
  // temporary solution
  setUserId(themeContext.value?.userId || me.value?.id);
  setCatalogId(themeContext.value.catalogId!);

  await loadMyCart();
  loaded.value = true;
});
</script>
