<template>
  <div class="identity-providers">
    <component
      :is="loadProviderComponent(providerName)"
      v-for="providerName in providers"
      :key="providerName"
      :return-url="returnUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { useMemoize } from "@vueuse/core";
import { defineAsyncComponent } from "vue";
import { Logger } from "@/core/utilities";
import type { Component } from "vue";

interface IProps {
  providers: string[];
  returnUrl: string;
}

defineProps<IProps>();

const loadProviderComponent = useMemoize(
  (providerName: string): Component =>
    defineAsyncComponent<Component>({
      loader: () => import(`./${providerName.toLowerCase()}-provider.vue`),
      // Renders nothing for a provider this theme does not ship, instead of leaving
      // the component pending forever.
      errorComponent: { render: () => null },
      onError(error, _retry, fail) {
        Logger.error(`Failed to load ${providerName} provider component`, error);
        fail();
      },
    }),
  { getKey: (providerName) => providerName.toLowerCase() },
);
</script>

<style lang="scss">
.identity-providers {
  @apply flex items-center gap-5 flex-col justify-center;
}
</style>
