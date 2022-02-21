<template>
  <!-- Desktop header -->
  <div class="header hidden lg:block shadow-md">
    <!-- Top header -->
    <TopHeader />

    <!-- Bottom header-->
    <BottomHeader />
  </div>

  <!-- Mobile header -->
  <div class="lg:hidden fixed z-40 bg-white w-full border-b shadow-md">
    <div class="px-6 flex justify-between items-center h-14">
      <router-link to="/"><VcImage src="/static/images/common/logo.svg" class="h-9" /></router-link>
      <i class="fas fa-bars text-2xl text-yellow-500" @click="mobileMenuVisible = true"></i>
    </div>
  </div>

  <!-- Placeholder for correct padding due to fixed mobile menu -->
  <div class="lg:hidden h-14"></div>

  <!-- Mobile menu -->
  <MobileMenu v-if="mobileMenuVisible" @close="mobileMenuVisible = false" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@/components";
import TopHeader from "./_internal/top-header.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import MobileMenu from "./_internal/mobile-menu.vue";

const mobileMenuVisible = ref(false);
</script>
