<template>
  <div class="bg-gray-100 grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex gap-x-5">
        <!-- First column-->
        <div v-if="!$route.meta?.hideNavigation" class="hidden lg:flex flex-col w-2/6 xl:w-1/5 gap-y-5">
          <AccountNavigation />
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full gap-y-5">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AccountNavigation } from "@/shared/account";
</script>
