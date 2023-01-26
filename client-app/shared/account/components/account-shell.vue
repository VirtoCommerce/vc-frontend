<template>
  <VcContainer :class="{ 'lg:pt-8': !$route.meta?.hideNavigation }">
    <div class="flex gap-x-6">
      <!-- First column-->
      <div v-if="!$route.meta?.hideNavigation" class="hidden shrink-0 lg:flex flex-col w-2/6 max-w-[236px] gap-y-6">
        <AccountNavigation />
      </div>

      <!-- Second column-->
      <router-view class="flex flex-col w-full min-w-0 gap-y-5" />
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
import { AccountNavigation } from "@/shared/account";
</script>
