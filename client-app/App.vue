<template>
  <div class="min-h-screen flex flex-col font-lato">
    <Header />
    <div class="flex-grow flex flex-col">
      <RouterView />
    </div>
    <Footer />
    <PopupHost />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Header, Footer } from "./shared/layout";
import { useUser } from "@/shared/account";
import { useCart } from "@/shared/cart";
import { useContext } from "@/shared/context";
import { setUserId } from "@/core/constants";
import { PopupHost } from "@/shared/popup";
import { useRouter } from "vue-router";

const { loadMe, me, isAuthenticated } = useUser();
const { loadMyCart } = useCart();
const { loadContext, themeContext } = useContext();
const { beforeEach } = useRouter();

beforeEach(async (to) => {
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

  setUserId(themeContext.value?.userId || me.value?.id);
  await loadMyCart();
});
</script>
