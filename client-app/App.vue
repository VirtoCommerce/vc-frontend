<template>
  <div class="min-h-screen flex flex-col font-lato">
    <Header />
    <div class="flex-grow flex flex-col">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Header, Footer } from "./shared/layout";
import { useCart } from "@/shared/cart";
import { useContext } from "@/shared/context";

const { loadMyCart } = useCart();
const { loadContext } = useContext();
loadMyCart();
loadContext();
</script>
