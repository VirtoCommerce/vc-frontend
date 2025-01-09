<template>
  <VcContainer>
    <VcLayout>
      <template v-if="!$route.meta?.hideLeftSidebar" #sidebar>
        <AccountNavigation class="max-md:hidden" />
      </template>

      <router-view class="relative flex flex-col gap-y-5" />
    </VcLayout>
  </VcContainer>
</template>

<script setup lang="ts">
import AccountNavigation from "./account-navigation.vue";
</script>
