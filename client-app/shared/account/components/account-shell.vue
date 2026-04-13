<template>
  <VcContainer>
    <VcLayout>
      <template v-if="!$route.meta?.hideLeftSidebar" #sidebar>
        <AccountNavigation class="max-md:hidden" />
      </template>

      <router-view class="account-shell__content" />
    </VcLayout>
  </VcContainer>
</template>

<script setup lang="ts">
import AccountNavigation from "./account-navigation.vue";
</script>

<style lang="scss">
.account-shell {
  &__content {
    @apply relative flex flex-col gap-y-5;
  }
}
</style>
