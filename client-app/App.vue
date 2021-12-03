<template>
  <div class="min-h-screen flex flex-col font-lato">
    <Header />
    <div class="flex-grow">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from "./shared/layout/components/header.vue";
import Footer from "./shared/layout/components/footer.vue";
</script>
