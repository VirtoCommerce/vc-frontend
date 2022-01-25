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

const { loadMe, me } = useUser();
const { loadMyCart } = useCart();
const { loadContext, themeContext } = useContext();

onMounted(async () => {
  await loadMe();
  await loadContext();

  setUserId(themeContext.value?.userId || me.value?.id);
  await loadMyCart();
});
</script>
