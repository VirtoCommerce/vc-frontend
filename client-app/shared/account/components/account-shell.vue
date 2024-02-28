<template>
  <VcContainer>
    <div class="flex gap-x-6">
      <!-- First column-->
      <AccountNavigation v-if="!$route.meta?.hideLeftSidebar" class="w-2/6 max-w-[236px] flex-none max-lg:hidden" />

      <!-- Second column-->
      <router-view class="relative flex w-full min-w-0 flex-col gap-y-5" />
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import AccountNavigation from "./account-navigation.vue";
</script>
