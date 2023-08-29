<template>
  <VcContainer v-if="getLayout($route) === 'Main'" :class="{ 'lg:pt-8': !$route.meta?.hideLeftSidebar }">
    <div class="flex gap-x-6">
      <!-- First column-->
      <div v-if="!$route.meta?.hideLeftSidebar" class="hidden w-2/6 max-w-[236px] shrink-0 flex-col gap-y-6 lg:flex">
        <AccountNavigation />
      </div>

      <!-- Second column-->
      <router-view class="flex w-full min-w-0 flex-col gap-y-5" />
    </div>
  </VcContainer>

  <router-view v-else />
</template>

<script setup lang="ts">
import { getLayout } from "@/core/utilities";
import AccountNavigation from "./account-navigation.vue";
</script>
