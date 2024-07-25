<template>
  <div class="identity-providers">
    <component :is="loadProviderComponent(providerName)" v-for="providerName in providers" :key="providerName" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineAsyncComponent } from "vue";
import { Logger } from "@/core/utilities";
import type { Component } from "vue";

defineProps<IProps>();

const loadProviderComponent = (providerName: string) => {
  return defineAsyncComponent<Component>({
    loader: () => import(`@/shared/sign-in/components/${providerName.toLowerCase()}-provider.vue`),
    onError(error) {
      Logger.error(`Failed to load ${providerName} provider component`, error);
      // fail();
    },
  });
};

interface IProps {
  providers: string[];
}
</script>

<style lang="scss">
.identity-providers {
  @apply flex items-center gap-5 justify-stretch;
}
</style>
