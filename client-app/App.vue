<template>
  <metainfo></metainfo>
  <div class="min-h-screen flex flex-col">
    <Header />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useMeta } from "vue-meta";
import Header from "./shared/layout/components/header.vue";
import Footer from "./shared/layout/components/footer.vue";
useMeta({
  htmlAttrs: {
    class: "font-lato",
  },
});
</script>
